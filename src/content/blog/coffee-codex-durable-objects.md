---
title: "Coffee Codex - Durable Objects"
description: "Learning about durable objects"
pubDate: "Apr 04, 2026"
heroImage: "/coffee-codex/durable-objects/cover.png"
---

## Introduction

I'm at North of Main Cafe in Bellevue, WA, and today I'm learning about Durable Objects from Cloudflare. I've never used Durable Objects and had only heard of them briefly, but they seem like cool technology.

![Coffee](/coffee-codex/durable-objects/coffee.webp)

## The interface
I think it'll be good to start with a code example for how Durable Objects are used.

```typescript
export class Counter {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    let count = (await this.state.storage.get("count")) || 0;
    count++;

    await this.state.storage.put("count", count);

    return new Response(count.toString());
  }
}
```
This is a simple counter example, but it demonstrates the core idea of Durable Objects (DOs). Notice how we can do `count++` safely without the need for a lock. We'll see how that's possible in the next section.

Anyone can invoke the `fetch` method from this counter within a worker like this:

```typescript
const id = env.COUNTER.idFromName("counter-123");
const counter = env.COUNTER.get(id);

await counter.fetch("https://do/");
```

Notice how we don't do something like `new Counter("counter-123")`. Instead, `idFromName` returns the ID, and `COUNTER.get(id)` returns a stub for us to use. If `counter-123` does not exist when calling `fetch`, it will be created by invoking the constructor automatically.

Of course, it's just a class, so we can add more methods.

```typescript
export class Counter {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/increment") {
      return this.increment();
    }

    if (url.pathname === "/value") {
      return this.getValue();
    }

    return new Response("Not found", { status: 404 });
  }

  async increment() {
    let count = (await this.state.storage.get("count")) || 0;
    count++;

    await this.state.storage.put("count", count);

    return new Response(count.toString());
  }

  async getValue() {
    const count = (await this.state.storage.get("count")) || 0;
    return new Response(count.toString());
  }
}
```

And invoke it like this:

```typescript
export default {
  async fetch(request, env) {
    const id = env.COUNTER.idFromName("global");
    const counter = env.COUNTER.get(id);

    return counter.fetch(request);
  },
};
```
Here I chose to do the routing (e.g. `/value` vs `/increment`) in the DO instead of the worker, but either should work.

## How it works
It's a single-threaded singleton. If two people try to invoke `/increment` at the same time, they are executed sequentially, and there is exactly one active instance per ID globally. That means if two workers are calling `counter.fetch` on the global counter, only one request is executed at a time inside the Durable Object, leading to no race conditions.

In the future, I'll write about the real engineering behind it and how Cloudflare guarantees this singleton behavior!

## References
- https://developers.cloudflare.com/durable-objects/
- https://www.youtube.com/watch?v=C5-741uQPVU
- ChatGPT for clarifications
