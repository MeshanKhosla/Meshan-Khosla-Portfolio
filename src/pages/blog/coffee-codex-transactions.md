---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Jim Gray's Transactions I"
description: "Learning about transactions from Jim Gray's paper (Part 1)"
pubDate: "Dec 06, 2025"
heroImage: "/coffee-codex/transactions/cover.png"
---

## Introduction

I'm at North of Main in Bellevue, WA and I'm reading Jim Gray's paper on [transactions](https://jimgray.azurewebsites.net/papers/A%20Transaction%20Model%20RJ%202895.pdf). I've learned about transactions before, but I started to read this paper and thought it did an excellent job at defining it. This post will largely be definitions, and then next time we'll discuss crash recovery and other fun stuff.

![Coffee](/coffee-codex/transactions/coffee.jpg)

## Definitions

Let's outline some of the definitions that Jim Gray uses to define transactions:

**Database State** is a function from names to values

An **Entity** is a <name, value> pair

**Operations** manipulates one or more entities and the execution of an operation is called an **Action**

**Transactions** are the mechanism by which query and transform database state

A **Program** P is a static description of a transaction

In one sentence, A **Program** P is a static description of a **Transaction** whose **Operations** manipulate one or more **Entities**, each an individual `<name, value>` pair, thereby querying and transforming the overall **Database State**.

Not so straightforward, but it gets better as we read on. I intentionally left out definitions of consistency and history.

## What a transaction means

When an author writes a program and that invokes transactions, they are assured that:

1. Will be executed exactly once (reliability)
2. Will be isolated from temporary violations of the consistency constraint introduced by actions of concurrently executing transactions (consistency)

In other words, reliability means that the committed effects of a transaction appear exactly once in the database state. However, that is assuming the transaction successfully commits. This does **not** mean the code executes exactly once, the transaction is free to retry, start over, etc.

At the point of a commit, a transaction checks to see if it has violated any consistency constraints. This can be a uniqueness constraint, foreign key constraint, application-level constraint, etc. If it has, then the transaction is undone and the program can show an error message. Importantly, no partial changes remain.

## Reliability

So 4 sentences ago I said that reliability means the effects of a transaction appear exactly once in the DB state. That's true, but how does the system guarantee that? It can undo and redo as it pleases, so what exactly does it do? Remember that everything fails, so how is reliability achieved internally when hardware fails, memory fails, disks fail, nodes crash, power dies, or the world disappears.

Well, we can't achieve reliability in the case of the world disappearing, so in fact, one **never** has a reliable system. If everything fails, recovery is impossible and thus reliability is impossible since we can't reconstruct the final system state (there is no system).

Unfortunately more definitions are required to model failures.

**Real Entities** are those that cannot be undone. If we have a real input such as an input to a system, that can't be taken back. Similarly, a real output such as the sending of an email can not be undone. In other words, you can't eat the cake and still have the cake.

**Stable Entities** are those that survive a system restart. During a transaction, if you write something to durable storage such as disk, it is considered stable.

**Volatile Entities**, on the other hand, are values that are changed during a transaction that are cleared during a system restart. This includes writing data to memory.

So how does each of these behave when a transaction has to restart? How about when the system crashes, how do we guarantee reliability? We'll talk about that next time.

## References

- https://jimgray.azurewebsites.net/papers/A%20Transaction%20Model%20RJ%202895.pdf
