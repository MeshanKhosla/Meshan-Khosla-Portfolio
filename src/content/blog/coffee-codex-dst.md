---
title: "Coffee Codex - Deterministic Simulation Testing"
description: "Learning about deterministic simulation testing (DST)"
pubDate: "Oct 24, 2026"
heroImage: "/coffee-codex/dst/cover.webp"
heroImageWidth: 2002
heroImageHeight: 1128
---

## Introduction

I'm at Dote Coffee in Bellevue, WA, learning about deterministic simulation testing (DST). I know testing isn't the most exciting part of computer science, but I've been hearing a lot about DST, so I figured it's about time to learn what it is.

<img src="/coffee-codex/dst/coffee.webp" srcset="/coffee-codex/dst/coffee-640.webp 640w, /coffee-codex/dst/coffee-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="3024" height="4032" alt="Iced coffee at Dote Coffee" loading="lazy" decoding="async" />

## Testing

The types of testing I'm familiar with are unit testing, integration testing, and canary testing. 

Unit testing is typically scoped to a component of code and usually mocks providers and APIs. It's to make sure future code changes don't break the invariants laid out in the initial code. Unit testing is also the most susceptible to tautological testing, meaning effectively testing `true == true`. If testing a React component, a unit test might click on a button and assert that it goes into a disabled state.

Integration tests test the end-to-end system. If testing a website, an integration test will log into the website, click some buttons, drag some components, and assert the end state, typically with screenshots. If testing a backend system, an integration test will invoke an API and assert the output.

Canary tests are similar to integration tests, but they run on an interval instead of on CI. So a canary test may call the integration test, but it runs the test every 15 minutes to ensure another system did not cause a regression in our system.

## DST

Before we start learning about DST, I'm going to guess what it solves. In the previous paragraph, I said:
> If testing a backend system, an integration test will invoke an API and assert the output.
which was purposely vague. Backend systems, and especially distributed systems, are very prone to nondeterministic outcomes. So my guess is that DST is similar to <a href='/blog/coffee-codex-p/'>what P provides</a>, which I have written about before. I'm guessing it has techniques to do things like use a fixed clock in order to make nondeterministic cases deterministic.

Ok, let's start. I'm going to read through [this](https://notes.eatonphil.com/2024-08-20-deterministic-simulation-testing.html) post by Phil Eaton.

Phil starts off by talking about the problem I just described (bugs in distsys are hard) and gives the same example of a clock! He also mentions random numbers.
> DST merely assumes that you have a global seed for all randomness in your program and that the simulator controls the seed.
The power of a random seed is that, once you observe a failure, you can fix that random seed to hopefully reproduce it. At the very least, it's one less knob to dial when debugging a system with hundreds of dials. 

Frameworks like [Effect](https://effect.website/) (and yes, most Java frameworks) support this very well with dependency injection. You can have your program use a `Random` layer which can be fixed during testing. 

```ts
import { Effect, Random } from "effect"

// Effect v3: simulate a request that randomly succeeds or fails.
const request = Effect.gen(function* () {
  const value = yield* Random.next
  return value < 0.5 ? "failed" : "succeeded"
})

const replay = (seed: string) =>
  Effect.runSync(request.pipe(Effect.withRandom(Random.make(seed))))

console.log(replay("bug-123"))
console.log(replay("bug-123")) // Same result as above.
```

Each replay creates a fresh random generator with the same seed, so it produces the same result. If a test fails, I can save its seed and use it to reproduce the random choices. This only controls randomness. Another good example of this is an exponential backoff algorithm, since the jitter is random.

The way FoundationDB puts it is "design the system under test so that all nondeterministic components are pluggable", which I think is a good summary.

There are other forms of non-determinism like network ordering that can also be tested using DST. For example, we can replace the real network with a simulated one. The simulator queues messages and uses seeded randomness to decide when to deliver them. For example, if a node sends two messages over separate connections, the simulator might deliver the second one first. If that order causes a bug, replaying the same seed reproduces the delivery order, as long as the other sources of nondeterminism are also controlled. I've also written about [Hydro](https://hydro.run/), which is a way to catch some of these bugs at compile time. 

## Antithesis

I also came across [Antithesis](https://antithesis.com/docs/introduction/how_antithesis_works/), which is a company that provides a DST environment. You run your software and its dependencies in it, and it introduces failures like network partitions or nodes going down. If it finds a bug, you can replay what happened.

This seems useful because even if I control the clock and randomness in my own code, I still don't control what happens inside my database. I do still need to give Antithesis something to test and tell it what counts as a bug. For example, if I'm testing bank transfers, I could move money between two accounts and check that the total balance stays the same after each completed transfer, even if a node goes down along the way.

## References

- https://notes.eatonphil.com/2024-08-20-deterministic-simulation-testing.html
- https://antithesis.com/docs/introduction/how_antithesis_works/
