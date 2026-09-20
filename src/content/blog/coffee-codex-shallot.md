---
title: "Coffee Codex - Shallot"
description: "Coffee Codex - Making Shallot, an oblivious AI gateway"
pubDate: "Sep 19, 2026"
heroImage: "/coffee-codex/shallot/cover.webp"
---

## Introduction

I'm at T'Latte in Bellevue, WA and I want to write about a project I've been working on for the past week or so called [Shallot](https://github.com/MeshanKhosla/shallot).

<img src="/coffee-codex/shallot/coffee.webp" srcset="/coffee-codex/shallot/coffee-640.webp 640w, /coffee-codex/shallot/coffee-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="3024" height="4032" alt="Coffee" loading="lazy" decoding="async" />

## Motivation

A few months ago, I was talking to my girlfriend, Ofir, about her group's [research in Private Information Retrieval (PIR)](https://eprint.iacr.org/2026/684). At a high level, one application of PIR is to answer the question "How can a client hide their intent from a database?" The naive solution is to have the client download the entire database since, if you download the entire database, the database will not know which record you are querying for. There are many smarter solutions to make this more efficient and more performant, but that's the high-level idea.

I started thinking about local AI and how PIR can apply there. Starting at the naive solution... and then I got stuck. I don't know what the parallel for a naive solution will be. Send every possible prompt? Impossible. Send similar contextual prompts? Not enough privacy guarantees. So I tabled the idea for a while. And then I started to think about what people use local AI for.

## Local AI guarantees

Many people like the privacy aspect of local AI, but the struggle is being able to afford the GPUs/Sparks to host them. What if we could get _similar_ privacy guarantees but with the reliability of an inference provider? Shallot is my first attempt at that; there's a lot more to do but I'm happy with it as a proof of concept.

