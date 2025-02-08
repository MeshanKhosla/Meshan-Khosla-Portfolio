---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Causality and happens-before"
description: "Learning about causality in Distributed Systems"
pubDate: "February 8th, 2025"
heroImage: "/coffee-codex/causality/cover.png"
---

## Introduction
I'm at Bellden Cafe in Bellevue, WA and I'm learning about ordering using time in distributed systems.

![Coffee](/coffee-codex/causality/coffee.jpeg)

## Recap

In the <a href="/blog/coffee-codex-clock-synchronization">last post</a>, I learned about how clocks stay synchronized using the NTP protocol and how computers can step or skew the time based on their response from the NTP server. Today, I'll learn about causality as it relates to clocks and explore happens-before.

## The Problem

Consider a message sending system with 3 participants (A/B/C) where the order of events is not guaranteed. If A sends a message `m1` and B responds with `m2`, it's possible for C to receive these messages in the order `m2` followed by `m1`, leading to an inconsistent ordering of messages. Logically, `m1` **happened-before** `m2` but C did not see it that way.

## Timestamps
A logical solution to this is timestamps, where each user attaches a timestamp to their message and the timestamps are compared to determine event ordering. (`m1` -> `t1`, `m2` -> `t2`) However, even with synchronized clocks, this approach is problematic. There is still an amount of error when a clock uses NTP to be synchronized (see previous post), and it can be the case that the clock skew between the two clocks is greater than the one-way network delay.

For example, if the clock skew is 50ms and the time it takes for `m1` to travel to B is 25ms, it's possible that `t2 < t1`.

## Happens-before
A good way to model ordering is the happens-before relation which defines orderings of events. Events can be things like sending a message or receiving a message.

We say event `a` **happens before** event `b` (`a -> b`) iff any of these are true:
1. `a` and `b` happened at the same node and `a` occurred before `b` according to their *same* clock. This assumes nodes are single threaded and share the same clock.
2. Event `a` is the sending of a **unique** message and event `b` is the receipt of that same message. Assuming the message is unique, `a` must have happened before `b`.
3. There exists an event `c` such that `a -> c` and `c -> b`. This is the transitive property.

If none of the above properties are true, `¬((a -> b) || (b -> a))`, meaning `a` did not happen before `b` and `b` did not happen before `a`, then we say a and b are **concurrent** (a || b). Importantly, this doesn't mean that `a` and `b` occur at the same time, it just means there is no enforced order between the two.

Consider this ordering, how can we use the 3 properties to determine an ordering of events?

![happens before graph](/coffee-codex/causality/happens-before-graph.png)
(From DDIA)

Let's start with (1):

We know `a -> b`, `c -> d`, and `e -> f` because of process ordering.
Now let's look (2):
We can see `b -> c` and `d -> f` because of message ordering. 
Now we can use the transitive property (3):
`a -> c`, `a -> d`, `a -> f`, and `c -> f`

Notice there is no way to get from `a -> e` since we can only go from `a -> b -> c -> d -> f`. This means `(a || e)`. Similarly, `e` is concurrent with all events except `f` because `f` is the only event that knew about `e`. Again, this does not mean two events happen at the same time.

## Causality
Using the happens-before relationship encodes **potential causality**. When `a -> b`, `a` potentially caused `b`. However, when `a || b`, `a` cannot have caused `b`.

Going back to the initial example with A/B/C, we can create a **causal order** of events which is a strict total order. We want `m1` to come before `m2`. That relationship exists because B receives `m1` and **then** sends `m2` which happens in the same process. Therefore, the system can figure out that `m1 -> m2`, establishing a causal order.


## References
- https://www.youtube.com/watch?v=OKHIdpOAxto (DDIA lecture series)
- https://chatgpt.com/share/67a7a69a-b4b4-8002-adb0-26932b5cce67 - ChatGPT for clarifications