---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Broadcast Ordering Algorithms 1"
description: "Learning about Broadcast ordering algorithms in Distributed Systems"
pubDate: "March 22, 2025"
heroImage: "/coffee-codex/broadcast-algorithms/cover.png"
---

## Introduction
I'm at Capital One Cafe (which serves Verve coffee) in Bellevue, WA and I'm learning about broadcast ordering in distributed systems.

![Coffee](/coffee-codex/broadcast-algorithms/coffee.png)

## Recap

In the <a href="/blog/coffee-codex-broadcast.md">last post</a>, I learned about broadcast ordering, specifically the definitions of FIFO, Causal, Total Order, and FIFO Total Order as they relate to broadcast algorithms. Even though the idea of FIFO is very common in computer science, specifically with queues, it's still useful to spell out how that concept relates to broadcast messaging. In this post, I'll learn the algorithms behind how these different orderings work!

## Reliability

Before getting into the individual algorithms, let's focus on how we can increase reliability, since it's one of the requirements from the last post. 

### Sender broadcasts to every node

A simple solution is for the broadcasting node to send a message to every other node directly. If there is a failure, retry the delivery.

However, consider this order of events:

1. Node `A` transmits the message to Node `C`
2. Node `C` delivers the message
3. Node `A` transmits the message to Node `B`
4. Before arrival at `B`, the `A->B` link crashes.
5. Node `A` crashes

![Initial attempt](/coffee-codex/broadcast-algorithms/initial-alg.png)

In this situation, we've ended up with an inconsistent state. Node `C` has delivered the message but Node `B` hasn't (and never will).

### Eager reliable broadcast

With the Eager reliable broadact, every node with broadcast every message that it receives. So when Node `B` receives the message, it will broadcast it to Node `A` and `C` to ensure everyone has received the message.

While this approach is reliable, it is very expensive. Every node is sending every message to every other node, resulting in `O(n^2)` message for `n` nodes.

### Gossip Protocol

Another protocol for reliable broadcasts is when each node sends a message to `k` random nodes in the system, where `k` is a parameter chosen by the system. So if `k = 3`, each node will choose 3 random nodes to retransmit the message to. Of course, there is a chance that the messages will be sent to a node that has already received the message, but every node will eventually receive the message with a very high probability.

![Gossip](/coffee-codex/broadcast-algorithms/gossip.png)

### FIFO Broadcast Algorithm

With FIFO broadcast, two messages broadcasted by a node is guaranteed to be delivered in that same order. See the <a href="/blog/coffee-codex-broadcast.md">previous post</a> for more information about this.

The implementation for FIFO Broadcast revolves around a sequence number. The sender sends the message with a sequence number and the receiver delivers the message that corresponds to the **expected** sequence number, which is one greater than the last one it received.

```typescript
type Message = { sender: number; seq: number; payload: any };

// ---- Sender ---- //
let senderSeq = 0;
function fifoBroadcast(payload: any, sender: number) {
  const msg = { sender, seq: senderSeq, payload };
  reliableBroadcast({
	sender,
	payload
	seq: senderSeq,
  });
  senderSeq++;
}

// ---- Receiver ---- //
const expectedSequences = new Map<number, number>();
const buffer = new Map<number, Message[]>();

function onFifoReceive(msg: Message) {
  const senderId = msg.sender;
  const senderBuffer = buffer.get(senderId);
  senderBuffer.push(msg);
  let deliveredSomething = true;
  while (deliveredSomething) {
    deliveredSomething = false;
	// Search all of the messages to see if any message is the next to be delivered (next seq number)
    for (let i = 0; i < senderBuffer.length; i++) {
      const { sender, seq, payload } = senderBuffer[i];
      const expected = expectedSequences.get(sender) ?? 0;
      if (seq === expected) {
        deliverMessage(payload);
        expectedSequences.set(sender, expected + 1);
        senderBuffer.splice(i, 1);
		// Set to true again in case there is another message that needs to be delivered
        deliveredSomething = true;
        break;
      }
    }
  }
}
```

In the next post, we'll cover the algorithms for Causal broadcast and Total order broadcast!

## References
- https://www.youtube.com/watch?v=77qpCahU3fo (DDIA lecture series)