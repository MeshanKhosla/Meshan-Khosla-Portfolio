---
title: "Coffee Codex - OLAP vs OLTP"
description: "Learning about OLAP vs OLTP workloads and storage patterns"
pubDate: "Sep 06, 2025"
heroImage: "/coffee-codex/olap-oltp/cover.png"
---

## Introduction
I'm at North of Main Cafe in Bellevue WA and today I'll be looking into OLAP vs OLTP workloads. I was watching [this](https://www.youtube.com/watch?v=LHWgQn8F7tU) video from Ben Dicken and I thought the locality of how row/column store data is stored on disk was very interesting. This will be a pretty short post but I should still learn a decent amount.

![Coffee](/coffee-codex/olap-oltp/coffee.jpg)

## OLTP vs OLAP
Online Transaction Processing (OLTP) workloads are the kind of workloads we often think of when thinking about databases. They are short and real-time and have ACID properties. For web applications, these are what we use. MySQL, Postgres, DynamoDB, etc all excel at OLTP workloads. Online Analytical Processing (OLAP) databases are types of workloads that are more long running and try to answer analytical questions like "How many users churned over the past 3 weeks in California". If you try to answer this question using a classic MySQL setup, then you'd probably have to do a full table scan. Examples of databases designed for OLAP workloads are Snowflake and Amazon Redshift.

The interesting part is how this data tends to be laid out on disk. With OLTP workloads, we would like to have the columns of a row right next to each other. So given this table:

| id | username | email | created_at | last_login | location |
|----|----------|-------|------------|------------|----------|
| 1  | alice    | alice@example.com | 2024-01-15 10:30:00 | 2024-09-06 14:22:00 | Seattle, WA |
| 2  | bob      | bob@example.com | 2024-01-16 09:15:00 | 2024-09-05 16:45:00 | Portland, OR |
| 3  | charlie  | charlie@example.com | 2024-01-17 14:20:00 | 2024-09-04 11:30:00 | San Francisco, CA |

we commonly want to run a query like

```sql
SELECT * FROM table WHERE id=2;
```

Because of this, it is very efficient to have 
```
|2|bob|bob@example.com|2024-01-16 09:15:00|2024-09-05 16:45:00|
```

spatially located right next to each other on disk, since we are often querying for columns for a specific row.

## Column-store databases
Instead, OLAP-focused databases tend to use column store databases which basically transposes the table:

```
|1|2|3|
|alice|bob|charlie|
|alice@example.com|bob@example.com|charlie@example.com|
|Seattle, WA|Portland, OR|San Francisco, CA|
```

The reason why this is useful is because given the question "How many users churned over the past 3 weeks in California?", we only need to read the `location` column and `last_login` column (the relevant rows in our transposed table) rather than scanning through all the data for each user. Since all the location values are stored contiguously on disk (and all the last_login values are stored contiguously), we can read just those specific columns very efficiently. This makes analytical queries much more efficient since we can process entire columns at once instead of reading row by row and skipping over irrelevant data. 

## References
- https://www.youtube.com/watch?v=LHWgQn8F7tU