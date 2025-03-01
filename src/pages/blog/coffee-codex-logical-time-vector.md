---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Vector Clocks"
description: "Learning about Vector Clocks in Distributed Systems"
pubDate: "March 1, 2025"
heroImage: "/coffee-codex/logical-time-vector/cover.png"
---

## Introduction
I'm at Dote in Bellevue, WA and I'm continuing my exploration of logical clocks with Vector clocks.

![Coffee](/coffee-codex/logical-time-vector/coffee.jpg)

## Recap

In the <a href="/blog/coffee-codex-logical-time-lamport.md">last post</a>, I learned about Lamport clocks, which are a type of logical clock used for causality relationships. Today, we'll learn about some of the shortcomings of Lamport clocks and how Vector clocks solve some of these problems.

## Limitations with Lamport Clocks

With Lamport clocks, we can't always tell which events came before others. For example, if we're given Lamport timestamps `L(a)` < `L(b)`, we don't know if `L -> B` (L happened before B) or `a || b` (a is concurrent with b). 

## Vector Clocks

The goal of vector clocks is to detect which events are concurrent.

First, assume there are `n` nodes in our system that we arrange in a vector, `N`. `N = <N_1, N_2, ..., N_n>`

The timestamps of an event, `a` can also be represented in a vector. `V(a) = <t_1, t_2, ...., t_n>`. So for each event, there is a vector where each element represents each node.
The value of `t_i` is the number of events observed by Node `N_i`.

Similar to Lamport clocks, each node maintains a local timestamp, `T` but in vector form. On every event from node `i`, `T[i]` is incremented. On every network request, `T[i]` is incremented and the vector + message is sent to the recipient. On receiving a message + vector, the recipient updates their `T` to be an element-wise max of the timestamps and then increments `T[i]`.

In code, the algorithm looks like this:

```typescript
const i = 3; // Example node number out of N
const T = Array(N).fill(0);

function doLocalEvent(e) {
	eventLogic(e); // Abstracted
	T[i] = T[i] + 1;
}

function sendNetworkRequest(message) {
	T[i] = T[i] + 1;
	sendRequest(T, message); // Abstracted
}

function receiveNetworkRequest(senderT, message) {
	for (let i = 0; i < T.length; i++) {
		T[i] = Math.max(T[i], senderT[i])
	}
	T[i] = T[i] + 1;
	processMessage(message); // Abstracted
} 
```

With vector timestamps, we can think of an event as a combination of itself and all preceding events.

### Vector Clock Properties

Assuming `n` nodes and timestamps `T`

- `T = T' iff T[i] = T'[i] ∀ i ∈ {1, ..., n}`
In other words, every component of T is equal to the corresponding component of T'.
```typescript
function eq(T: VectorClock, U: VectorClock) {
  if (T.length !== U.length) return false;
  for (let i = 0; i < T.length; i++) {
	if (T[i] !== U[i]) return false;
  }
  return true;
}
```

- `T <= T' iff T[i] <= T'[i] ∀ i ∈ {1, ..., n}`
In other words, every component of T is less than or equal to the corresponding component of T'.
```typescript
function le(T: VectorClock, U: VectorClock) {
  if (T.length !== U.length) return false;
  for (let i = 0; i < T.length; i++) {
	if (T[i] > U[i]) return false;
  }
  return true;
}
```

- `T < T' iff T <= T' and T != T'`
In other words, T is less than or equal to T' in every component, and at least one component is strictly less (to show they are not equal).
```typescript
function lt(T: VectorClock, U: VectorClock) {
  return le(T, U) && !eq(T, U);
}
```

- `T || T' iff T ≰ and T' ≰ T`
In other words, T and T' are concurrent if neither T ≤ T' nor T' ≤ T
```typescript
function concurrent(T: VectorClock, U: VectorClock) {
  return !le(T, U) && !le(U, T);
}
```

With these properties, we are able to have a bidirectional implication, unlike Lamport clocks. The intuitive explanation for this is, unlike Lamport clocks, Vector clocks capture more information with the events that occur prior to the current event.

The conclusions we can draw from this are:

- `(V(a) < V(b)) <=> (a -> b)`
- `(V(a) = V(b)) <=> (a = b)` Because of this property, we don't need to send the Node id anymore!
- `(V(a) || V(b)) <=> (a || b)`

## References
- https://www.youtube.com/watch?v=x-D8iFU1d-o&t=66s (DDIA lecture series)