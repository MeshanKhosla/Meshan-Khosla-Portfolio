---
title: "Coffee Codex - Convex Client"
description: "Learning about the the convex.dev client"
pubDate: "July 26, 2025"
heroImage: "/coffee-codex/convex/cover.png"
---

## Introduction
I'm at North of Main Cafe in Bellevue, WA, and today I'm learning about how the client works in [convex.dev](https://www.convex.dev/). Convex has been getting pretty popular lately, so I wanted to create a demo app and attempt to reverse engineer it, similar to what I did with <a href='/blog/coffee-codex-twitch'>Twitch</a>. I'll focus on what I can see from the client side today, and then next time I'll dive into the server-side sync implementation and look into the code since it's open source.

![Coffee](/coffee-codex/convex/coffee.jpg)

## Demo app
To use Convex, I built a pretty simple queue app (see code [here](https://github.com/MeshanKhosla/convex-queue)) that allows users to create queues and then other users can join queues and manage their queue status. I built it in roughly an hour with the help of Cursor, which is pretty funny since it took me months to build something similar in [college](https://github.com/Berkeley-CS61B/simple-office-hours-queue). 

![Queue app gif](/coffee-codex/convex/queue-app.gif)

DX-wise, it was pretty good with the exception of the import data step in the [NextJS quickstart](https://docs.convex.dev/quickstart/nextjs), where I kept getting websocket errors. Nevertheless, I ended up defining a custom schema anyway so it wasn't too big of a deal.

## The Websocket connection
Ok, let's get to the fun part. One of the selling points of the Convex client is that data always stays in sync. There are other very cool aspects of Convex like transactional guarantees, but I want to leave those to the next post when I cover the Convex server.

![Websocket connection](/coffee-codex/convex/ws-conn.png)

I've configured it so my localhost app is pointing to the production Convex server so I can get a sense of the latency as well.

It looks like the first thing Convex does is send a message to the WS server to indicate an initial connection:
```json
{
    "connectionCount": 0,
    "lastCloseReason": "InitialConnect",
    "type": "Connect",
    "sessionId": "<session_id>"
}
```
I assume the session ID is the unique identifier that allows the Convex DB to know which client to communicate back to.

After that, the first thing that happens when we load a queue is we invoke [api.queues.getQueueWithItems](https://github.com/MeshanKhosla/convex-queue/blob/main/app/queues/%5BqueueId%5D/page.tsx#L17), which calls the [getQueuesWithItems](https://github.com/MeshanKhosla/convex-queue/blob/main/convex/queues.ts#L13) query with the specified queue ID (from the page params).

The WebSocket message looks like this:
```json
{
    "type": "ModifyQuerySet",
    "baseVersion": 0,
    "newVersion": 1,
    "modifications": [
        {
            "type": "Add",
            "queryId": 0,
            "udfPath": "queues:getQueueWithItems",
            "args": [
                {
                    "queueId": "<queue_id>"
                }
            ]
        }
    ]
}
```

The `udfPath` probably stands for "User Defined Function Path", which should be unique per application. This actually works very nicely with the TypeScript ecosystem since, because the UDFs are defined as exports, you won't be allowed to export two functions with the same name, very cool.

Interestingly, the key for this change is `modifications`, even though it should not make any modifications to the DB base since it is a query, other than to a cache. However, it is a `ModifyQuerySet`, so it's likely because we are making a modification to the data on the client by "refreshing" the client query. Let's see what an actual mutation looks like.

Before that, I noticed the server is sending a Ping every [15 seconds](https://github.com/get-convex/convex-js/blob/817ee167f95f0cdb83943cba3ed5fce9942bd7b4/src/browser/sync/web_socket_manager.ts#L196) to the client with no Pong getting returned, which is also [intentional](https://github.com/get-convex/convex-js/blob/817ee167f95f0cdb83943cba3ed5fce9942bd7b4/src/browser/sync/client.ts#L468) according to the source code.

![WS Ping](/coffee-codex/convex/ping.png)

I'm assuming that Convex uses a standard WebSocket protocol ping (not visible in devtools) for health checks, and uses the JSON pings for something else, maybe latency measurement and [metrics](https://github.com/get-convex/convex-backend/blob/76e3da11bd64a29b4904b3e44b9123e655a26fa7/crates/local_backend/src/subs/metrics.rs#L33).

Ok, back to the app mutations, when I add myself to a queue, this is the WebSocket payload:

```json
{
    "type": "Mutation",
    "requestId": 0,
    "udfPath": "queues:joinQueue",
    "args": [
        {
            "queueId": "<queue_id>",
            "userId": "<user_id>",
            "userName": "<user_name>"
        }
    ]
}
```

Things are pretty similar here except for the `type`. Instead of `ModifyQuerySet`, we see `Mutation`, which makes sense. We can see all of the types [here](https://github.com/get-convex/convex-backend/blob/76e3da11bd64a29b4904b3e44b9123e655a26fa7/crates/convex/sync_types/src/types.rs#L105-L150), which I'll dive into deeper next time.

The response for this mutation comes in three parts:
```json

// Part 1
{
    "type": "MutationResponse",
    "requestId": 0,
    "success": true,
    "result": "j57cvt5xssmqc0f2x3qcragc1x7meqhc",
    "ts": "uRsXp8bgVRg=",
    "logLines": []
}
// Part 2
{
    "type": "Transition",
    "startVersion": {
        "querySet": 1,
        "identity": 0,
        "ts": "gazIEYbeVRg="
    },
    "endVersion": {
        "querySet": 1,
        "identity": 0,
        "ts": "uRsXp8bgVRg="
    },
    "modifications": [
        {
            "type": "QueryUpdated",
            "queryId": 0,
            "value": {
                "items": [
                    {
                        "_creationTime": 1753504096926.715,
                        "_id": "j57d2x5znvkyrkr6hecr1vgk397me3km",
                        "completedAt": 1753504128089,
                        "joinedAt": 1753504096927,
                        "queueId": "j974d7asc3bskt14cdn668b2tn7me5mz",
                        "startedAt": 1753504114021,
                        "status": "completed",
                        "userId": "user_qnkwzjn0a",
                        "userName": "Joined 1"
                    },
                    ...
                ],
                "queue": {
                    "_creationTime": 1753504074935.745,
                    "_id": "j974d7asc3bskt14cdn668b2tn7me5mz",
                    "isActive": true,
                    "name": "Queue 1"
                }
            },
            "logLines": [],
            "journal": null
        }
    ]
}

// Part 3
{
    "type": "Transition",
    "startVersion": {
        "querySet": 1,
        "identity": 0,
        "ts": "uRsXp8bgVRg="
    },
    "endVersion": {
        "querySet": 1,
        "identity": 0,
        "ts": "ttGrp8bgVRg="
    },
    "modifications": []
}
```

Part 1 is equivalent to a 200 OK response, meaning our mutation went through so we won't error out.

Part 2 is the interesting part. Remember how the initial query to `getQueueWithItems` has a queryID? Well, it seems like that is used in part 2 to indicate that we should "invalidate" query 0 and replace the content with the `items` array instead, which is really cool. This is called a Transition because we are transitioning our stale query data to the new one, which looks like it happens [here](https://github.com/get-convex/convex-js/blob/817ee167f95f0cdb83943cba3ed5fce9942bd7b4/src/browser/sync/remote_query_set.ts#L30). Part 3 looks to be a no-op to indicate we are all caught up.

Convex is pretty cool. I'm looking forward to looking into the Convex server and possibly reading [this post](https://stack.convex.dev/how-convex-works). Today was a pretty surface level overview since I was also working on familiarizign myself with the convex platform, but hopefully next time I'll be able to go a lot deeper!

## References
- https://www.convex.dev
- https://github.com/get-convex