---
title: "Coffee Codex - Git at Any Scale"
description: "Learning how Git hosting scales from Cursor"
pubDate: "Aug 23, 2026"
heroImage: "/coffee-codex/git-at-any-scale/cover.webp"
---

## Introduction

I'm at Café Hagen in Bellevue, WA, and today I'm reading [Git at any scale](https://cursor.com/blog/git-at-any-scale) by Vicent Martí (vmg). I know basically nothing about Git at scale, so I'm excited to learn.

<img src="/coffee-codex/git-at-any-scale/coffee.webp" srcset="/coffee-codex/git-at-any-scale/coffee-640.webp 640w, /coffee-codex/git-at-any-scale/coffee-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="3024" height="4032" alt="An iced coffee from Café Hagen" loading="lazy" decoding="async" />

## What I know

I use Git locally, of course, and have looked into the `.git` folder before when implementing `gitlet` for a school project, so I have an understanding of things like the HEAD pointer, branch pointer, _the idea that files are chunked into objects and blobs_, but I don't know how a product like GitHub does it or what other challenges are involved, so let's read :)

## Packfiles

vmg starts by talking about [packfiles](https://git-scm.com/book/en/v2/Git-Internals-Packfiles). A packfile packs several objects into a single binary file like `.git/objects/pack/pack-978e03944f5c581011e6998cd0e9e30000905586.pack`. These packfiles are optimized for local storage but not so much for distributed storage.

These packfiles are organized in a DAG of commits, so if each node in the DAG is a commit, each commit points to many packfiles associated with it. At scale, these packfiles can be stored by their SHA-1 hash in a KV store. However, a simple operation like asking, "Which commit changed this file?" requires a DAG traversal and many round trips to a remote KV store. Each node contains a pointer to its next, so you have to go sequentially.

## Distributing the filesystem

The first thing that GitHub tried to do was distribute the filesystem over NFS. So initially they had something like

```
                    GitHub server
              ┌─────────────────────┐
browser ─────►│ Rails app           │
              │                     │
              │ local disk          │
              │ /repos/foo.git      │
              │ /repos/bar.git      │
              └─────────────────────┘
```

but when it came time to scale their application:

```
                 ┌── GitHub server 1
users ───────────┼── GitHub server 2
                 └── GitHub server 3
```

the `.git` folders only live on the first server

```
GitHub server 1
┌─────────────────────┐
│ Rails               │
│                     │
│ disk                │
│ └── foo.git         │
└─────────────────────┘

GitHub server 2
┌─────────────────────┐
│ Rails               │
│                     │
│ disk                │
│ └── ???             │
└─────────────────────┘
```

so instead the packfiles could live on a remote Network File System (NFS) server and give the illusion that the files lived on the current server.

```
Git on server 2

open("/repos/foo.git/objects/pack/abc.pack")
             │
             ▼
          network
             │
             ▼
        NFS server
             │
             ▼
           disk
```

But NFS was not a good fit because it became a "random walk across gigabytes of data." Every time you want to read a packfile, it requires a network hop, and you have to read a lot of them to get the info that you need.

## Spokes

Ok, distributing the filesystem didn't work, but what about storing the `.git` file on different servers and distributing that? Something like

```
                 Spokes
                   |
        -------------------------
        |           |           |
        v           v           v

   file server   file server   file server
      A              B              C
      |              |              |
   foo.git        foo.git        foo.git
   local disk     local disk     local disk
```

That's the idea behind Spokes, which is GitHub's system for distributing Git. The great thing about this approach is that we benefit from packfiles as the Git operations run locally on disk. When an update is made, GitHub sends that update to its replicas to store.

The primary challenge is now consistency. Eventual consistency would not work for a system like this since it would mean some users see stale data after another user pushes. Quorum protocol to the rescue! Spokes uses three-phase commit (3PC) to achieve quorum among its replicas. In typical 3PC, the coordinator sends Vote/Precommit/Docommit requests, which are similar to what Spokes uses. Spokes uses an Upload/Prepare/Lock/Commit system to ensure that every push is synchronized across all replicas.

With agents, users can create huge numbers of small, often throwaway repositories. That's awkward for Spokes because every repository still needs multiple replicas, even when mostly idle. Spokes also has to track where those replicas live. At the other end of the scale, adding replicas to a hot repository hurts push throughput because 3PC waits on the slowest replica.

## Continuity

Continuity is the solution Cursor came up with. It looks something like this:

```
                 S3
          WAL for repo foo
                 |
        -------------------
        |        |        |
        v        v        v
     server A server B server C
      foo.git   foo.git   foo.git
      cache     cache     cache
```

Like Spokes, each server still has a local `.git` repo because Git is fast when it can read packfiles from local disk. But that repo is treated like a cache. It can be stale, corrupted, or disappear entirely. That's fine because S3 has the source of truth. On pushes, S3 gets updated with an atomic compare-and-swap.

So before serving a request, the server checks S3 to see if its local repo is up to date. If it's behind, it pulls the missing WAL entries from S3 and applies them locally first. Nothing between the servers has to be reliable either. Cursor can gossip updates between replicas to make them catch up faster, but gossip is only an optimization. If a message gets dropped, the next request checks S3 anyway and fixes the local state.

That's surprisingly simple! No consensus, no quorum.

Cursor has turned this into a product called Origin. I'll be sure to check it out.

## References

- https://cursor.com/blog/git-at-any-scale
