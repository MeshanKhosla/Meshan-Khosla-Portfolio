---
title: "Coffee Codex - WebAssembly"
description: "Learning about WebAssembly"
pubDate: "September 5, 2026"
heroImage: "/coffee-codex/wasm/cover.webp"
---

## Introduction

I'm at North of Main Cafe in Bellevue, WA, and today I'm learning about WebAssembly (Wasm) from [this video](https://www.youtube.com/watch?v=HktWin_LPf4&t=7s) by Lin Clark.

<img src="/coffee-codex/wasm/coffee.webp" srcset="/coffee-codex/wasm/coffee-640.webp 640w, /coffee-codex/wasm/coffee-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="3024" height="4032" alt="Coffee" loading="lazy" decoding="async" />

I really like the web and the browser; it's where I spend most of my time working. I started coding on the web and have taken detours to learn and work on other things, but web technologies have always been fun for me. With that being said, I haven't actually ever learned WebAssembly. I understand the high-level overview, which is that it complements JavaScript by allowing users to compile code in another language (C, Rust, etc.) into something the browser understands. But it hasn't _really_ taken off. I think Figma uses it for its canvas rendering, but for the majority of use cases, it's not needed.

Still, I think it'll be interesting to learn, so let's do that.

## JavaScript

JavaScript running in the browser used to be pretty slow. It's a dynamically typed language and was not optimized via a compiler when browsers were being created. Then, around 2008 (when I was hard at work eating Legos), Google, Mozilla, and others decided to invest more in the performance of browsers, and out came the Just-In-Time (JIT) compiler for JavaScript. This was not a new idea, as Java had been doing this for over a decade, but it did provide enormous performance benefits to JS running in the browser and enabled technologies like Node and Electron.

Let's take this code:

```js
for (let i = 0; i < 1_000_000; i++) {
  add(i, i + 1);
}
```

What are the types of the arguments to `add`? Well, we can see that they're probably integers, but how can the browser be sure?

In JavaScript, `add` can have many output types:

```js
function add(a, b) {
    return a + b;
}

add(1, 2)           // 3
add(1.5, 2.5)       // 4
add("foo", "bar")   // "foobar"
```

One technique the JIT uses is to profile and monitor the code as it goes through execution. During execution, the code gets sent to something called the "Baseline compiler", and then, once it's pretty confident that the code operates on integers, it optimizes it further with the "optimizing compiler".

```sh
What is a?
What is b?

if numbers:
    numeric addition
else if strings:
    concatenate
else:
    perform JS coercion rules
    possibly call user code
    ...
```

Once the optimizing compiler takes over, we don't need to spend the extra CPU cycles on the other branches, so the compiler can remove them.

## Rust

Let's look at the same code in Rust:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    for i in 0..1_000_000 {
        add(i, i + 1);
    }
}
```

Wow, look at that: a computer can know exactly what `a` and `b` are because they're in the function signature!

We can rewrite it slightly to give it an explicitly exported function:

```rust
#[unsafe(no_mangle)]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

When compiling this Rust code, we can do something like:

```sh
# add the wasm target
rustup target add wasm32-unknown-unknown
# tell Rust to output to the LLVM IR
rustc main.rs \
  --target wasm32-unknown-unknown \
  --emit=llvm-ir

# LLVM IR → Wasm object file
llc \
  -march=wasm32 \
  -filetype=obj \
  main.ll \
  -o main.o

# Wasm object → final Wasm module
wasm-ld \
  --no-entry \
  --export-all \
  main.o \
  -o main.wasm
```

Or all at once:

```sh
rustc main.rs \
  --target wasm32-unknown-unknown \
  --crate-type=cdylib \
  -O \
  -o main.wasm
```

And now we have a Wasm file.

## Wasm

The generated Wasm is a bunch of bytes that aren't human-readable, but we can use the `wasm2wat` command to output a human-readable WAT file:

```js
(module
  (func $add (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add
  )
  (export "add" (func $add))
)
```

Notice how all of the types are there. This is a simple example, but the Rust compiler also does its optimizations when compiling to LLVM.

## The browser

Okay, we made it to the browser. We now have a `main.wasm` file sitting on the web server just like any other `.js` file. Your CPU can't execute Wasm directly, so we do something like:

```js
const { instance } = await WebAssembly.instantiateStreaming(fetch("/main.wasm"));
console.log(instance.exports.add(1, 2)); // 3
```

This abstracts away the process of turning the Wasm bytes into something your CPU understands (typically x86 or ARM). Using Chrome/V8 as an example, the rough flow looks like this:

```
main.wasm
    ↓
download + decode + validate
    ↓
Liftoff
    ↓
native machine code
    ↓
CPU
```

Liftoff is V8's baseline WebAssembly compiler. Its job is to compile Wasm to machine code really quickly so execution can start without spending a bunch of time optimizing first.

This is where all of the type information we've been talking about becomes useful. Liftoff sees something like:

```
local.get $a
local.get $b
i32.add
```

It doesn't need to run `add` a thousand times to figure out whether `a` and `b` are integers. The Wasm module has already told it that they are `i32`s and that the operation is specifically an `i32.add`.

It can immediately compile that into the appropriate machine instructions for my computer.

So Wasm is not machine code. It's more like a portable, low-level compilation target sitting one level above machine code.

### Oh yay another compiler

When running Wasm, the JIT doesn't go away. Instead, it can do other optimizations, which is what V8's `TurboFan` does. Even though there's nothing to learn about what `add` means, TurboFan can still make the function faster through normal compiler optimizations, and it starts with much stronger guarantees about the code it's compiling.

At first, this felt a little weird to me. We compile the code with Rust, then V8 compiles it again. But the two compilers are solving different problems. Rust/LLVM knows a lot about my program but doesn't know what CPU will eventually execute it. V8 knows exactly what CPU it's running on but receives a portable Wasm program rather than my original Rust source.

<img src="/coffee-codex/wasm/all-compilers.webp" srcset="/coffee-codex/wasm/all-compilers-640.webp 640w, /coffee-codex/wasm/all-compilers-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="1966" height="1102" alt="Coffee" loading="lazy" decoding="async" />

## References

- https://www.youtube.com/watch?v=HktWin_LPf4&t=7s
