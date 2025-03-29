---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Multiple Queues"
description: "Learning about Multiple Queues in bathrooms (Distributed Systems)"
pubDate: "March 29, 2025"
heroImage: "/coffee-codex/queues/cover.png"
---

## Introduction
I'm at Toasted in Bellevue, WA and I'm learning about queues. Specifically, I'm reading [this](https://brooker.co.za/blog/2025/03/25/two-queues.html) post by Marc Brooker who's a distinguished engineer at AWS. I saw this post on Twitter and it looked interesting so I'll do Broadcast Algorithms II next time.

![Coffee](/coffee-codex/queues/coffee.jpg)

## Queues
Queues are fun, they're often one of the first data structures we learn in school and tend to be synonymous with FIFO. These work great for simple programs where the queue can be implemented with an array and is fully representable in memory. However, as with most things, scaling queues is harder. In distributed systems, we often turn to services like AWS Simple Queue Service (SQS) to handle queueing. In college, I even implemented an [Office Hours Queue](https://github.com/Berkeley-CS61B/simple-office-hours-queue) which we used to hold office hours.

## Multiple Queues
In his blog post, Marc talked about a conundrum that every man has probably faced: bathroom queueing. He talks about the idea of precommitment and how when we go to use the bathroom, the choice between #1 and #2 is already made up in our minds. However, oftentimes the queue to get into the bathroom tends to be singular, meaning there's only one queue for both.

I think the primary reason for this is that the door width is a huge bottleneck. A typical public restroom door can fit 1.5 - 2 adult men, which does not leave enough breathing room if we were to have a dual-queue system. Oftentimes, when I'm faced with this dilemma, I will "cut" the line until the vessels for #1 are in clear sight. If they are all occupied, I will return to the end of the queue. However, I'm not sure if I've ever had it be the case where I had to return back to the end.

The throughput for those who have to use a urinal is very quick, estimated to be 10 times faster than their counterparts according to Marc. This made me realize that a long line is rarely indicative of a lack of urinals.

## MLFQ
Back to computer science, this reminds of CPU scheduling, specifically the idea of a Multi Level Feedback Queue (MLFQ) in operating systems scheduling. With an MLFQ, there are multiple FIFO queues which will pre-empt tasks according to their quantum time and priority. Unfortunately, I don't think we can use many topics from operating system scheduling theory since most of them will rely on pre-emption. I don't know about you, but I would not want to (or maybe am not able to) pause midway to give someone else a chance.

## Conclusion
Maybe we need to make doors wider in order to allow for multiple queues? Or maybe this is a problem that shouldn't be solved. Maybe there's value in having these imperfections in society. Otherwise, we wouldn't have had this post from Marc. And I agree with the premise that when there are multiple end-goals, such as when a request **needs** to go to Server A xor Server B, then it's a good rule of thumb to have separate queues for both of them. This also applies to priorities: it makes sense to have a separate queue for priorities like we saw in MLFQ even when pre-emption is not possible.

> Perhaps one thing we’ll learn is whether this was a wise choice of framing for a blog post.

Yes, yes it was.


## References
- https://brooker.co.za/blog/2025/03/25/two-queues.html (Blog post)