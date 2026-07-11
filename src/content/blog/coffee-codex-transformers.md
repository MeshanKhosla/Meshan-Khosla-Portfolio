---
title: "Coffee Codex - Transformers"
description: "Learning about neural network transformers"
pubDate: "July 11, 2026"
heroImage: "/coffee-codex/transformers/cover.webp"
---

## Introduction

I'm at Dote Coffee in the Spring District in Bellevue, WA. This post is going to be a bit longer than usual since I'm sharing what I've been learning for the past week or so.

![Coffee](/coffee-codex/transformers/coffee.webp)

## Inference Engineering

I ordered a book by Philip Kiely called [Inference Engineering](https://www.baseten.co/inference-engineering/) because I wanted to learn more about how to make inference faster. I got ~50 pages in and the topic of attention came up. This was always a term I knew about along with other words like "neural networks", "transformers", "parameters", etc but I always abstracted it away into "the thing machine learning people work on". I didn't take any ML courses in college because the math scared me (it still does) but I figured let's see if I can learn these concepts now with the tools available to me.

### The tools

AI is the greatest learning tool invented. I used ChatGPT because I have a subscription to it, but I'm sure Claude is also great for this use case. When I don't understand something, regardless of how primitive, I can just keep asking about it over and over again. I can ask it to explain it to me in words I understand, I can ask it to write TypeScript functions for concepts, I can ask it to explain concepts to me starting from concepts I already understand, and most importantly, I can ask it to abstract away ideas I don't understand yet.

I realized I learn very well (maybe most people are like this) when something is explained at a very high level, and then once I 100% understand it, I can pry into deeper levels. Slowly, my mental model starts to take shape, and that's when learning gets really fun.

But I wanted a way to save these insights that I'm having: if the idea of temperature in ML finally makes sense to me, I want to save that in a notebook to look back on. Again, this is not a definition; this is a mental model that works for me, something that I can look back on and have the concept click for me. So I built a system with a [Custom GPT](https://help.openai.com/en/articles/8554397-creating-and-editing-gpts#:~:text=used%2E-,Actions) and made a small HTTP endpoint that writes these insights to a GitHub repo for me. When I'm talking to this GPT and something clicks, I ask it to "Save this as an insight," and it summarizes, formats, and syncs it to GitHub. [Here](https://github.com/MeshanKhosla/inference-engineering-notes/blob/main/insights/013-softmax-and-temperature.md) is the one for temperature.

After I had a basic understanding, I returned to some 3Blue1Brown videos on neural networks that I watched years ago and didn't understand. Magically, they started to make sense. So here is an overview of what I've learned so far, and I'm aware this is barely the tip of the iceberg.

_Disclaimer: All of the cool examples and Manim visuals below are taken from the 3B1B videos. You should watch those videos, they are better than this post._

_Disclaimer 2: LLMs operate on chunks of text called tokens. For this post, just assume those are English words._

## “It’s a next token prediction machine”

Yes, ChatGPT and LLMs are "just" predicting the next token, but the technology behind it is fascinating. This process is broken up into 2 steps: **prefill** and **decode**.

As a quick note: the training process outputs a bunch of weights (like a trillion numbers organized into matrices) which is then used in the inference process. Inference is like "running" the output of training.

So we're going to assume that the training process is complete and this is now inference. The prefill step takes the entire input and passes it into the neural network to generate the first token. Say you type into my chatbot (MeshanGPT): `Finish this story: a fluffy blue creature roamed the verdant forest`, behind the scenes, I might pass this prompt into the network

```xml
You are an assistant called MeshanGPT, your goal is to be helpful to the user.

<user>
Finish this story: a fluffy blue creature roamed the verdant forest
</user>

<assistant>

```

If I were to pass this into the network, the output will be a set of logits for what the next token is because that's what the model was trained to do:

```ts
[
  { token: "peacefully", logit: 8.4 },
  { token: "through",    logit: 7.8 },
  { token: "alone",      logit: 7.2 },
  { token: "until",      logit: 6.9 },
  { token: "when",       logit: 6.7 },
  { token: "at",         logit: 6.3 },
  { token: "while",      logit: 6.0 },
  { token: "...",        logit: -2.1 }
]
```

The logits are then passed through a mathematical function called **softmax**, which converts them into probabilities that all add up to 100%.

```ts
[
  { token: "peacefully", probability: 0.31 },
  { token: "through",    probability: 0.18 },
  { token: "alone",      probability: 0.10 },
  { token: "until",      probability: 0.07 },
  { token: "when",       probability: 0.06 },
  { token: "at",         probability: 0.04 },
  { token: "while",      probability: 0.03 },
  { token: "...",        probability: 0.21 }
]
```

The model can then choose the next token by sampling from this probability distribution. The top probability might be 1 if the temperature is very low, so a low temperature makes it so the next token is the one with the highest probability. In practice, the temperature is not ~0 since conversation is much more natural if there is a distribution of word choices.

The number of tokens in this array (which, again, we are assuming are words) is equal to the vocabulary size of the model. GPT-4 had ~100,000 tokens in its vocabulary.

This is for the first token. We then repeat this process until we see a marker token indicating we should stop.

It's called prefill because there are some precomputations that we can do once so we don't need to compute them on every decode (e.g. the KV cache which will come later, maybe in another post).

One interesting thing that is not obvious is that the logits associated with the next token are based on where the last token ended up after the transformer. In essence, the transformer _transformed_ each token of the input into what the next token is. This will get clearer in the next section with a visual.

The code helps me think about it but don't worry if this doesn't make sense, the next section will have better visuals.

```ts
const promptTokens = tokenize(prompt);
const outputTokens: Token[] = [];

// ---------- Prefill ----------

// Process the entire prompt at once, this generates the KV cache that each decode step will use during attention.
// The logits at the final prompt position predict the first generated token.
let result = transformer(promptTokens);

let kvCache = result.kvCache;
// This returns the logits for every token, we only care about the last one.
let nextToken = sampleNextToken(result.logits.at(-1), temperature);

// ---------- Decode ----------

while (nextToken !== "<eos>" && outputTokens.length < maxOutputTokens) {
  outputTokens.push(nextToken);

  // Only process the newly generated token.
  result = transformer([nextToken], kvCache);

  kvCache = result.kvCache;
  nextToken = sampleNextToken(result.logits.at(-1), temperature);
}

const output = detokenize(outputTokens);

function sampleNextToken(logits: number[], temperature: number): Token {
  const probabilities = softmax(scaledLogits, temperature);
  return sample(probabilities);
}
```

## A different mental model

Before we dive into the transformer, let's establish the mental model for what happens after tokenization, because the code above is very hand-wavy. In transformers, each token of the input prompt goes through a process called **embedding**. An embedding of a token is a representation of the token in a high-dimensional space, called a vector. These embeddings are learned during the training process. So in the sentence `a fluffy blue creature roamed the verdant forest`, let's take the token `creature` as an example. In neural networks, it's very convenient to represent these not as words, but as vectors, which are big arrays of numbers. In the case of GPT-3, we're working with 12,288 dimensions.

Unfortunately humans live in the 3rd dimension and we are working on a 2D screen, but there are some pretty cool animations for this.

### A basic 2D example

Take this (x,y) plane:

![2D](/coffee-codex/transformers/2d.webp)
_Note that I'm focusing on the core sentence of the prompt, not the surrounding `<assistant>` stuff._

Each point on this plane represents a token in the input sequence. The entire point of a transformer is to move (aka transform) the **last** token ("forest") into a place that represents its next word. So all of those trillion weights are used in a transformer architecture to move this point.

The key thing to have in your mind here is that somehow, in some magical way, the location/quadrant of the point on this 2D plane represents some form of meaning of the tokens.

### In 3D

Ok, let's bump up one dimension and focus on a different token, `creature`, but in reality, all tokens are present in this vector space.

![3D](/coffee-codex/transformers/3d.webp)

It's the same thing here, except now we are operating in the 3rd dimension (x,y,z), which means that instead of points, we have vectors that also have a direction. But the high-level idea is the same: the point of the transformer is to take in the vector representation of a token (its embedding) and move it around until it is pointing to the most likely next token. The intermediate representations of the vector as it's getting transformed are called hidden vectors.

In 3D, the vectors are pointing in a specific direction, and the idea is that each direction encodes _some_ meaning which is learned via training. Maybe one direction is associated with gender, maybe one direction is associated with family, who knows. Take this example from the 3B1B video:

![3D Family](/coffee-codex/transformers/3d-family.webp)

In this vector space, it was learned that one direction is associated with male and another direction is associated with female. Similar tokens are pointing in similar directions. And doing a little bit of math, it happens to be true that if you take `Embedding(Niece)` and subtract `Embedding(nephew)`, the difference is roughly equivalent to the `Embedding(Woman) - Embedding(Man)`. So the direction of these vectors is encoding some meaning, which is kind of crazy.

Again, watch the [3B1B](https://www.youtube.com/watch?v=wjZofJX0v4M) video for explanations and examples that are way better than this.

### In 4D

Just kidding, we can't visualize 4 dimensions, but math has no problems with it. Instead of `(x,y)` or `(x,y,z)`, 12,288 dimensions are just an array of 12,288 coordinates: `[1, 3, 5, -3, -2, ...]`

## Attention

I'm still learning about the specific mechanisms of attention, so I'll write about it in a future post, but let me provide some motivation for it. Attention was invented (discovered?) in a [famous paper](https://arxiv.org/pdf/1706.03762) by Google in 2017 to solve the problem of context around a token. 

Remember how I said the embedding for `creature` is learned during training? Well this is kind of bad because we don't know what kind of "creature" we're referring to, it's just an abstract "creature" gotten from a lookup table. After the lookup table, we do encode the position into it for some more context, but more is needed. To give an even more stark example, let's say a prompt had the token "mole". What mole is it talking about? Here are some examples:

```
The mole on her leg
One mole of C02
The shrew mole on the street
```

All of these have different meanings. As humans, we are somehow able to distinguish between them using context clues. But how? In the sentence "One mole of CO₂ contains", what would the next word be? How do we know that the "mole" is the measurement? And then, how do we teach a computer program to do that?

Ok, let's go back to the `a fluffy blue creature roamed the verdant forest` example. Remember, the goal is to change the vector associated with `forest` to be the next token. To do this, we also need to understand what `verdant` refers to, what `creature` refers to, etc. In academic terminology, which tokens "attend to" `creature`? The embedding for `creature` is initially context-free.

Earlier tokens can attend to later tokens, so maybe the token `creature` asks something like, "Are there any adjectives that describe me?" And then the "fluffy" and "blue" tokens answer with, "Me! I'm an adjective that describes you." We say, "fluffy attends to creature." And then "creature" attends to "forest." This process is repeated thousands of times across many attention heads and many layers of the network (which is why it's called deep learning).

A bit of technical stuff: The question that is asked by the token (e.g. "Are there any adjectives that describe me?") is learned through training via a `Query (Q)` matrix, and the answers are learned via the `Key (K)` matrices. The `Value (V)` matrix is a bit more complicated, so I'll cover it next time. Also, the idea of the query being "Which adjectives attend to me?" is very clean for humans, but each one of these "attention heads" has its own queries and keys, which may not map as cleanly to an `Adjective->Noun` relationship.

In this single attention head, if we take the `Adjective->Noun` relationship, the attention pattern might look like this:

![Attention Patterns](/coffee-codex/transformers/attention-patterns.webp)

In ML jargon, the big circles are the ones where the left side "attends to" the top. So "blue" attends to "creature" quite a bit which will cause the vector to move in that direction.

### This happens a lot

What I described is one head of attention in one layer of the neural network. One prompt goes through a lot (hundreds) of attention heads in a single layer and a lot (hundreds) of layers. The number was 96 in GPT-3 for both of those and is likely much higher now. The intuition is that at each layer, the vectors move around a bit and learn some more, and then ultimately, at the last layer, the last token will have enough context and knowledge baked into it that it is at the next token.

![Depth](/coffee-codex/transformers/attention-heads.webp)

The output of each attention block gets collapsed into refined embeddings that go through another network called a "multilayer perceptron" (MLP) or "feed-forward network," which has the general knowledge that was picked up during training. So attention is for context clues, and MLPs are for general knowledge. The process goes from `Prompt->Embedding->Attention->MLP->Attention->MLP->...->Attention->MLP->Unembedding->Logits->Next token`.

![Depth](/coffee-codex/transformers/depth.webp)


We'll talk about MLPs, the value matrix, and the KV cache next time. :)

## References

- Inference Engineering by Philip Kiely
- ChatGPT
- 3Blue1Brown (https://www.youtube.com/watch?v=wjZofJX0v4M)
- 3Blue1Brown (https://www.youtube.com/watch?v=eMlx5fFNoYc)
- https://arxiv.org/pdf/1706.03762
