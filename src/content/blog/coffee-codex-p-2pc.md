---
title: "Coffee Codex - Implementing formal methods for Two Phase Commit"
description: "Two Phase Commit in the P language"
pubDate: "June 28, 2025"
heroImage: "/coffee-codex/p-2pc/cover.png"
---

## Introduction
I'm at Toasted in Bellevue, WA and I'm learning about the [P programming language](https://p-org.github.io/P/) by going through the examples on their site.
In the <a href='/blog/coffee-codex-p'>last post</a>, I learned about the P language and modeled the client-server example. Since that example was pretty simple, today I'm going to look at model Two Phase Commit (2PC)!

![Coffee](/coffee-codex/p-2pc/coffee.jpg)

## Two Phase Commit
First let's do a quick overview of how two phase commit works. The purpose of 2PC is to provide atomicity in a transaction. This means if a coordinator needs to write a key to a key-value store that is distributed on many nodes, there's only 2 options:

1. All nodes commit the change
2. No nodes commit the change

With 2PC, we should never end up with a situation where a subset of the nodes have committed the change, as that would break the atomicity guarantee. This works in 2 phases:

**Phase 1**: The coordinator sends a `prepare` request to to all participants and waits for a `prepare success` or `prepare failure` response. If the responses all come back as `prepare success`, then the coordinator can send a `commit` message to each participant. If >= 1 comes back as `prepare failure`, the coordinate sends `abort` to all participants.

![2pc](/coffee-codex/p-2pc/2pc.png)

Importantly, we are making some assumptions here to make the problem easier since the focus of this post in on modeling with P, not on 2PC. We are assuming that, while the system allows parallel requests, the coordinator will serialize these and processes them sequentially.

We are also assuming reliable delivery of messages. While it's possible to model an unreliable network in P, we won't do it in this post.

## Correctness
Now let's specify our safety and liveness guarantees. See the <a href='/blog/coffee-codex-p'>last post</a> for more information on what these mean.

**Safety** (Nothing bad happens): Atomicity - A coordinator commit implies all participants have agreed on the transaction. A coordinator abort implies at least one participant has not agreed on the transaction.

**Liveness** (Only good things happen): Progress - Every received transaction must be eventually responded

Again, we're nodt considering failures in actually committing the transaction, just having a consensus state.

## Models
Let's start with the model for the coordinator in [coordinator.p](https://github.com/p-org/P/blob/master/Tutorial/2_TwoPhaseCommit/PSrc/Coordinator.p)

Before even looking at the code, remember that P is based on state machines, let's see what the state machine looks like from the coordinator's POV.

```
(Init) -> (WaitForTransactions) <-> (WaitForPrepareResponses)
```

In english, the `Init` state will do things like creating a timer and informing all participants of who is the coordinator. Then we transition to `WaitForTransactions`, where we listen for client events. On receiving a request, we broadcats a prepare request to all participants and start the timer then transition to `WaitForPrepareResponses`. In `WaitForPrepareResponses`, we listen for participant responses and either broadcast a global abort or global commit when all responses have come back or the timer expires. Then, transition back to `WaitForTransactions`.

Here's how it works in code, I'm going to skip over the type and event definitions.

**Init**: This sets up the participants and creates a timer for handling timeouts during prepare.
```cs
start state Init {
  entry (payload: set[Participant]){
    participants = payload;
    timer = CreateTimer(this);
    BroadcastToAllParticipants(eInformCoordinator, this);
    goto WaitForTransactions;
  }
}
```

**WaitForTransactions**: The coordinator only processes one write at a time. It stores the request, broadcasts a prepare, and starts a timer. Read requests can be handled concurrently and are simply forwarded.
```cs
state WaitForTransactions {
  on eWriteTransReq do (wTrans : tWriteTransReq) {
    if(wTrans.trans.transId in seenTransIds) {
      send wTrans.client, eWriteTransResp, (transId = wTrans.trans.transId, status = TIMEOUT);
      return;
    }

    currentWriteTransReq = wTrans;
    BroadcastToAllParticipants(ePrepareReq, wTrans.trans);
    StartTimer(timer);
    goto WaitForPrepareResponses;
  }

  on eReadTransReq do (rTrans : tReadTransReq) {
    send choose(participants), eReadTransReq, rTrans;
  }

  ignore ePrepareResp, eTimeOut;
}
```

**WaitForPrepareResponses**: In this state, the coordinator collects prepare responses. If all are successful, it commits. If any fail or timeout occurs, it aborts. Note that we defer additional write requests until we return to `WaitForTransactions`.

```cs
state WaitForPrepareResponses {
  defer eWriteTransReq;

  on ePrepareResp do (resp : tPrepareResp) {
    if (currentWriteTransReq.trans.transId == resp.transId) {
      if(resp.status == SUCCESS) {
        countPrepareResponses = countPrepareResponses + 1;
        if(countPrepareResponses == sizeof(participants)) {
          DoGlobalCommit();
          goto WaitForTransactions;
        }
      } else {
        DoGlobalAbort(ERROR);
        goto WaitForTransactions;
      }
    }
  }

  on eTimeOut goto WaitForTransactions with { DoGlobalAbort(TIMEOUT); }

  on eReadTransReq do (rTrans : tReadTransReq) {
    send choose(participants), eReadTransReq, rTrans;
  }

  exit {
    countPrepareResponses = 0;
  }
}
```

There are also three helper functions we use:
```cs
fun DoGlobalAbort(respStatus: tTransStatus) {
  BroadcastToAllParticipants(eAbortTrans, currentWriteTransReq.trans.transId);
  send currentWriteTransReq.client, eWriteTransResp,
    (transId = currentWriteTransReq.trans.transId, status = respStatus);
  if(respStatus != TIMEOUT) CancelTimer(timer);
}

fun DoGlobalCommit() {
  BroadcastToAllParticipants(eCommitTrans, currentWriteTransReq.trans.transId);
  send currentWriteTransReq.client, eWriteTransResp,
    (transId = currentWriteTransReq.trans.transId, status = SUCCESS);
  CancelTimer(timer);
}

fun BroadcastToAllParticipants(message: event, payload: any) {
  var i: int;
  while (i < sizeof(participants)) {
    send participants[i], message, payload;
    i = i + 1;
  }
}
```

Next time, I’ll look into the participant and client state machines!

## References
- https://p-org.github.io/P/ (P Lang)