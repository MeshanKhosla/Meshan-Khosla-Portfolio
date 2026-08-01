---
title: "Coffee Codex - Going Through Transformers by Hand"
description: "Working through transformer calculations by hand to understand how they work"
pubDate: "Aug 01, 2026"
heroImage: "/coffee-codex/transformers-by-hand/cover.webp"
---

## Introduction

Today I'm at the library (with a coffee from Story Coffee).

In the <a href="/blog/coffee-codex-transformers/">last post</a> I worked through transformers conceptually, and I _thought_ I understood them. But then I kept reading Inference Engineering and kept having questions that I knew I should know the answers to, things like _How does the final vector get turned into logits?_ I had forgotten about the unembedding matrix. Not a huge deal, but I started to feel that I didn't really understand the entire flow. So I thought back to a class I took in college (CS186 - Databases) and how we used to have to count I/Os to understand how a query results in a database lookup, then progressed into things like how B-tree indexes impact the number of I/Os.

I didn't particularly enjoy that work, but I figured maybe doing this by hand will help solidify my understanding, so here we go.

<img src="/coffee-codex/transformers-by-hand/coffee.webp" srcset="/coffee-codex/transformers-by-hand/coffee-640.webp 640w, /coffee-codex/transformers-by-hand/coffee-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="3024" height="4032" alt="A Story Coffee cup beside my handwritten notes at the library" loading="lazy" decoding="async" />

## Math

I watched 3B1B's videos on The Essence of Linear Algebra, and they were fascinating. I really liked the idea that a coordinate `[x, y]` can be thought of as `x` copies of i-hat plus `y` copies of j-hat. Even though I can memorize formulas for matrix multiplication like I did in college, this intuition means I can do the multiplications without having to memorize them.

Take the vector `[4, 2]` and the matrix `[[2, 0], [0, 3]]`:

```
|2 0| |4|
|0 3| |2|
```

The columns of the matrix tell us where the basis vectors land. The first column says i-hat lands at `(2, 0)`, and the second says j-hat lands at `(0, 3)`. Since `[4, 2]` means four i-hats plus two j-hats, its transformed position is:

```
4(2, 0) + 2(0, 3) = (8, 0) + (0, 6) = (8, 6)
```

This works the same way when the matrix is not diagonal. For example:

```
| 1 3| |4|
|-2 0| |2|
```

Here, i-hat lands at `(1, -2)` and j-hat lands at `(3, 0)`, so:

```
4(1, -2) + 2(3, 0) = (4, -8) + (6, 0) = (10, -8)
```

Even when it looks like there is no transformation, there still is one. It is:

```
|1 0|
|0 1|
```

We call this the identity matrix because i-hat stays at `(1, 0)` and j-hat stays at `(0, 1)`. Multiplying any vector by it leaves the vector unchanged. I think that's pretty cool, since these are the "regular" coordinates we learned in school without knowing there was an invisible tranformation going on.

## The learned matrices

Obviously, since I'm doing the matrix multiplications by hand, I don't want large matrices, so I asked ChatGPT to give me a small pedagogical example of learned matrices. It decided on:

- 3 input tokens
- d_model = 3 (embedding dimension)
- 2 attention heads
- d_head = 2
- 1 transformer layer
- MLP hidden size = 4
- vocab_size = 5

## Writing it all out

Here are the pieces of paper I used to get through attention. I haven't done the MLP yet, but wow!

<div class="not-prose my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
  <img src="/coffee-codex/transformers-by-hand/linear-transformations.webp" srcset="/coffee-codex/transformers-by-hand/linear-transformations-640.webp 640w, /coffee-codex/transformers-by-hand/linear-transformations-1280.webp 1280w" sizes="(min-width: 640px) 328px, calc(100vw - 3rem)" width="3024" height="4032" alt="Handwritten notes explaining linear transformations and basis vectors" loading="lazy" decoding="async" class="h-auto w-full rounded-lg" />
  <img src="/coffee-codex/transformers-by-hand/matrix-practice.webp" srcset="/coffee-codex/transformers-by-hand/matrix-practice-640.webp 640w, /coffee-codex/transformers-by-hand/matrix-practice-1280.webp 1280w" sizes="(min-width: 640px) 328px, calc(100vw - 3rem)" width="3024" height="4032" alt="Handwritten matrix multiplication practice" loading="lazy" decoding="async" class="h-auto w-full rounded-lg" />
  <img src="/coffee-codex/transformers-by-hand/transformer-setup.webp" srcset="/coffee-codex/transformers-by-hand/transformer-setup-640.webp 640w, /coffee-codex/transformers-by-hand/transformer-setup-1280.webp 1280w" sizes="(min-width: 640px) 328px, calc(100vw - 3rem)" width="4284" height="5712" alt="Handwritten transformer weights, embeddings, and positional embedding calculations" loading="lazy" decoding="async" class="h-auto w-full rounded-lg" />
  <img src="/coffee-codex/transformers-by-hand/attention-calculations.webp" srcset="/coffee-codex/transformers-by-hand/attention-calculations-640.webp 640w, /coffee-codex/transformers-by-hand/attention-calculations-1280.webp 1280w" sizes="(min-width: 640px) 328px, calc(100vw - 3rem)" width="4284" height="5712" alt="Handwritten multi-head attention calculations" loading="lazy" decoding="async" class="h-auto w-full rounded-lg" />
  <img src="/coffee-codex/transformers-by-hand/residual-connection.webp" srcset="/coffee-codex/transformers-by-hand/residual-connection-640.webp 640w, /coffee-codex/transformers-by-hand/residual-connection-1280.webp 1280w" sizes="(min-width: 640px) 328px, calc(100vw - 3rem)" width="3024" height="4032" alt="Handwritten residual connection and MLP notes" loading="lazy" decoding="async" class="h-auto w-full rounded-lg sm:col-span-2 sm:mx-auto sm:w-1/2" />
</div>

So that was a lot of work. Is it worth it? Probably not. Is it fun? A little. I do have the urge to programmatically write these steps and create a mini vLLM in Effect just for fun, maybe I'll do that.

## Learnings

It really is a bunch of matrix multiplications, who would have thought. It's also pretty incredible to consider that one of the most important technologies of our time is moving vectors around in high-dimensional space. And really smart people have figured out how to train weights that represent the transformations applied to those vectors. Pretty neat.

I also understand the point of the KV cache much more now. The process I did was prefill, and the follow-up step would be to keep the generation going with decode. The interesting thing about decode is that you still need the keys and values from the previous tokens when computing attention, but you don't need to recompute them. You only compute the new key and value for the current token and append them to the cached `K` and `V` matrices. With the column-oriented convention I used on paper, each new token adds another column, which is neat.

While I don't think it's necessary to go through the transformer by hand, it does make me excited to read through the rest of the Inference Engineering book. I think the optimizations that are discussed in there will make a lot more sense now that my fundamentals are solid.

I know this was a short post (well, it took a while for me), but I'll see you next time :)

## References

- https://www.youtube.com/watch?v=kYB8IZa5AuE
- https://www.youtube.com/watch?v=XkY2DOUCWMU
