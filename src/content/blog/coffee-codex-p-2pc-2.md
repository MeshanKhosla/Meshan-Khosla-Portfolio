---
title: "Coffee Codex - Implementing formal methods for Two Phase Commit II"
description: "Two Phase Commit in the P language II"
pubDate: "July 20, 2025"
heroImage: "/coffee-codex/p-2pc-2/cover.png"
---

## Introduction
I'm at North of Main Cafe in Bellevue, WA and today I'm doing part 2 of implementing formal methods for 2PC. In the  <a href='/blog/coffee-codex-p-2pc'>previous post</a>, I wrote about what 2PC is and coordinator state machine.

![Coffee](/coffee-codex/p-2pc-2/coffee.jpg)

## Recap
As a quick recap, the goal of 2PC is to coordinate an atomic transaction by going through two phases.

![2pc](/coffee-codex/p-2pc/2pc.png)

The coordinator state machine looks like:

```
(Init) -> (WaitForTransactions) <-> (WaitForPrepareResponses)
```

## Participant State Machines

Now let's examine the participant side of the 2PC protocol. While the coordinator orchestrates the entire process, participants are responsible for executing the actual transactions and responding to the coordinator's requests.

### Initial Design Thoughts

Before diving into the actual implementation, let me walk through my initial thinking about participant state machines. I imagined a more complex state machine with multiple states:

```
(Init) -> (WaitForCoordinatorPrepare) -> (WaitForCommitOrAbort) -> (WaitForCoordinatorPrepare)
```

This design would have separate states for:
- **WaitForCoordinatorPrepare**: Waiting for the coordinator to send a prepare request
- **WaitForCommitOrAbort**: After responding to prepare, waiting for the final commit or abort decision

### The Actual Implementation

