---
title: "Coffee Codex - Infinity Runtime"
description: "Learning about the Infinity Runtime"
pubDate: "Oct 31, 2026"
heroImage: "/coffee-codex/infinity-runtime/cover.webp"
heroImageWidth: 2118
heroImageHeight: 1186
---

## Introduction

I'm at T'Latte in Bellevue, WA and today I'm learning about the [Infinity runtime](https://infinity.hydro.run/).

<img src="/coffee-codex/infinity-runtime/coffee-1280.webp" srcset="/coffee-codex/infinity-runtime/coffee-640.webp 640w, /coffee-codex/infinity-runtime/coffee-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="3024" height="4032" alt="Coffee at T'Latte in Bellevue" loading="lazy" decoding="async" />

## Hydro

The Infinity runtime is created by the Hydro team at AWS. I've written about <a href="/blog/coffee-codex-hydro/">Hydro before</a>; it's a way to write distributed systems in Rust where you model failure points directly in the code. I'm a big fan of the Hydro team (go bears) so I'm also excited to see what they did with Infinity. Let's read the [blog post](https://aws.amazon.com/blogs/opensource/introducing-infinity-a-runtime-for-extreme-agent-concurrency/)

## Tool calls

Tools are used everywhere when working with agents. Typically they allow the agent to "call" a function. An LLM generates text so its API output might look like this:

```json
{
  "id": "msg_01Example",
  "type": "message",
  "role": "assistant",
  "model": "claude-opus-5-5",
  "content": [
    {
      "type": "text",
      "text": "I'll start the build."
    },
    {
      "type": "tool_use",
      "id": "toolu_01Example",
      "name": "start_build",
      "input": {
        "commit": "abc456"
      }
    }
  ],
  "stop_reason": "tool_use"
}

```

It is then the responsibility of the harness to take this output and invoke the `start_build` tool with the `input`. 

The `start_build` tool call may take a long time, let's say 20 minutes, to start the build, monitor it, and report back the status.

In some implementations today, that `start_build` will block the main agent loop. There are some exceptions to this with something like Claude's [background tasks](https://code.claude.com/docs/en/interactive-mode#how-backgrounding-works).

This begs the question... While the build runs for 20 minutes, what is the harness actually doing? And if we shut it down, what would we need to continue when the build finishes?

## Infinity

Let's go even further. Say we ask an agent to keep an eye on recent CVEs. It reads the CVE, its repo code, comes up with a decision on if a change is needed, makes a change, and invokes `start_build`. The build takes 20 minutes. `start_build` starts the build on GitHub Actions. If it fails, the agent needs to use the new failure alongside its earlier investigation to try another fix. Could we shut down the harness while the build runs, then resume the conversation in a new Lambda invocation when the result arrives? Well, we need to since Lambda has a 15-minute timeout.

Let's scale it up. Now we have 100,000 repositories that need to have this same behavior. 

![CVE Agent workflow](/coffee-codex/infinity-runtime/cve-agent-workflow.webp)

So how do we actually "continue" that same conversation? What needs to be persisted? That's what Infinity solves. 

![Infinity saves each agent's conversation and routes build results to a new Lambda invocation, which loads the saved history and continues.](/coffee-codex/infinity-runtime/cve-agent-workflow-infinity.webp)

We're running this on Lambda, but Infinity also supports running agents in a long-lived process. The team benchmarked 80,000 agents with a simulated model and in-memory stores on an AMD EPYC machine. The memory usage suggested that roughly 75,000 idle agents could fit in the 8GB of a Raspberry Pi 5. That's stored conversations, not 75,000 builds or model requests running at once!

There are a few cool things that are happening here. 

The conversation is enough to continue the agent's reasoning. We don't need to keep the original Lambda invocation or its call stack alive. The next invocation loads the history, including the investigation and the `start_build` call, adds the build result, and calls the model again. It's the "same agent" because we're continuing the same conversation.

Additionally, the tool's work and the agent's execution are separate. Infinity uses its Reactive Agent Protocol (RAP) to send a tool its arguments and a callback URL. The tool acknowledges the request immediately, then sends its result to that URL when it's ready. GitHub Actions still needs compute to run the build, but the agent doesn't need a running Lambda while it waits.

Everything that resumes an agent comes through its input queue. That could be a build result, a user message, or a report from another agent. In the AWS deployment, SQS FIFO message groups keep each agent's messages in order while allowing different agents to run concurrently. So Repo A can be investigating a failure while Repo B is waiting for its build, without either holding up the other.

We're just scratching the surface but my laptop is running out of battery so maybe next time!

## References

- [Blog Post](https://aws.amazon.com/blogs/opensource/introducing-infinity-a-runtime-for-extreme-agent-concurrency/)
- [Infinity Docs](https://infinity.hydro.run/)