The idea of Shallot is similar to [Oblivious HTTP](https://www.rfc-editor.org/info/rfc9458/) and it's called Shallot because it's an onion-style encryption scheme (but smaller). Oblivious HTTP is used widely at companies like [Cloudflare](https://blog.cloudflare.com/stronger-than-a-promise-proving-oblivious-http-privacy-properties/) and [Apple](https://blog.cloudflare.com/icloud-private-relay/) and it makes it so the provider cannot associate the sender (tenant) to their message, which gives strong privacy guarantees. What if we can do something similar with AI? That is, a way to dissasociate the user from the sender to their prompt.

The most natural place to implement this is at the gateway level, in products like Vercel or Cloudflare AI Gateway. The specific privacy claim is that, if the Relay and Exit do not collude, neither can link a tenant to a plaintext prompt. That is not fully private AI, but it gives us a clear boundary to build and test. The LLM provider can still read the prompt, and the prompt itself can contain identifying information.

## How it works

Ok now the fun part, here's a gif:

![Shallot request flow](/coffee-codex/shallot/flow.gif)

There's 4 parts: The client (sidecar), the relay server, the exit server, and the model provider

### Client

Let's start with the client. I implemented this as a sidecar since it's intended to work with any OpenAI-compatible client (like the `ai` SDK). The role of the client is to encrypt its prompt with a key that only `Exit` can decrypt. I'll discuss the cryptography used in a later section.

I can use the Sidecar like a normal OpenAI-compatible server:

```sh
curl http://127.0.0.1:8788/v1/chat/completions \
  -H "Authorization: Bearer tenant-local" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-text",
    "messages": [{
      "role": "user",
      "content": "Hello from the Sidecar"
    }]
  }'
```

Or I can point the Vercel AI SDK at the Sidecar:

```ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const shallot = createOpenAICompatible({
  name: "shallot",
  baseURL: "http://127.0.0.1:8788/v1",
  apiKey: "tenant-local",
});

const result = await generateText({
  model: shallot.chatModel("mock-text"),
  prompt: "Hello from the Sidecar",
});
```

The Sidecar receives the tenant credential and plaintext prompt. It creates a request ID, encrypts the request with the Exit's public key, and sends the ciphertext to the Relay. The trace shows the encrypted request instead of the prompt:

```json
{
  "event": "sidecar.request.encrypted",
  "requestId": "dd6fa5b4-aef6-4216-84bb-61b4553fb1cd",
  "keyId": "local",
  "prompt": "7IySL0O9kr... [encrypted]"
}
```

This gets sent to the Relay

### Relay

The Relay authenticates the caller and forwards the encrypted request. It knows that the request belongs to `demo`, but it cannot decrypt `7IySL0O9kr...` into the prompt:

```json
{
  "event": "relay.request.received",
  "tenantId": "demo",
  "requestId": "dd6fa5b4-aef6-4216-84bb-61b4553fb1cd",
  "prompt": "7IySL0O9kr... [encrypted]"
}
```

The Relay is where all of the work that requires knowing who the client is happens. It does things like authenticating the bearer token, mapping it to a tenant, limiting concurrent requests, and tracks request IDs per tenant. Billing, quotas, rate limits, etc would also go here. This infomration can not live in Exit because then Exit would be able to associate the tenant to the prompt. 

The Relay replaces the tenant credential with a service credential shared between the Relay and Exit. It does not forward the client's bearer token, IP headers, cookies, or trace context.

For reqeust tracking (`RequestTracker`), the relay defines an identity as `(tenant ID, request ID)`. It can then rejects a second request with the same identity. This catches accidental retries before they turn into another provider call. It also protects against a single client overloading capacity limits.

Now onto the Exit

### Exit

The Exit receives the same encrypted request, but not the tenant credential or tenant ID. It decrypts the prompt because it has the private key:

```json
[
  {
    "event": "exit.request.received",
    "tenantId": "unknown",
    "prompt": "7IySL0O9kr... [encrypted]"
  },
  {
    "event": "exit.request.decrypted",
    "tenantId": "unknown",
    "request": {
      "model": "mock-text",
      "messages": [
        { "role": "user", "content": "Hello from the Sidecar" }
      ]
    }
  }
]
```

After decrypting the request, the Exit enforces the allowed-model policy, sanitizes the request, calls the LLM provider, and encrypts the response. It authenticates the Relay with the shared service credential, but that credential only says "this came from the Relay." It does not identify the tenant.

In the Exit, we can do things that require the prompt. Here, we have a `ReplayProtection` which is separate from the Relay's `RequestTracker`. It uses `${keyId}:${encapsulatedKey}` as the replay key. The `encapsulatedKey` identifies the HPKE setup for the request, so if the same encrypted envelope arrives twice, the Exit rejects the second copy before calling the provider. I'll discuss HPKE in the Cryptography section below.

To reiterate, the two servers know different things. The Relay can say "tenant `demo` already used this request ID," while the Exit can say "I have already seen this exact HPKE setup" without knowing who sent it. That second check still works if the same encrypted request comes through another Relay instance or somehow misses the Relay's tracker. Both caches are in-memory right now. With multiple instances we'd use a shared atomic store.

### LLM provider

The Exit sends the prompt to the LLM provider. The provider needs the prompt to run inference, but it receives `tenantId: "unknown"`. It also does not receive the tenant credential or the client's network information. However, this does not stop someone from putting identifying information directly in their prompt.

After inference, the response takes the reverse path. The Exit encrypts response frames for the Sidecar, the Relay forwards those frames without reading them, and the Sidecar decrypts them before returning the ordinary Chat Completions response:

```json
{
  "id": "chatcmpl_shallot_mock",
  "model": "mock-text",
  "choices": [{
    "message": { 
      "role": "assistant",
      "content": "deterministic-response" 
    }
  }]
}
```

Shallot supports streaming as well.

In this local run, all four processes write to one terminal. That makes the handoff easy to inspect, but it is not the deployment model that provides privacy. A real deployment must run the Relay and Exit under separate operators, accounts, and logs. I wrote [a guide](https://github.com/MeshanKhosla/shallot/blob/main/docs/separate-machines.md) for how to run this on multiple servers, which is how it would work in a production system. This was tested with Relay/Exit being on a Hetzner VPS/Home server respectively.

## Cryptography

Shallot uses Hybrid Public Key Encryption (HPKE). Before getting into HPKE, I want to start with the a question: why can't the Sidecar just encrypt the entire prompt with the Exit's RSA public key?

The reason is because RSA cannot encrypt an arbitrarily large message. The message has to fit inside the modulus, and OAEP padding takes some of that space. With a 2048-bit RSA key and RSA-OAEP using SHA-256, we only get 190 bytes: `256 - (2 * 32) - 2 = 190`. A prompt with chat history or tool definitions will blow past that almost immediately.

Could we split the prompt into a bunch of 190-byte chunks and encrypt each one? Technically, but it would be slow and easy to get wrong.

What about using RSA to encrypt a secret key, then using that key to encrypt the prompt? Yes, that works. The Sidecar could generate a random AES key, encrypt the prompt with AES-GCM, and encrypt only the AES key with RSA-OAEP. But now we need to decide how the key is encoded, which algorithms are allowed, how nonces are generated, what metadata is authenticated, and how failures are handled. At that point I'm designing a protocol, so let's use HPKE instead.

### What HPKE defines

In the [HPKE protocol](https://www.rfc-editor.org/info/rfc9180/), a ciphersuite has three parts:

1. A Key Encapsulation Mechanism, or KEM, creates a shared secret for the sender and recipient.
2. A Key Derivation Function, or KDF, turns that shared secret and protocol context into an encryption key and base nonce.
3. An Authenticated Encryption with Associated Data algorithm, or AEAD, encrypts the application data and detects modification.

Those three pieces are what HPKE defines: how the sender and recipient create the same encryption context from the recipient's public key, derive keys and nonces, and encrypt data. HPKE does not define Shallot's JSON envelope, request IDs, padding, Relay, response frames, or replay caches. Those are Shallot's protocol decisions.

Shallot uses `DHKEM(X25519, HKDF-SHA-256)` for the KEM, `HKDF-SHA-256` for the KDF, and `AES-256-GCM` for the AEAD.

For each request, the Sidecar generates a fresh X25519 key pair. It combines its new private key with the Exit's public key. The Exit combines its private key with the Sidecar's new public key. They both get the same Diffie-Hellman value without ever sending that value over the network.

The Sidecar does send its temporary public key. HPKE calls this value `enc`, and I call the field `encapsulatedKey` in Shallot. Despite the name, this is not an encrypted AES key. It is the public value the Exit needs to do its side of the exchange. HPKE puts the shared secret through HKDF and derives the AES-GCM key and nonce from it.

So this gets to roughly the same place as wrapping an AES key with RSA, but differently. RSA transports a randomly generated AES key inside an RSA ciphertext. Diffie-Hellman lets both sides derive the key material. I chose HPKE because it already defines how these pieces fit together and because OHTTP uses it too.

### Encrypting a request

The Exit has a long-lived X25519 key pair, and the Sidecar is configured with its public key and key ID. For each request, the Sidecar:

1. Pads the encoded request to a configured bucket so the Relay can't guess any information about the prompt.
2. Runs HPKE in base mode with the Exit's public key and the context string `shallot/request/v1`.
3. Sends the HPKE encapsulated key and AES-GCM ciphertext in the request envelope.

The reason we use HPKE's base mode is because it allows the Sidecar to encrypt a request for the Exit without revealing or proving its identity to the Exit. As we covered before, the Relay authenticates the tenant before forwarding the ciphertext, so the Exit only needs to know that the request came through the trusted Relay.

### Encrypting the response

The first HPKE context only goes from the Sidecar to the Exit, so we need a second one for the streaming response. The Sidecar generates another X25519 key pair, adds its public key to the request envelope, and keeps the private key locally. In code this is called `responseKeyPair`, you think of this as the reponse parallel to the encapsulated key. 

The Exit uses that response public key to create another HPKE context and puts the new `enc` value in the first response frame. It then encrypts the response head and each body frame with that context. Every frame authenticates its request ID, sequence number, frame type, and final marker. This lets the Sidecar reject frames that are missing, reordered, duplicated, modified, or sent after the final frame.

There is one big limitation: requests do not have forward secrecy. The Exit reuses the same private key across many requests, while each request includes the Sidecar’s temporary public key as `encapsulatedKey`. If someone records those requests and later obtains the Exit’s private key, they can recreate the shared secret for each request and decrypt the old ciphertext. Rotating and securely deleting Exit keys limits the damage, but any request encrypted with a compromised key may be exposed.

## Implementation

I wrote this in [Effect](https://effect.website/), because I thought it would be fun to learn. Dependency Injection makes the implementation very clean. I mean look at [this](https://github.com/MeshanKhosla/shallot/blob/d516e696d266e674fa653d8440782b85eabb7234/packages/exit/src/exit.ts#L40). The Exit server declares exactly what its requirements are! The request handler needs an `LlmProvider` to call the model and `ReplayProtection` to reject an encrypted request that has already been used:

```ts
export const handleExitRequest = Effect.fn("exit.request")(function* (
  req: Request,
  config: ExitConfig,
  logger = createDebugLogger("exit"),
): Effect.fn.Return<Response, ExitRequestError, 
                    LlmProvider | ReplayProtection> {
  // ...
});
```

You can also see the two replay checks right next to each other. They use different keys because the Relay and Exit know different things:

```ts
// Relay: identity-aware duplicate check
const requestTracker = yield* RequestTracker;
if (!(yield* requestTracker.claim(tenant.id, envelope.requestId))) {
  return yield* new RelayReplayDetected();
}

// Exit: identity-free cryptographic duplicate check
const replayProtection = yield* ReplayProtection;
const replayKey = `${envelope.keyId}:${envelope.encapsulatedKey}`;
if (!(yield* replayProtection.claim(replayKey))) {
  return yield* new ExitReplayDetected();
}
```

Chef's kiss 🤌

## Future steps

This is a proof of concept. To run it in production, I would need to do a few things:

1. Formalize the privacy claim. Model the protocol in something like Tamarin and prove the claims that Shallot makes.
2. Is there a design where we can allow collusion?
3. Performance. Current performance can definitely be improved according to [Benchmarks](https://github.com/MeshanKhosla/shallot/blob/main/benchmarks/results.md). What can be optimized and what guarantees can be relaxed?
4. Reduce metadata leakage. Padding hides some size information, but timing, frame count, request order, and provider latency can still correlate a tenant with a prompt. I want to evaluate batching, shared Relay-to-Exit connections, and more padding strategies.
5. Add key rotation and a distributed replay cache. The current Exit uses a static key, and the replay cache only works inside one process. To protect forward secrecey, we can explore solutions like one-time prekeys

## References

- https://eprint.iacr.org/2026/684
- https://www.rfc-editor.org/info/rfc8017/
- https://www.rfc-editor.org/info/rfc9180/
- https://www.rfc-editor.org/info/rfc9458/
- https://blog.cloudflare.com/stronger-than-a-promise-proving-oblivious-http-privacy-properties/
- https://github.com/MeshanKhosla/shallot
