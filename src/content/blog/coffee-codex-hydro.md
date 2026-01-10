---
title: "Coffee Codex - hydro.run"
description: "Learning about hydro.run"
pubDate: "Oct 18, 2025"
heroImage: "/coffee-codex/hydro/cover.png"
---

## Introduction

I'm at T'Latte in Bellevue, WA and today I'm learning about hydro.run.

![Coffee](/coffee-codex/hydro/coffee.jpg)

I learned about [P](https://p-org.github.io/P/whatisP/#p-language) in a previous blog post, and it looks like there's a new way to develop Distributed Systems that came out of Berkeley (go bears) called [Hydro](https://hydro.run/)!

## What is Hydro
I'm going to start understanding what Hydro is by starting out with the safety and correctness guarantees. Interestingly, the [docs](https://hydro.run/docs/hydro/correctness) say Hydro "helps ensure distributed safety" but then later on says "safety guarantees" so I'm not sure if developing a system in Hydro is **guaranteed** to avoid these issues. Anyway, the properties include (but are not limited to, I think) 
- Non-determinism due to message delays 
- Using mismatched serialization and deserialization formats across services 
- Misusing node identifiers across logically independent clusters of machines 
- Relying on non-deterministic clocks for batching events - I've written about this in a <a href="/blog/coffee-codex-clocks">previous post</a>

Ok, now let's go to the introduction. It looks like Hydro is the framework you write a distributed system in, whereas P is a language you verify your programs in _before_ writing it. 

> Hydro uses a two-stage compilation approach. Hydro programs are standard Rust programs, which first run on the developer's laptop to generate a deployment plan. This plan is then compiled to DFIR to generate individual binaries for each machine in the distributed system (enabling zero-overhead abstractions), which are then deployed to the cloud using the generated plan along with specifications of cloud resources.

Ok, this clears things up. So Hydro is a compiler for a distributed system written in Rust. At the end of the two stages, we're left with binaries that can be deployed onto multiple nodes of a distributed system. That black box looks to be their DFIR runtime.

So why use this instead of just writing microservices or using gRPC? The big idea is that Hydro is to distributed systems what Rust is to memory management: you write simple dataflow pipelines and the compiler handles all the networking, serialization, and safety guarantees so you can't shoot yourself in the foot with common distributed systems bugs. I do wonder if this provides debuggability trouble.

## The Network
Let's watch the linked [video](https://www.youtube.com/watch?time_continue=35&v=LdZ94m7anTw&embeds_referring_euri=https%3A%2F%2Fhydro.run%2F&source_ve_path=MTI3Mjk5LDI4NjYzLDEzNzcyMSwxMjcyOTksMjg2NjY). It seems like the process of writing a distributed system currently involves writing a binary and deploying that to multiple nodes. So I wonder if the output binaries are different for each node in Hydro? I do like that the `send` method is used in the process of programming with Hydro so the network is always being considered.

Even then, the code in the video is very simple. Even if we ignore the Rust part, it's just a function that takes in a leader and cluster of workers, and does the logic of the worker, then sends it to the node. Nothing is magical except for maybe the `q!` macro.

```rust
pub fn estimate_pi<'a>(leader: &Process<'a, Leader>, workers: &Cluster<'a, Worker>) {
    let samples: Stream<(i32, i32), Timestamped<_>, _> = workers
        .tick()
        .spin_batch(batch_size: q!(1024))
        .map(q!(|_| {
            rand::random::<(f64, f64)>()
        }))
        .fold(init: q!(|| (0, 0)), comb: q!(|(total_in_circle, total_in_square), (x, y)| {
            if x * x + y * y <= 1.0 {
                *total_in_circle += 1;
                *total_in_square += 1;
            } else {
                *total_in_square += 1;
            }
        })) 
        .all_ticks();
    
    let all_samples: Stream<(i32, i32), Process<'a, _>, _, _> = samples.send_bincode_interleaved(leader);
    let total_aggregation: Optional<(i32, i32), Process<'a, _>, _> = all_samples
        .reduce_commutative(comb: q!(|all, from_worker| {
            all.0 += from_worker.0;
            all.1 += from_worker.1;
        }));
}
```

Pretty simple for a program that will operate safely in a distributed system.

Next time I'll look more into DFIR!

## References
- https://hydro.run/