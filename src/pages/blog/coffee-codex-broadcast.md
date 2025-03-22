---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Broadcast Ordering"
description: "Learning about Broadcast ordering in Distributed Systems"
pubDate: "March 8, 2025"
heroImage: "/coffee-codex/broadcast/cover.png"
---

## Introduction
I'm at Woods in Bellevue, WA and I'm learning about broadcast ordering in distributed systems

![Coffee](/coffee-codex/broadcast/coffee.png)

## Recap

In the <a href="/blog/coffee-codex-logical-time-vector.md">last post</a>, I learned about Vector clocks, which are a type of logical clock that address some issues with Lamport clocks. In this post, I'll learn about Broadcast ordering.

## Broadcast Ordering

Unlike previous communication methods which are single node to single node, broadcast ordering aims to allow a single node to send a message to N number of other nodes. For this post, N will be a fixed number, but this is often not the case in real systems.

### Requirements

Imagine one of the nodes in a system goes down or becomes faulty. What should happen to the system? We certainly don't want all of the other nodes to malfunction, so an important property in broadcast communication is fault tolerance. If a system is fault tolerant, any individual failing node will not impact the functionality of any other node.

We also can't rely on specialized hardware for broadcast communication since we're generalizing these protocols to work over the public Internet, not building our own End to End solution. In other words, the underlying network only provides **point to point messaging** (single node to single node).

```typescript
function broadcastToAll(message) {
	sendMessageToAllNodes(message); // Doesn't exist!
	// We need to build createBroadcastProtocol, sendMessageToSingleNode exists
	createBroadcastProtocol(sendMessageToSingleNode, message);
}
```
We can think of this broadcast protocol as a middleware between the client and receiver.

### Delivery vs Receiving

If Node A sends out `m1` to Node B, we still say that Node B delivers message `m1`. This is because the receiving of a message happens at the network level and then our middleware decides when to actually deliver the message. This can be a bit confusing, but remember that we don't control the network or its underlying communication. The network may receive messages in any order, and our middleware will determine when to deliver them from each node.

## Broadcast Abstractions

Different broadcast abstractions control **when** messages get delivered and in which order they are delivered.

### FIFO
With First In First Out (FIFO), the guarantee we're providing is that a message `m1` sent from Node A will be delivered before a message `m2` sent from Node A. The **only** guarantee here is that messages sent from the **same Node** will be delivered in order.

Consider this diagram

![Coffee](/coffee-codex/broadcast/fifo.png)

The key thing to notice is that Node A delivered 2 messages, `m1` and `m3`. With FIFO, we provide the guarantee that all nodes will deliver `m1` before `m3`, which is the **only** guarantee we can make. This means that `m2` (sent by Node B) can be delivered at any moment: before `m1`, after `m1`, after `m3`, etc. 

Notice how we're also sending a message to the current node (indicated by the loop next to the letter). The reason for this will be explained later.

### Causal Broadcast

With causal broadcasts, if `m1` is broadcasted before `m2` and `m2` depends on `m1`, then we guarantee that `m1` will be delivered before `m2`. This is the case even when `m1` and `m2` come from different nodes.

In this diagram, assume that `m1 -> m2` and `m1 -> m3`, meaning `m2` depends on `m1` and `m3` depends on `m1`. Because of this, a causal ordering guarantees that `m1` will be delivered before `m2` and `m3` to all nodes. However, assume there isn't a causal relationship between `m2` and `m3`, making them concurrent. With a causal broadcast, concurrent messages can be delivered in any order.

We can use vector clocks (from the last post) to determine which messages depend on others through a dependency graph.

![Coffee](/coffee-codex/broadcast/causal.png)

Notice how Node A delivers `m1`, then `m3`, then `m2`, while Node B delivers `m1`, then `m2`, then `m3`. Both of these are valid causal orders, but they are not the same.

### Total Order Broadcast

If we want to require all nodes to deliver messages in the same order, we can use Total Order Broadcast. This means if `m1` is delivered before `m2` on one Node, then `m1` must be delivered before `m2` on all nodes.

Another way to think about this is if all messages had an indirect causal order with the messages before (in a causal sense) it. With this, there are no concurrent messages.

Here, assume the decided order is `m1 -> m2 -> m3`. This can definitely change but it depends on the requirements of the system.

![Coffee](/coffee-codex/broadcast/total-order.png)

We can go through all 3 nodes and notice that every node delivers `m1` before `m2` before `m3`. This is where the self-loop matters. Notice how Node A receives `m3` before delivering `m2`. This means that our broadcast middleware needs to hold onto `m2` until after `m2` has been delivered in order to guarantee a total ordering. This is called a "hold back" in the system.

### FIFO Total Ordering

If we want to impose a bit more restriction on the ordering of messages, one way to do that is with FIFO Total Ordering. In the previous example, we can choose any ordering of messages as our order. With FIFO total ordering, messages sent by the same node must be delivered in order. It's a combination of FIFO and Total Ordering.

In terms of meeting requirements, we can construct a graph to illustrate the relationship between these abstractions.

![Coffee](/coffee-codex/broadcast/relationship.png)

So FIFO total ordering meets the requirements of Causal and Total order, Causal meets the requirements of FIFO, and so on.

In this next post, we'll learn how to implement these algorithms!

## References
- https://www.youtube.com/watch?v=A8oamrHf_cQ (DDIA lecture series)
- https://chatgpt.com/share/67cc9a00-bc38-8002-936a-ac254974ff40 (ChatGPT for clarifications)