However, the [actual P implementation](https://github.com/p-org/P/blob/master/Tutorial/2_TwoPhaseCommit/PSrc/Participant.p) takes a much more elegant approach. Instead of multiple states, it uses just two:

```
(Init) -> (WaitForRequests)
```

This design choice is clever because it treats the participant as a **request handler** rather than a state machine that tracks protocol phases. The participant simply waits for any request and responds appropriately, letting the coordinator manage the protocol flow.

### State Machine Breakdown

#### Init State
The participant starts in the `Init` state where it receives its coordinator reference:

```cs
start state Init {
  on eInformCoordinator goto WaitForRequests with (coor: Coordinator) {
    coordinator = coor;
  }
  defer eShutDown;
}
```

This is straightforward, as the participant gets told who its coordinator is and immediately transitions to handling requests.

#### WaitForRequests State
This is where the magic happens. The participant handles all possible requests in a single state:

```cs
state WaitForRequests {
  // Handle abort requests from coordinator
  on eAbortTrans do (transId: int) {
    assert transId in pendingWriteTrans,
    format ("Abort request for a non-pending transaction, transId: {0}, pendingTrans set: {1}",
      transId, pendingWriteTrans);
    pendingWriteTrans -= (transId);
  }

  // Handle commit requests from coordinator
  on eCommitTrans do (transId:int) {
    assert transId in pendingWriteTrans,
    format ("Commit request for a non-pending transaction, transId: {0}, pendingTrans set: {1}",
      transId, pendingWriteTrans);
    kvStore[pendingWriteTrans[transId].key] = pendingWriteTrans[transId];
    pendingWriteTrans -= (transId);
  }

  // Handle prepare requests from coordinator
  on ePrepareReq do (prepareReq :tPrepareReq) {
    // cannot receive prepare for an already pending transaction
    assert !(prepareReq.transId in pendingWriteTrans),
    format ("Duplicate transaction ids not allowed!, received transId: {0}, pending transactions: {1}",
      prepareReq.transId, pendingWriteTrans);
    pendingWriteTrans[prepareReq.transId] = prepareReq;
    // non-deterministically pick whether to accept or reject the transaction
    if (!(prepareReq.key in kvStore) || (prepareReq.key in kvStore && prepareReq.transId > kvStore[prepareReq.key].transId)) {
      send coordinator, ePrepareResp, (participant = this, transId = prepareReq.transId, status = SUCCESS);
    } else {
      send coordinator, ePrepareResp, (participant = this, transId = prepareReq.transId, status = ERROR);
    }
  }

  // Handle read requests from clients
  on eReadTransReq do (req: tReadTransReq) {
    if(req.key in kvStore)
    {
      // read successful as the key exists
      send req.client, eReadTransResp, (key = req.key, val = kvStore[req.key].val, status = SUCCESS);
    }
    else
    {
      // read failed as the key does not exist
      send req.client, eReadTransResp, (key = "", val = -1, status = ERROR);
    }
  }

  on eShutDown do {
    raise halt;
  }
}
```

## Client State Machine

Now let's look at the client side, which is responsible for initiating transactions and verifying their results. The client has a simple but important role: it issues write transactions and then reads back the values to ensure consistency.

The client uses a straightforward three-state design:

```
(Init) -> (SendWriteTransaction) <-> (ConfirmTransaction)
```

```cs
machine Client {
  // the coordinator machine
  var coordinator: Coordinator;
  // current transaction issued by the client
  var currTransaction : tTrans;
  // number of transactions to be issued
  var N: int;
  // unique client Id
  var id: int;

  start state Init {
    entry (payload : (coordinator: Coordinator, n : int, id: int)) {
      coordinator = payload.coordinator;
      N = payload.n;
      id = payload.id;
      goto SendWriteTransaction;
    }
  }

  state SendWriteTransaction {
    entry {
      currTransaction = ChooseRandomTransaction(id * 100 + N /* hack for creating unique transaction id*/);
      send coordinator, eWriteTransReq, (client = this, trans = currTransaction);
    }
    on eWriteTransResp goto ConfirmTransaction;
  }

  state ConfirmTransaction {
    entry (writeResp: tWriteTransResp) {
      // assert that if write transaction was successful then value read is the value written.
      if(writeResp.status == SUCCESS)
      {
        send coordinator, eReadTransReq, (client= this, key = currTransaction.key);
        // await response from the participant
        receive {
          case eReadTransResp: (readResp: tReadTransResp) {
            assert readResp.key == currTransaction.key && readResp.val == currTransaction.val,
              format ("Record read is not same as what was written by the client:: read - {0}, written - {1}",
            readResp.val, currTransaction.val);
          }
        }
      }
      // Do I have more work to do?
      if(N > 0)
      {
        N = N - 1;
        goto SendWriteTransaction;
      }
    }
  }
}
```

And here is the ChooseRandomTransaction helper function

```cs
fun ChooseRandomTransaction(uniqueId: int): tTrans {
  return (key = format("{0}", choose(10)), val = choose(10), transId = uniqueId);
}
```

The client machine implements a test harness that issues N non-deterministic write transactions, and for each successful write, performs a read on the same key to verify consistency. The state machine cycles between `SendWriteTransaction` (which generates a random transaction and sends it to the coordinator) and `ConfirmTransaction` (which reads back the written value and asserts it matches). The transaction ID uses `id * 100 + N` as a "hack" to ensure uniqueness across multiple clients.

### The Concurrency Bug

A bug occurs when two clients write to the same key with different values. Here's the scenario:

1. **Client A** writes value `X` to key `"5"` with transaction ID `100`
2. **Client B** writes value `Y` to key `"5"` with transaction ID `200` 
3. **Client A** reads key `"5"` expecting value `X`, but gets value `Y`
4. The assertion fails because `X ≠ Y`

This happens because participants accept transactions to the same key in monotonically increasing transaction ID order. So Client B's transaction (ID 200) overwrites Client A's transaction (ID 100), even though both transactions succeed from their respective coordinator's perspective.

#### Flawed Assertion

```cs
assert readResp.key == currTransaction.key && readResp.val == currTransaction.val,
  format ("Record read is not same as what was written by the client:: read - {0}, written - {1}",
readResp.val, currTransaction.val);
```

This assertion assumes that if a write succeeds, a subsequent read will always return the same value. But in a concurrent system with multiple clients, this isn't guaranteed.

#### The Fix

The correct assertion should account for the possibility that another client with a higher transaction ID may have overwritten the value:

```cs
// If the value read is different from what we wrote, 
// it must have been overridden by a transaction with a higher ID
assert readResp.key == currTransaction.key && 
       (readResp.val == currTransaction.val || 
        kvStore[readResp.key].transId > currTransaction.transId),
  format ("Invalid read: expected our value {0} or a value from higher transId, got {1}",
  currTransaction.val, readResp.val);
```


## Testing
The way we set up the test scripts in P is like this:
```cs
// checks that all events are handled correctly and also the local assertions in the P machines.
test tcSingleClientNoFailure [main = SingleClientNoFailure]:
  union TwoPhaseCommit, TwoPCClient, FailureInjector, { SingleClientNoFailure };

// asserts the liveness monitor along with the default properties
test tcMultipleClientsNoFailure [main = MultipleClientsNoFailure]:
  assert AtomicityInvariant, Progress in
    (union TwoPhaseCommit, TwoPCClient, FailureInjector, { MultipleClientsNoFailure });

// asserts the liveness monitor along with the default properties
test tcMultipleClientsWithFailure [main = MultipleClientsWithFailure]:
  assert Progress in (union TwoPhaseCommit, TwoPCClient, FailureInjector, { MultipleClientsWithFailure });
```

and you can see the setup of the testing environment [here](https://github.com/p-org/P/blob/master/Tutorial/2_TwoPhaseCommit/PTst/TestDriver.p#L11), which includes creation of the clients.

## References
- https://p-org.github.io/P/ (P Lang)