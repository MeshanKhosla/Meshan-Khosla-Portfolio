---
layout: "../../layouts/PostLayout.astro"
title: "Coffee Codex - Durable Queues"
description: "Learning about from DBOS about how Distributed Queues were solved"
pubDate: "Sep 13, 2025"
heroImage: "/coffee-codex/dist-queues/cover.png"
---

## Introduction
I'm at Capital One Cafe in Bellevue Washington and I'm reading [this](https://www.dbos.dev/blog/durable-queues) post by DBOS on how they solved distributed queues after 15 years.

![Coffee](/coffee-codex/dist-queues/coffee.jpg)

Looking at the author, Jeremy Edberg, it definitely looks like he knows what he's talking about. He's the CEO of DBOS, ex-Principal engineer at Amazon, Architect at Netflix/Reddit, and most importantly, UC Berkeley alum (go bears). I also learned that DBOS is pronounced Dee-boss and not DB OS.

## Background

When Jeremy was overseeing the architecture of the database and RabbitMQ at Reddit, it looked something like this:

![Reddit architecture](/coffee-codex/dist-queues/reddit.png)

When a user would do an operation like upvote a post, the update would be queued in RabbitMQ and a set of workers would then update the database at a later point. This is useful for a few reasons:

1. Horizontal Scalability - When demand goes up and the queue becomes too full, they'd just need to add more workers
2. Flow control - Since not all operations have the same demand, the rate of the consumers can be adjusted. This helps with avoiding rate limits and lowering the stress on a single worker for resource-intensive tasks
3. Scheduling - Tasks can be scheduled to run in the future or on a cron

The downside to this approach is failures. If the queue processing system goes down, then the data becomes lost. If a worker takes an item off the queue, and then crashes, the data is lost. At Reddit, this did happen semi-frequently.

## Durable Queues
The solution to this problem is to have durable queues. The difference between this and the diagram before is that the queue system isn't RabbitMQ. Instead, it's a durable store which can be another database like Postgres. Each task is a row in the relational database like this:


| id  | task_type   | payload                               | status     | scheduled_at        | started_at         | completed_at       | attempts |
|-----|-------------|---------------------------------------|------------|---------------------|--------------------|--------------------|----------|
| 42  | send_email  | {"user_id":123, "template":"welcome"} | pending    | 2025-09-14 15:30:00 | NULL               | NULL               | 0        |
| 43  | recalc_rank | {"post_id":98765}                     | in_progress| 2025-09-13 12:00:00 | 2025-09-13 12:01:02| NULL               | 1        |
| 44  | backup_job  | {"bucket":"s3://backup-001"}          | failed     | 2025-09-13 09:00:00 | 2025-09-13 09:00:10| 2025-09-13 09:05:12| 3        |

Using this, the workers can retrieve rows that represent tasks that are not completed, need to be retried, etc. This now becomes a scheduling problem with priorities. Since these databases are atomic, two workers will not retrieve the same tasks. This system also works well for subtasks, since the system has a persistent record of all relationships.

## Tradeoffs
Of course, durable queues are not a silver bullet. What you gain in observability and durability, you lose in performance. When having a low volume of critical tasks, durable queues are probably the better bet since they have stronger guarantees. Using traditional queues is likely better when you have a large amount of less important information since you'd rather have the performance gains of using something like RabbitMQ or Redis as opposed to a relational database.

## References
- https://www.dbos.dev/blog/durable-queues


