---
title: "Coffee Codex - DuckDB"
description: "Learning about DuckDB"
pubDate: "Nov 15, 2025"
heroImage: "/coffee-codex/how-duckdb-works/cover.png"
---

## Introduction

I'm at Choo Tea in Bellevue, WA and today I'm learning about DuckDB. I'm working on a BI app for the [Convex x Tanstack Start hackathon](https://www.convex.dev/hackathons/tanstack) and decided to use DuckDB as my analytics engine. It's been working well, but I'd like to learn a bit more about it since I don't really know how it works. I just give it data and execute SQL on it. So I'm going to read [this post](https://endjin.com/blog/2025/04/duckdb-in-depth-how-it-works-what-makes-it-fast).

![Coffee](/coffee-codex/how-duckdb-works/coffee.jpg)

## Columnar Storage

It's important to first understand the idea of columnar storage. In a typical OLTP workload, we store rows of data physically together. So with this dataset:

| id  | name    | age | occupation   | city     |
| --- | ------- | --- | ------------ | -------- |
| 1   | Alice   | 30  | Engineer     | Seattle  |
| 2   | Bob     | 28  | Designer     | Bellevue |
| 3   | Charlie | 35  | Engineer     | Redmond  |
| 4   | Dana    | 26  | Data Analyst | Bellevue |
| 5   | Evan    | 32  | Teacher      | Seattle  |
| 6   | Alice   | 30  | Engineer     | Seattle  |
| 7   | Bob     | 28  | Designer     | Kirkland |
| 8   | Alice   | 30  | Engineer     | Issaquah |

In row storage, we would store (1, Alice, 30, Engineer, Seattle) close to each other on disk. For data warehouse use cases, such as if we wanted to find the average age of engineers in Seattle, we'd need to scan through all of the rows in the table. Even if we had an index on the `occupation` column, we'd still need to retrieve the entire row despite only needing `occupation` and `age`.

With columnar storage, the physical storage method puts columns next to each other instead of rows. The data itself is still the same. With this approach, we can isolate the data we need to just the `occupation` and `age` columns. We can filter the `occupation` column by 'Engineer' and then aggregate the age column. Columnar storage engines also take advantage of optimized hardware and instructions, allowing things like chunking data.

## DuckDB

DuckDB includes some key optimizations like vectorized execution, parallel processing, zone maps, etc., but I think the coolest thing about it is just that it "feels" smart. To use a CSV file in DuckDB, it's as simple as

```sql
FROM file_name.csv
```

and then it's smart enough to figure out the structure of the data. The same goes for JSON and Parquet files.

## How it's different

The idea of columnar storage isn't new, other databases like Snowflake, Redshift, and ClickHouse all use it.

The biggest difference is that DuckDB is embedded rather than client-server. Traditional columnar databases operate as separate services that you connect to over the network. DuckDB runs entirely within the same process as your application, kind of like SQLite but for analytical workloads. This means no network latency, no serialization overhead when passing data around, and no need to manage separate database servers or connection pooling. This makes it a perfect use case for my hackathon project. To be clear, other databases also have embedded versions, but it really seems like DuckDB built it from the ground up this way.

In Python, you can query a Pandas DataFrame directly without copying or serializing the data. You just do something like `duckdb.sql("SELECT AVG(age) FROM df")` and it works because DuckDB can operate directly on in-memory data structures.

Another cool thing is how DuckDB handles Parquet files. When you query a Parquet file, DuckDB can read it directly without loading the entire file into memory or converting it to some internal format. It uses memory-mapped I/O to access the file, and since Parquet is already columnar, DuckDB can process columns directly from the file format. This means you can query massive Parquet files, even ones larger than your available RAM, because DuckDB only reads the columns and row groups it actually needs for your query. Compare this to traditional databases where you'd need to import the data first, which means reading the entire file, converting it to the database's internal format, writing it to disk, and building indexes. DuckDB just skips all of that.

One thing I find interesting is that DuckDB can achieve good performance without relying on pre-computed aggregations or extensive indexing like traditional columnar databases often do. The optimizer uses zone maps, which are metadata about min/max values in each chunk, allowing entire chunks to be skipped if they don't contain relevant data. It also automatically parallelizes queries across available CPU cores and pushes filters down to the storage layer. So you get good performance out of the box without needing to design your schema around pre-aggregations or spend time tuning indexes.

For example, if you have a large Parquet file with sales data and you run a query like:

```sql
SELECT SUM(amount)
FROM sales.parquet
WHERE date >= '2024-01-01' AND date < '2024-02-01'
  AND region = 'West'
```

DuckDB will use zone maps to quickly identify which chunks contain dates in January 2024 and skip all other chunks entirely. The filter on `region = 'West'` gets pushed down to the storage layer, so only relevant column data is read. The aggregation then runs in parallel across multiple CPU cores. All of this happens automatically—you don't need to create indexes on `date` or `region`, and you don't need to pre-aggregate by month or region. DuckDB just figures it out.

Pretty cool

## References

- https://endjin.com/blog/2025/04/duckdb-in-depth-how-it-works-what-makes-it-fast
- https://www.youtube.com/watch?v=p18s8Ckn5H4
- https://www.youtube.com/watch?v=8KGVFB3kVHQ
