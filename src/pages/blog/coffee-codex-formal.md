---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Formal Methods and P lang"
description: "Learning about how AWS uses P and formal methods to verify system correctness"
pubDate: "June 7, 2025"
heroImage: "/coffee-codex/formal/cover.png"
---

## Introduction
I'm at Woods Coffee in Bellevue, WA and I'm reading [this](https://dl.acm.org/doi/pdf/10.1145/3712057) paper about how AWS uses (semi-)formal methods in their systems. It'll also go into an overview of the [P programming language](https://p-org.github.io/P/).

![Coffee](/coffee-codex/formal/coffee.png)

## What are formal methods
When designing a system like AWS Lambda, S3, and others, the complexity and need for reliability are immense and it's really hard to guarantee correctness. Formal methods are mathematical techniques used to specify, develop, and verify systems with a high degree of assurance. Instead of relying solely on testing or intuition, formal methods allow engineers to prove that certain behaviors are either guaranteed or impossible. These methods help catch subtle design flaws early, long before they manifest as bugs in production. In large-scale distributed systems, where the cost of failure is high, formal methods provide a rigorous foundation for building trustworthy infrastructure.

A good example where integration testing isn't enough is in ensuring there are no deadlocks in a distributed system. Tests might pass under normal conditions but still miss rare interleavings that can lead to deadlocks or race conditions—issues that only show up under specific timing scenarios. While integration tests are great and necessary, they can often miss edge cases and not test every situation. This is where formal methods shine: they can systematically analyze all potential behaviors of the system, including edge cases that are practically impossible to reproduce through testing alone.

## History of Formal Methods
TLA+ is the gold standard for formal methods. It's a language developed by Leslie Lamport and the syntax looks like this for a mutex:
```
------------------------------ MODULE Mutex ------------------------------
VARIABLES pc

Init == pc = [self \in {"A", "B"} |-> "start"]

Next ==
  \E self \in {"A", "B"}:
    \/ /\ pc[self] = "start"
       /\ pc' = [pc EXCEPT ![self] = "wait"]
    \/ /\ pc[self] = "wait"
       /\ \A other \in {"A", "B"} \ {self}: pc[other] # "cs"
       /\ pc' = [pc EXCEPT ![self] = "cs"]
    \/ /\ pc[self] = "cs"
       /\ pc' = [pc EXCEPT ![self] = "start"]

=============================================================================
```
This defines a system with two processes, "A" and "B", which can move through states "start", "wait", and "cs" (critical section). The Next action describes the allowed transitions between these states. The model checker can then verify properties like: "no two processes are in the critical section at the same time."

While TLA+ is very powerful, I think we can all agree that it's not the most readable thing in the world. Moreover, when you have hundreds of engineers who would like to write their own specifications, it would be nice to have a language that is easier to master. Something like this:

```
machine MutexUser {
  var other: machine;
  var inCS: bool;

  start state Init {
    entry {
      inCS = false;
      other = null;
      goto Ready;
    }
  }

  state Ready {
    on EnterCS do tryEnterCS;
  }

  fun tryEnterCS() {
    if (!inCS && !send Query(other)) {
      inCS = true;
      print("Entered critical section");
      // simulate doing work
      send ExitCS to self;
    }
  }

  on ExitCS do exitCS;

  fun exitCS() {
    inCS = false;
    print("Exited critical section");
  }
}

spec MutualExclusion observes inCS;
```

While a bit longer, the syntax here is more obvious to a traditional software engineer, allowing engineers to become proficient much quicker. This is the P language. Unlike TLA+, which focuses on state and transitions declaratively, P models systems more like concurrent state machines with message-passing—ideal for systems with real-world async behavior

## The P Programming Language
P is a programming language developed by Ankush Desai at UC Berkeley (go bears) and is intentionally meant to read like a state machine since this is familiar to many developers. It was built for modeling and verifying protocols in asynchronous systems: think networked services, distributed storage, event-driven microservices, etc. Instead of abstract math, you write familiar-looking code with machines, states, events, and transitions.

One of the coolest things about P is that it's not just a specification language—it's also executable. You can run your model like a program, or use P’s checker to systematically explore all possible interleavings of concurrent events. This means you can find deadlocks, race conditions, and invariant violations before you even implement the real system. You can also include assertions, write safety properties, and simulate failure scenarios—all from the spec.

At AWS, P has been used in critical parts of infrastructure. One major example is when S3 transitioned from eventual to strong consistency. That kind of change is terrifying if you don’t have confidence in the correctness of your protocols. P was used to model the new system behavior and verify that it satisfied key properties like linearizability before it was ever deployed.

Unlike TLA+, which is more math-heavy and declarative, P feels closer to how we write actual code. The tradeoff is that you might need to think more carefully about modeling state transitions and concurrency. But the payoff is huge: you get a testable, verifiable spec that integrates into your CI pipeline, gives quick feedback during development, and helps you avoid whole classes of production bugs.

Now, P isn't only limited to CI, as the AWS team is building PObserve, which takes structured logs from the production execution of distributed systems and validate them against the P spec.

## Lightweight formal methods
Lightweight formal methods are less rigorous (but far more accessible) ways to bridge the gap between full-blown formal verification and day-to-day engineering. These include techniques like property-based testing, deterministic simulation, coverage-guided fuzzing, and even failure injection. They're especially helpful when a full specification would be too heavy, but you still want strong guarantees about system behavior.

### Property-Based testing
In Amazon S3’s ShardStore, the team used property-based testing not just to check correctness, but to actually speed up development. Instead of writing specific test cases, they wrote general properties about how the system should behave—and then let the test framework generate tons of inputs to try and break those assumptions.

Basically, they built a system where the properties acted like always-on assertions, and the tooling around it aggressively tried to falsify them. If something broke, you got a small, understandable repro case instead of a mystery failure. The test framework would generate a bunch of random sequences like put → delete → get, or put → crash → recover → delete → get, and then check if the final get actually returns nothing. If something broke, like the key unexpectedly still being there after a crash-recovery cycle, the tool would minimize the test to just the smallest sequence that reproduces the bug—so instead of a 200-step scenario, you'd get a 3-step repro that’s easy to debug.

### Deterministic simulation
Another lightweight method that’s gotten a lot of traction at AWS is deterministic simulation testing. The idea is pretty clever: instead of letting your distributed system run with all its normal nondeterminism—like random message delays, race conditions, and thread scheduling, you run it inside a simulator that gives you total control over all of that.

In practice, this means you can execute a whole distributed protocol on a single thread, and the simulator decides exactly when messages are delivered, when nodes crash, and how things are scheduled. Developers can write tests for really specific scenarios—like “what if this node fails right after it sends a commit but before it hears back from the others?”—and the simulator will replay that exact flow. You can also tell the framework to fuzz different orderings or even explore all possible interleavings to try and surface tricky edge cases.

This approach brings a lot of the complexity of failure and concurrency testing out of flaky integration tests and into fast, repeatable unit-style tests. Since everything is deterministic, tests are easy to reproduce and debug. And because it all runs at build time, you don’t need a full deployment or live environment to test things like network partitions or message loss.

The tool they use for this is open source, and is called [Shuttle](https://github.com/awslabs/shuttle).

### Fuzzing
Fuzzing is a testing technique where you throw large volumes of randomly generated inputs at a system to try and break it. It’s especially useful for surfacing edge cases that traditional tests miss. At AWS, continuous fuzzing is used during integration testing—for example, in Aurora’s data-sharding feature, they fuzzed SQL queries and full transactions to make sure sharding logic didn’t break correctness.

They ran these queries against both the sharded and non-sharded versions of the engine and compared results using a known-good oracle. Combined with fault injection, fuzzing also helped catch issues around atomicity, consistency, and isolation. It’s like stress-testing your assumptions at scale, and with randomness on your side.

## Formal proofs
Sometimes testing and lightweight methods aren't enough. For critical systems where security boundaries are involved, like virtualization or authorization, AWS has gone all-in on formal proofs, where they use math to prove that certain properties will always hold, no matter what.

Take Firecracker, the lightweight virtual machine monitor behind Lambda and Fargate. It uses a protocol called virtio to emulate devices like network cards or SSDs for guest VMs. I wrote more about firecracker <a href="/blog/coffee-codex-lambda.md">here</a>. To lock this down, the Firecracker team used a tool called Kani, which can verify properties of Rust code using symbolic execution. Instead of just testing what happens with a few inputs, they formally proved that key safety properties of the virtio interface always hold, regardless of what a malicious guest might do.

This kind of formal proof isn’t about catching bugs—it’s about ruling them out entirely. And AWS has been investing in more tools to make this practical, like Dafny (used in the Cedar policy language) and Lean, all powered by SMT solvers under the hood.

Proofs are expensive, but for parts of the stack where correctness is absolutely non-negotiable, it’s worth it.

Next time I'll take a deeper look at P and write about some examples!

## References
- https://dl.acm.org/doi/pdf/10.1145/3712057 (Systems Correctness Practices at AWS)