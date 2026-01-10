---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Jim Gray's Transactions II"
description: "Learning about transactions from Jim Gray's paper (Part 2)"
pubDate: "Jan 10, 2026"
heroImage: "/coffee-codex/transactions-ii/cover.png"
---

## Introduction

I'm back in 2026! I'm at Sconers in Bellevue, WA and I'm continuing to read Jim Gray's paper on [transactions](https://jimgray.azurewebsites.net/papers/A%20Transaction%20Model%20RJ%202895.pdf). Last time we discussed the fundamental definitions of transactions, reliability, and the different types of entities (Real, Stable, and Volatile). Now we'll explore how crash recovery works and how the system guarantees reliability even when things go wrong.

![Coffee](/coffee-codex/transactions-ii/coffee.jpg)

## Background

Recall from the <a href="/blog/coffee-codex-transactions.md">last post</a> that we defined three types of entities:

- **Real Entities**: Cannot be undone (like sending an email)
- **Stable Entities**: Survive system restarts (like data written to disk)
- **Volatile Entities**: Cleared during system restart (like data in memory)

So how does each of these behave when a transaction has to restart? And more importantly, how do we guarantee reliability when the system crashes?

## Transaction restart

When a transaction has to restart for any reason such as a consistency issue, ideally we can undo any action that the system has done. Unfortunately, we can't guarantee that for Real Entities. If we have sent an email, there is no way to undo the send of that email. In a more general sense, if you eat the cake, you can not have the cake.

To differentiate between these, we split up the transaction into two parts: the prelude and the commitment, delimited by a commit action. So at the start of a transaction, the actions that modify real entities are deferred to the end and placed on a REDO Log. Once the prelude is complete, we commit the changes and REDO Log to stable storage. Then, move on to acting on real entities. However, if there is a transaction restart during the prelude, those actions can be undone.

```
Defer Real Entities to REDO log -> Prelude -> Commit Action -> Commitment
```

Note that we can choose to not redo the actions on real entities. If we don't redo them, we have a system that guarantees `At most once delivery`. If we do redo them, we have a system that guarantees `At least once delivery`. You can not have `Exactly once delivery`, but most systems will have some sort of deduplication mechanism to try and reduce the effects.

To handle when a transaction restarts during the prelude, the system records an entry in an UNDO Log before executing the action. When a transaction restarts, the system executes the items from the UNDO Log and aborts the transaction or restarts.

Here's an example:

```
Initial state:
  balance = 100

Transaction T begins

Prelude:
  write UNDO log:  (balance was 100)
  apply change:    balance = 70

Conflict detected before commit
-> transaction restart

Undo phase:
  read UNDO log
  restore balance = 100

Transaction T restarts

Prelude (second attempt):
  write UNDO log:  (balance was 100)
  apply change:    balance = 70

Commit phase:
  write REDO log to stable storage: (set balance = 70)
  commit succeeds

// If there were actions on real entities, we'd execute them here

Final state:
  balance = 70
```

Note that these logs live in memory, as we are not yet concerned with losing volatile storage, but what happens if the entire system restarts, wiping out memory?

## System restart

At the moment the system crashes, every transaction falls into one of four buckets:

1. Transactions that fully committed and had all their effects reflected in real and stable entities
2. Transactions that had committed, but were still in the process of executing real-entity actions
3. Transactions that were still in the prelude
4. Transactions that had not yet started

Transactions in the prelude (type 3) are treated as if they never happened. Their state existed only in memory, and since they never committed, the system is free to forget them entirely. After restart, these become type 4.

Transactions in the commitment phase (type 2) go the other direction. Once a transaction has committed, it cannot be undone. Even if the system crashes halfway through executing real-entity actions, recovery must finish the job. That’s why type 2 transactions become type 1 after restart.

In other words: uncommitted transactions disappear, committed transactions must be completed.

This is where the REDO log really matters. During normal execution, real-entity actions are deferred and recorded as intentions. Commit makes those intentions durable. After a crash, the system scans the REDO log and executes any committed actions that were not marked as done. If an action already happened, it must be safe to run again. That’s why redo actions need to be idempotent.

Undo works differently during system restart. If an uncommitted transaction managed to touch a stable entity before crashing, the system needs enough information to roll it back. That means undo information must be written to stable storage before the change itself. This is the write-ahead logging rule.

## References

- https://jimgray.azurewebsites.net/papers/A%20Transaction%20Model%20RJ%202895.pdf
