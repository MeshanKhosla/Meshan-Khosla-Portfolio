---
title: "Coffee Codex - Convex Backend"
description: "Learning about the convex.dev backend"
pubDate: "Aug 2, 2025"
heroImage: "/coffee-codex/convex-backend/cover.png"
---

## Introduction
I'm at Cafe Aloe in Bellevue, WA, and today I'm learning about how the backend of [convex.dev](https://www.convex.dev/) works. In the <a href='/blog/coffee-codex-convex'>last post</a>, I looked into the Convex client and built a demo app to understand the WebSocket messages. I'm going to learn about the backend by reading through [this post](https://stack.convex.dev/how-convex-works)

![Coffee](/coffee-codex/convex-backend/coffee.jpg)

I did come to a realization yesterday, which is that Convex is not a pub-sub system. I was trying to implement something similar to Convex in TypeScript and Bun and my initial thought was to just use Bun's pub/sub behavior on its WebSocket implementation. This isn't too difficult, but that's not what Convex is. While the end goal is somewhat similar, Convex is a *database*, which happens to also be reactive.

The database also runs transactions within it, meaning it's not a separate server that is running the user defined functions (UDFs), it runs within the Convex server with transaction guarantees.

The high level diagram they show looks like this:
![Convex HLD](/coffee-codex/convex-backend/convex-high-level.svg)
(taken from the blog)

This starts to answer some of the questions I had last week, like why is the type of a query `ModifyQuerySet`, it looks like it's a data structure Convex uses to keep track of the queries. I'm interested to read about if the query set is persistent and if it's distributed. I'm assuming it's not just an in-memory `HashSet` data structure in Rust.

## Storing Data
We saw last time that Convex stores data in documents, similar to MongoDB, such as this
```json
{
    "_id": "<convex_generated_id>",
    "queueId": "<queue_id>",
    "userId": "<user_id>",
    "userName": "<user_name>"
}
```

The data that Convex stores is in an append-only transaction log such as this, where the version is a monotonically increasing timestamp.
![Convex Xact log](/coffee-codex/convex-backend/xact-log.svg)

As I learned in the posts about <a target='_blank' href='/blog/coffee-codex-clocks'>clocks</a>, physical clocks tend to skew and require NTP to synchronize so many distributed systems opt for logical clocks such as <a target='_blank' href='/blog/coffee-codex-logical-time-vector'>vector clocks</a>. Convex uses [hybrid logical clocks](https://cse.buffalo.edu/tech-reports/2014-04.pdf) which I'm not as familiar with but maybe I'll look into them in the future.

Interestingly all tables are present in the transaction log and I believe each project has its own transaction log. This makes the transactional guarantees clear. Since all Convex functions are transactional, any update to the transaction log will be grouped into one transaction log entry, identifiable by a timestamp. The database can then jump from entry `i` to `i + 1` when it's ready to make an update, and it's clear what changes need to be applied.

I'm curious if the transaction log stores entries for *every* property in the document and the DB does a complete rewrite of the document, or if there's some merging of properties that happens for every change. I think this can be really useful if it was exposed to the end user as an undo/redo stack abstraction.

## Indexes
Indexes are useful in databases since they massively improve performance by maintaining a separate data structure focused on a specific field (i.e., `_id`) and then references to the actual records of a database. The typical data structure for indexes is a B-tree.

In Convex, since data is stored in a transaction log, the indexes store a reference to the entries in the log that correspond to the indexed field. This means whenever you update a document, the index will need to have its reference changed to the latest entry in the log.

Convex actually stores indexes in a multi-versioned way as well, where the index entries are also bucketed by the revision, just like the transaction log. I'm thinking this could be useful for rollbacks.
![Convex Xact log](/coffee-codex/convex-backend/mv-index.svg)

## Transactions and serializability
This is the really cool part of Convex in my opinion. The real-time updates are cool, but with Convex, race conditions are non-existent, which was a huge problem I had to deal with when I made a real-time office hours queue in [college](https://github.com/Berkeley-CS61B/simple-office-hours-queue).

I wrote more about how distributed locking works [here](https://upstash.com/blog/lock) to prevent race conditions, so I'm wondering how the approach differs.

It seems that the ideal approach is serializability, where requests get processed serially in a single process. Assuming this, we can't end up with a situation where two users think they have control over the last resource, since request 1 must have completed before request 2 starts. This is how Redis works, but Redis operations are much more lightweight than TypeScript functions running in V8 isolates, so Convex can't literally run each request serially. To address this, Convex uses optimistic concurrency control.

Instead of locking a document in the database, we keep track of 3 things in a transaction: a begin timestamp (we talked about timestamps above), read set, and write set. The begin timestamp is the state of the database at the start of the transaction. When a mutation happens, the change is not immediately added to the transaction log. Instead, it's sent to a function runner which runs the user code in a V8 isolate. The runner will return the timestamp, read set, and write set. A read set is the set of data that a transaction reads, and a write set is the set of data that a transaction proposes to write to. From the example in the blog, an example of this looks like:

- Begin timestamp: `16`
- Read set: `{ get("items", itemId), query("carts.user_item", eq("userToken", userToken), eq("itemId", itemId)) }`
- Write set: `{ cartItem._id: { ...cartItem, count: cartItem.count + 1 }, itemId: { ...item, remaining: item.remaining - 1 } }`

(small note just in case: The sets don't store the string literals, they store the actual data from the function runner)

Now that we have the data from the update, it's up to the `committer` to decide if there should be a new entry to the transaction log. Only the committer is allowed to add to the transaction log. To do this, the committer generates a new timestamp (i.e., `19`) and compares all entries from the `begin_timestamp` (16) to 19, checking for overlap and conflicts. If no overlap is found, the committer can commit! If there is a conflict, then the committer throws an “Optimistic Concurrency Control” conflict error and can retry the mutation. This is safe to do because Convex transactions do not have side effects, which is why you can't `fetch` within a mutation. 

## Subscriptions
The last part is the subscription of queries, and it works in a similar way as above, but without the write set. The magic lies in the [subscription manager](https://github.com/get-convex/convex-backend/blob/main/crates/database/src/subscription.rs#L196). Whenever the client runs a query, the server records the exact documents and index ranges that query touched in a read set, just like before. That read set is tied to the client's WebSocket session. Each time a new transaction lands in the log, the subscription manager checks if any write in that commit overlap one of the stored read sets. If it does, the server reruns the query against the latest snapshot and sends the new result back down the socket. No polling, no manual cache busting on the client.

This answered a lot of questions I had from the last post, very cool!

## References
- https://www.convex.dev
- https://github.com/get-convex
- https://stack.convex.dev/how-convex-works