---
title: "Coffee Codex - Tenancy in Postgres"
description: "Learning about approaches to tenancy in Postgres"
pubDate: "May 2, 2026"
heroImage: "/coffee-codex/tenancy-postgres/cover.png"
---

## Introduction

I'm at Farines Bakery in Bellevue, WA, and today I'm reading [this blog post](https://planetscale.com/blog/approaches-to-tenancy-in-postgres) about approaches to tenancy in Postgres.

The internals of Postgres are pretty foreign to me, so I'm interested in learning about how this differs from other databases.

![Coffee](/coffee-codex/tenancy-postgres/coffee.jpg)

## Multi-tenancy
My understanding of multi-tenancy is pretty simple: multiple users can use the same compute instance, but Simeon defines it much better in terms of databases:

- A **tenant** is a single entity that accesses its data in your application (for example, users of a system)
- **Single-tenancy** is a system that gives each tenant their own isolated schema, logical database, or database cluster
- **Multi-tenancy** is a system where a consistent schema is used for all users within a single database cluster

Of course, now we should define a logical database and a database cluster:

A **logical database** is an isolated namespace within a database cluster that has its own schemas, tables, and data, making a **database cluster** the entire DB server instance, including the Postgres process, storage, replicas, etc.

The three approaches for tenant isolation in Postgres are:

1. Shared schema - Each tenant uses a shared set of tables and is isolated by a column value such as `tenant_id`.
2. Schema per tenant - Each tenant has its own schema and tables.
3. Database per tenant - Each tenant has its own logical database, schema, and tables.

The only true method of multi-tenancy (and the recommended approach) is shared schema. 

## Shared Schema
So I think I may have been overthinking this before, shared schema seems like it's what most applications do because, in most applications, users share the same schema. In a retail orders app, the transaction schema looks like:

| id  | organization_id | customer_id | total_amount |
|-----|------------------|-------------|--------------|
| 1   | org_1            | cust_1      | 49.99        |
| 2   | org_2            | cust_7      | 19.50        |

The `organization_id` is the key column that determines tenancy.

The risk with shared schema is that, if you are writing plain SQL everywhere, you must add a filter clause like `WHERE tenant_id = ...` in every query, which is error-prone. While Postgres does provide RLS capabilities, this is not recommended because it shifts security logic to the database instead of the service code, which is even more prone to misconfiguration.

You can also partition your table by tenant ID, which is pretty cool but only really needed for tables with billions of rows.

```sql
-- Create a partitioned table
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    tenant_id BIGINT NOT NULL,
    customer_name TEXT,
    total NUMERIC,
    PRIMARY KEY (tenant_id, id)
) PARTITION BY LIST (tenant_id);

-- Create a partition for each tenant
-- All rows with tenant_id=1 (UK) go into 'orders_tenant_1'
CREATE TABLE orders_tenant_1 PARTITION OF orders FOR VALUES IN (1);
-- All rows with tenant_id=2 (DE) go into 'orders_tenant_2'
CREATE TABLE orders_tenant_2 PARTITION OF orders FOR VALUES IN (2);

-- Your application doesn't know or care about partitions
INSERT INTO orders (tenant_id, customer_name, total) VALUES (1, 'Alice', 49.99);
-- Postgres automatically routes this to orders_tenant_1
```

## Schema per tenant

Schema per tenant is where each tenant gets their own schema inside the same database. So instead of one shared orders table, you now have:

`tenant_1.orders`
`tenant_2.orders`

At first glance this feels clean. You don’t need a tenant_id column anymore and you physically separate data at the schema level. Queries also become simpler since you don’t need to remember to scope by tenant:

`SELECT * FROM tenant_1.orders;`

But this starts to break down pretty quickly.

The biggest issue is operational overhead. Every schema has the same tables, so any schema change now has to be applied to every tenant. Some problems with this include: adding a column means running migrations across hundreds or thousands of schemas, index changes get duplicated everywhere, and drift between schemas becomes a real problem.

It also makes things like cross-tenant queries and analytics harder, since data is now split across many schemas instead of one table. Postgres itself also doesn’t love having huge numbers of schemas. System catalogs grow, planning gets slower, and tooling starts to struggle.


## Database per tenant

Database per tenant takes this one step further. Each tenant gets their own logical database:

`db_tenant_1`
`db_tenant_2`

This gives you the strongest isolation since now tenants have separate connections, schemas, and data. It also maps nicely to cases where tenants need strict isolation for compliance or security reasons.

The main problem is scale and resource limits. Postgres databases are not lightweight:

- Each database needs connections
- Connection pooling becomes much harder
- You can hit limits on number of databases or connections quickly

Additionally, migrations have to run across every database, monitoring and backups need to be handled per tenant, and provisioning new tenants becomes slower.

Even simple things like running a query across all tenants become non-trivial since there is no shared table anymore.

This approach is usually only worth it for a small number of high-value tenants or when strict isolation is required, such as in dedicated cloud environments. For most applications, it is overkill. 

## References

- https://planetscale.com/blog/approaches-to-tenancy-in-postgres
