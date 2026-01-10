---
title: "Coffee Codex - CRDTs"
description: "Learning about CRDTs"
pubDate: "Aug 10, 2025"
heroImage: "/coffee-codex/crdt/cover.png"
---

## Introduction
I'm at Bellden Cafe in Bellevue, WA, and today I'm learning about CRDTs (Conflict-free Replicated Data Type) in distributed systems. I really only know that they are data types used when dealing with collaborative, possibly offline systems such as Google Docs so I'm looking forward to reading more about how they work.

![Coffee](/coffee-codex/crdt/coffee.jpg)

## Primitive types
Imagine an app that lets multiple users increment a counter on a website. The primitive approach to this is to have a counter variable stored on the server. On a request, the server will increment that counter.

```typescript
let counter = 0;

app.put('/increment', (c) => {
    return c.json({ counter: ++counter })
});
```

With this, how do you prevent race conditions? We can apply a mutex on the counter resource, but now we've significantly increased complexity. Not only are we making a network request to see the updated counter value, we're also locking the counter resource for every request. The benefit of this approach is there is one source of truth.

## CRDT approach
But what if each node in the system had their own counter and every time the count changed, we broadcast that to every other node?

```typescript
class Counter {
    constructor() {
        this.counter = 0;
    }

    increment() {
        this.counter++;
        broadcast(this.counter);
    }

    getCount() {
        return this.counter;
    }

    onBroadcastReceive(newCounter: number) {
        // ???
    }
}
```

This doesn't really help us so far, but we're getting there. Imagine if there were thousands of requests coming in, how would the `onBroadcastReceive` function work? We could take the `Math.max(this.counter, newCounter)`, but we could easily end up with an inconsistent state where two nodes increment their local state, receive the broadcast, and don't see a diff so the new change goes uncounted. 

The key thing to notice is that we don't *only* need to store a primitive integer, we can be a bit smarter and uniquely identify the current node. We can use these unique identifiers to internally keep track of the states of all other nodes.

```typescript
class Counter {
    constructor() {
        this.id = uuid.v4();
        this.counters = {
            [this.id]: 0
        }
    }

    increment() {
        // Increment my own counter
        this.counters[this.id]++;
        // Broadcast diff. We can send the entire `counters` map but it's not necessary since
        // this node only updates its own counter
        broadcast(this.id, this.counters[this.id]);
    }

    getCount() {
        // Sum the counts
        return Object.values(this.counters).reduce((a, b) => a + b, 0);
    }

    onBroadcastReceive(dId, dCounter) {
        const current = this.counters[dId] ?? 0;
        // We take the max so that we can't rollback any changes when we come back online
        if (dValue > current) {
            this.counters[dId] = dValue;
        }
    }
}
```

Now, we're not just storing one counter, but rather a map of counters and the `getCount` function will sum them all up. In more complicated data types, the `onBroadcastReceive` will involve a more complex reconcilliation algorithm.

## Definition
Now that we've seen an example, I think it's useful to define a CRDT. It's a special kind of data structure designed for distributed systems where copies of the same data might exist on multiple machines at the same time. Each copy can be updated independently, even while offline, and when those updates are eventually shared between machines, all copies will converge to the same value without needing a central authority or manual conflict resolution.

The “conflict-free” part of CRDT is the cool part: CRDTs are built so that merging two different versions is mathematically guaranteed to give the same result no matter the order or frequency of merges. That means they work even when:
- Network partitions happen (two nodes can’t talk for a while).
- Updates arrive out of order.
- The same update is received multiple times.

Even though I only looked at counters, I think it should be apparent that the CRDT approach applies to all types of data structures (sets, maps, registers, etc). It should also be pretty clear how we'd implement a decrement for the counter. 

*Hint*: We can't just decrement the value in the counter, since we are currently taking the `Max` inside of the `onBroadcastReceive` function to avoid any possible accidental rollback. Instead we should use a separate decrement data structure.

Obviously what Google Docs and Figma do is a lot of more complicated than a simple data structure, but the idea is still similar. Each computer will hold their local state, as well as the state of the other computers, and then use a deterministic merging technique to converge to the correct state of the world.

## References
- https://www.youtube.com/watch?v=gZP2VUmH05A
- https://www.youtube.com/watch?v=uOKrTc3Q0D0
- https://ably.com/blog/crdts-distributed-data-consistency-challenges