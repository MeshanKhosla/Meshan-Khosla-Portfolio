---
title: QStash Python SDK
company: Upstash
companySlug: upstash
visual: python
summary: The Python SDK for publishing, scheduling, verifying, and inspecting QStash messages.
order: 3
legacySlug: upstash-qstash-python-sdk
links:
  - label: GitHub
    href: https://github.com/upstash/qstash-py
  - label: PyPI
    href: https://pypi.org/project/qstash/
  - label: SDK docs
    href: https://upstash.com/docs/qstash/sdks/py/overview
---

I built the QStash Python SDK from the initial project setup through its first releases. The client covered message publishing, schedules, URL Groups, logs, the dead-letter queue, and the other resource APIs someone needed to use QStash without dropping down to raw HTTP requests.

![The QStash Python SDK documentation card.](/shipped/qstash-python-docs.webp)

<p class="image-source">Image from <a href="https://upstash.com/docs/qstash/sdks/py/overview" target="_blank" rel="noopener noreferrer">QStash Python documentation</a>.</p>

The SDK maps onto the same QStash API as the TypeScript client, but I did not want it to feel like a direct translation. I added typed request and response models, Python-style method names, JSON publishing helpers, and handling for QStash features such as delays, retries, callbacks, forwarded headers, and deduplication.

I built both synchronous and `asyncio` clients with the same resource-oriented interface. Keeping those implementations aligned was a substantial part of the work: publishing a message, creating a schedule, or working with the DLQ should behave the same way regardless of whether the application was synchronous or async. I later added batch publishing and queue support to both sides as those features became available in QStash.

The package also included a `Receiver` for verifying messages at their destination. It validated the JWT signature, issuer, URL, expiration, and hash of the request body, while supporting both the current and next signing keys so key rotation did not break message delivery.

I set up the tests, type checking, CI workflows, examples, and packaging as part of the SDK as well. Those pieces mattered because this was a public library: the API needed to be easy to discover, statically understandable, and reliable across both normal and async Python applications.
