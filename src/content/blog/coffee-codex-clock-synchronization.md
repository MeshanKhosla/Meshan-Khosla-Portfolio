---
title: "Coffee Codex - Clock Synchronization"
description: "Learning about synchronizing clocks in Distributed Systems"
pubDate: "February 1, 2025"
heroImage: "/coffee-codex/clock-synchronization/cover.png"
---

## Introduction
I'm at Semicolon Cafe in Bellevue, WA and I'm learning about synchronizing clocks in distributed systems.

![Coffee](/coffee-codex/clock-synchronization/coffee.jpeg)

## Recap

In the <a href="/blog/coffee-codex-clocks">last post</a>, I learned about the importance of clocks and specifically how physical clocks (quartz vs atomic) are used in computing. Today I'll learn how these clocks stay synchronized with each other since quartz clocks tend to drift.

## Synchronization techniques

In order to minimize clock skew, which is the difference between two clocks at the same point in time, we can use protocols like Network Time Protocol (NTP) or Precision Time Protocol (PTP).

Most operating systems implement NTP and the basic idea is that clients query this server and the server will respond with the current time. The server typically has an atomic clock or a GPS Receiver. Typically there is a hierarchy of time servers used for efficiency and time is determined by using statistics to determine the time from multiple servers.

The accuracy of this strategy tends to be fairly accurate (within a few milliseconds) but this is of course dependent on networking conditions. Interestingly, there doesn't seem to be a clear definition of what 'synchronized' means, as in how much drift constitutes as acceptable.

### NTP

The process for determining clock skew goes like this:

_Note that the timestamps are with respect to the sender, so `t1` is timestamp 1 which the client sees_

1. Client sends a request to the NTP server at `t1`
2. Server receives this request at `t2`
3. Server fetches the current time from a reliable source (i.e. an atomic clock)
4. Server sends this time back as `t3`
5. Client receives this request at `t4`

It seems there are 2 important assumptions being made here:
1. 1 second on the client clock == 1 second on the server clock
2. Since `t3` is supposedly the accurate time and the response time, there must be some processing delay which is minimized

After this, the client can calculate the clock skew.

```
Round-trip network delay (δ) = (`t4` - `t1`) - (`t3` - `t2`)
```

This is the amount of time a request spent in the network. It's the client's perceived total time minus the server processing time. Importantly, we don't know the one-way latency, meaning we don't know how long the request took. We can't simply take `t2`-`t1` because that would require clocks to be synchronize, which is what we're trying to achieve.

Because of this, NTP assumes a symmetric network latency, meaning `δ/2` is assumed to be both the request latency and the response latency. This will help us determine what the server time should be when the client receives the request. Again, `t4` is the client response time, but we'd like to know how that differs from the time the server thinks it is.

In order to calculate the server time for when the client received the response, we can use `t3 + (δ/2)`, or the server-sent time plus the assumed network latency.

With this, the clock skew can be measured as the (server-perceived time) - (client-perceived time) or `t3 + (δ/2)` - t4. After simplifying, we get `θ = (t2 - t1 + t3 - t4) / 2`.

![Sync diagram](/coffee-codex/clock-synchronization/skew-calculation.png)
(From DDIA)

After finding the skew (θ), the client can correct itself. 
 
If θ < 125 ms, NTP slews the clock, meaning it changes the speed at roughly 0.5ms per second
If 125 ms ≤ θ ≤ 1000s, NTP steps the clock, forcibly adjusting it
If θ is too large, NTP does nothing, which can be problematic for systems that rely on accurate clocks.

Given this, why might this code that we've all written be problematic?

```typescript
const startTimestamp = Date.now();
doSomeWork(); // Point a
const endTimestamp = Date.now();

const timeDifference = endTimestamp - startTimestamp;
console.log(`Time taken for the operation: ${timeDifference} ms`);
```

The reason is because it's possible NTP decided to step the time at exactly Point a, causing the time difference to be way off, or even negative.

The safe way to do this in JavaScript is to use performance.now(), which is a monotonically increasing timer that typically starts from the system boot time.

Next time I'll be learning about causality and happens-before graphs!

References
- https://www.youtube.com/watch?v=mAyW-4LeXZo (DDIA lecture series)
- https://chatgpt.com - ChatGPT for clarifications (can't share direct link because I uploaded an image)
