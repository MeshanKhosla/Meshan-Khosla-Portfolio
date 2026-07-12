---
title: Distributed Lock SDK
company: Upstash
companySlug: upstash
visual: lock
summary: A Redis-backed lock and debounce SDK for coordinating work across serverless clients.
order: 1
legacySlug: upstash-distributed-lock-sdk
links:
  - label: GitHub
    href: https://github.com/upstash/lock
  - label: npm
    href: https://www.npmjs.com/package/@upstash/lock
  - label: Launch post
    href: https://upstash.com/blog/lock
---

Two serverless requests can arrive at the same time and both decide they should do the same work. That becomes a problem when the work is expensive, calls another service, or writes to a shared resource.

![The Upstash announcement for the distributed lock SDK by Meshan Khosla.](/shipped/lock-announcement.webp)

<p class="image-source">Image from <a href="https://upstash.com/blog/lock" target="_blank" rel="noopener noreferrer">Upstash launch post</a>.</p>

I built an open-source library called `@upstash/lock` around the atomic operations Redis already provides. A client acquires a key only if it does not exist, the key has a lease, and the release checks that the caller still owns the lock. The package also included debounce support.

Because Upstash Redis replicates asynchronously, this is a best-effort lock. It is useful for reducing duplicate work, but it does not provide a strict exactly-once guarantee.

Read the [launch post](https://upstash.com/blog/lock) for more details.
