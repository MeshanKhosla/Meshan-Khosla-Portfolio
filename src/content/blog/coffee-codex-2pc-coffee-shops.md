---
title: "Coffee Codex - 2PC at Coffee Shops"
description: "Two-phase commit at coffee (and ice cream) shops"
pubDate: "Feb 7, 2026"
heroImage: "/coffee-codex/2pc-coffee-shops/cover.png"
---

## Introduction

I'm at Toasted in Bellevue, WA and I'm reading [this](https://www.enterpriseintegrationpatterns.com/docs/IEEE_Software_Design_2PC.pdf) post about Coffee shops and two phase commit. I thought this was fitting since this is Coffee Codex and I've talked about 2PC <a href="/blog/coffee-codex-p-2pc">before</a>.

![Coffee](/coffee-codex/2pc-coffee-shops/coffee.webp)

## Coffee shop flow

About 5 minutes ago, I went up to a tablet, put in my order, paid, then sat down. This order went to the black box which is the coffee shop internal ordering system, and out comes my coffee. Internally, they've set up a queue for orders. As the orders come in, they place empty cups in order with their identifiers (e.g. latte for Meshan). The author of the article refers to this as an _Asynchronous concurrent system_, since the baristas don't handle your request to completion at once. There can be multiple baristas working different stations, such as one making blended drinks. This means that the coffee shop flow is not a typical FIFO, since I could have ordered a slower drink than the person behind me, which was made by another barista.

## Ice cream flow

I can't help but think about when I went to An's Dry Cleaning in San Diego, which is an ice cream shop. They did not follow this asynchronous model. We waited in a long line, then a batch of 5 customers got processed in parallel. We were synchronously given a tour of the menu with samples. This is not a common pattern due to the high latency, but it's a matter of tradeoffs. It doesn't rain much in San Diego unlike Seattle, so mimicking An's process in Seattle probably wouldn't work well, as everyone would be soaked as they enter the ice cream shop.

## Error handling

In the coffee shop flow, it seems that errors aren't common, but they can happen. Since it's an asynchronous system, a very busy day can result in incorrect orders (this has happened several times). In most cases, it's not worth having an error correcting steps for the baristas, such as triple checking the order and confirming with the customer. Instead, to optimize throughput, baristas make the coffee and call the name on the cup. When an error happens, they have the choice of remaking the order (👍) or refusing to remake the order (👎).

At An's, the possibility of a failure is virtually impossible, I don't even know how it would be possible considering the server (_haha_) is literally walking through each option and listening to what you say.

## 2 Phase Commit

Look at this diagram from the post

![Diagram](/coffee-codex/2pc-coffee-shops/diagram.png)

Notice how the coffee shop flow is expected to be completely asynchronous, but the customer expects somewhat of a synchronous pattern. The coffee shop is operating a full distributed system, whereas the client flow is straightforward. This pattern is known as `Half-sync` or `Half-async`.

So how would 2PC work at a coffee shop? You'd stand at the counter with your money and receipt until your drink is ready. Only then would money, receipt, and drink change hands in one go—nobody leaves until the whole thing is committed. That's exactly what An's does. You wait in line, then you're in a batch with the server until your order is fully decided and fulfilled. So that's the tradeoff: 2PC gives you that all-or-nothing consistency, but it kills throughput. Coffee shops (and most high-volume systems) go async and optimistic and fix mistakes when they happen. When the stakes are higher and latency is acceptable, like An's on a sunny San Diego day, the 2PC-style flow makes sense.

## References

- https://www.enterpriseintegrationpatterns.com/docs/IEEE_Software_Design_2PC.pdf
