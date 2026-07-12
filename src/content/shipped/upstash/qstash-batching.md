---
title: Batching support in QStash
company: Upstash
companySlug: upstash
visual: batch
summary: Support for publishing multiple QStash messages in one API request.
order: 2
legacySlug: upstash-qstash-batching
links:
  - label: Announcement post
    href: https://upstash.com/blog/qstash-fifo-parallelism
  - label: Feature docs
    href: https://upstash.com/docs/qstash/features/batch
  - label: API reference
    href: https://upstash.com/docs/qstash/api-reference/messages/batch-messages
---

I implemented the batch endpoint in Go so callers could publish multiple QStash messages in one request. Before this, publishing a large set of messages meant making a separate API request for every message.

![The QStash documentation card for batching.](/shipped/qstash-batching-docs.webp)

<p class="image-source">Image from <a href="https://upstash.com/docs/qstash/features/batch" target="_blank" rel="noopener noreferrer">QStash documentation</a>.</p>

Each entry still maps to a normal QStash message, with its own destination, body, and headers. A single batch can mix direct URLs, URL Groups, and queues, which meant the endpoint had to preserve the behavior of the existing publish paths rather than introduce a separate kind of message.

The response also stays aligned with the batch. Each message gets its own result, and URL Groups return a result for every destination in the group. If one entry fails validation or cannot be sent, it gets an error response without preventing the other valid messages from being published.

This reduced the number of network round trips for bulk publishing while keeping retries, deduplication, queues, and delivery behavior consistent with the rest of QStash.
