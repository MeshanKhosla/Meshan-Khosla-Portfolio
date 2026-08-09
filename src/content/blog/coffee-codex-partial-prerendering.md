---
title: "Coffee Codex - Partial Prerendering"
description: "Learning about Partial Prerendering"
pubDate: "Aug 9, 2026"
heroImage: "/coffee-codex/partial-prerendering/cover.webp"
---

## Introduction

I'm at North of Main Cafe and today I'm learning about Partial Prerendering.

<img src="/coffee-codex/partial-prerendering/coffee.webp" srcset="/coffee-codex/partial-prerendering/coffee-640.webp 640w, /coffee-codex/partial-prerendering/coffee-1280.webp 1280w" sizes="(min-width: 768px) 672px, calc(100vw - 3rem)" width="3024" height="4032" alt="An iced coffee at North of Main Cafe" loading="lazy" decoding="async" />

I was working on a Next.js site yesterday and started looking into performance optimization. I know partial prerendering and incremental static regeneration are useful patterns for frontend performance, and it really blew my mind how powerful they are, so I thought I'd dive a bit deeper into how they work.

## Next.js

This post will be focused on Next.js since that's what I used. I was building an e-commerce site and I think the coolest part is the build output:

```text
Route (app)                                                      Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ○ /admin
├ ○ /cart
├ ○ /checkout
├ ○ /items                                                           30d      1y
├   /items/[id]
│ ├ ◐ /items/[id]
│ ├ ○ /items/j979chw9a5sdrnfm3y8zf3fgjh8c3xwz                        30d      1y
│ ├ ○ /items/j978tjn8t1rnwmnqkgdgbvmvx58c2hht                        30d      1y
│ └ ◐ [+101 more paths]
├ ○ /orders
└   /orders/[id]
  └ ◐ /orders/[id]

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

Look at all of those ○! This means that when a request is made to a static route, it can be served directly from the CDN while the cache is active. Even for the items like `/items/j979chw9a5sdrnfm3y8zf3fgjh8c3xwz` whose metadata lives in a database, that information is queried at build time and cached, so subsequent requests do not have to query the database at all. This is perfect for a catalog of items since it does not change too much. When it does change, the mutation can invalidate the cache.

```ts
export async function getItems() {
  "use cache"; // This tells Next to cache the items under the 'items-list' tag, it will stay cached under the "max" profile
  cacheLife("max");
  cacheTag("items-list");

  return (await fetchQuery(
    api.products.listItems,
  )) as ProductSummary[];
}
```

```ts
export async function addItem(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  ...


  await fetchMutation(api.items.add, {
    name,
    ...
  });

  updateTag("items-list"); // Invalidate the cache when an item is added to the list
}
```

This also works for individual elements, like those on the `/item/[id]` page.

```ts
export async function getItem(id: string) {
  "use cache";
  cacheLife("max");
  cacheTag(`item:${id}`);

  return (await fetchQuery(api.products.getItem, {
    id,
  })) as Product | null;
}
```

And so, when I refresh the product page, it does not need to query the database because I told Next all of the IDs to statically generate.

```ts
// Statically generate pages during build to be stored on CDN
export async function generateStaticParams() {
  const products = await getItems();
  return products.map((product) => ({ id: product.id }));
}
```

When a new item is added that was not known at build time, it will be queried on the next visit and cached according to the `getItem` cache profile.

### The dynamic parts

Of course, some parts of the app have to be dynamic, but everything else can be static, which is magical. The dynamically rendered parts of this app are:

- The shopping cart
- The inventory
- The orders page

Since my data is stored in Convex, the reactivity of the cart was also extremely easy to implement. The cart component subscribes to the cart store and mutations update it automatically. These parts are mostly reactive client components, which is a different kind of dynamic rendering than the server-rendered parts that PPR can stream.

## How it works

Ok, let's dive a bit deeper into how PPR works (I've already talked about how Convex works <a href='/blog/coffee-codex-convex-backend/'>here</a>). I think it'll be a bit clearer if we work backwards from what gets served from the CDN.

### CDN

The CDN typically serves the HTML and React Server Component (RSC) data. When I refresh my page, I see

```html
<!DOCTYPE html>
<html lang="en" class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable h-full antialiased">
    <head>
        <meta charSet="utf-8"/>
...
</html>
```

When navigating or prefetching I also see RSC data, which uses the React Flight protocol. The first request is a small route tree with metadata about the route.

```
:HL[...]             Resource preload hints
0:{"tree": ...}      Next router tree
"staleTime": 300     Browser can reuse it for 300 seconds
"buildId": "..."     Deployment it belongs to
```

In this case, both were cached by the provider. On Vercel, this shows up as this header:

```
x-vercel-cache: HIT
```

The CSS is not embedded in this payload. The `:HL` entry is a resource hint that lets the browser start loading the stylesheet early. The actual CSS lives in a separate content-hashed file under `/_next/static/immutable/`, so it can be cached very aggressively.

Then the actual page segment is requested. That response contains the serialized React elements for the page:

```
I[...]                 Client module and its JavaScript chunks
["$", "main", ...]    Serialized React element
"$L2"                  Lazy client component reference
```

Why split this into two requests? The first response is basically a map. It tells the Next.js client router which layouts and page segments make up the destination, which resources are needed, and which pieces might already be in the browser's segment cache. The second response contains the missing page content. This seems unnecessary for a small `/cart` page, but it becomes useful with nested layouts, parallel routes, loading boundaries, and dynamic parameters.

At this point, the CDN is just serving bytes that were generated earlier. It does not run React, understand my components, or query Convex.

### Cache misses and PPR

The more interesting case is a new item that was added after the build. There is no concrete static page for `/items/new-id` yet, but Next.js does have a generic prerender for `/items/[id]`:

```
items/[id].html       Static HTML shell
items/[id].rsc        Static part of the RSC payload
items/[id].meta       Metadata, including postponed rendering state
```

Those are the files I see in the local `.next/server/app` output. The HTML shell contains everything Next.js could render without knowing the actual ID. It also stores some state that React can use to finish the item-specific part later.

The first request for the new item looks roughly like this:

```
Browser
  -> CDN cache miss
  -> Next.js runtime
       -> read the generic [id] shell
       -> resolve the real id
       -> call getItem(id)
       -> query Convex on a cache miss
       -> resume and stream the unfinished render
```

This is where PPR and ISR meet, but they are not the same thing. PPR is about when the page is rendered. The static shell is rendered ahead of time, and the missing part is rendered on the request. ISR is about how long the result can be reused. After this first request, Next.js can save the finished page so the next visitor can get it from the cache.

The `getItem(id)` cache and the generated page are also separate. `use cache` caches the data returned by the function, and Next.js uses that data to create the HTML and RSC output that can be served from the CDN.

In this app, `cacheLife("max")` gives the cached work a 30-day revalidation time and a one-year expiration time. After 30 days, Next.js can serve the existing result while refreshing it in the background. Calling `updateTag()` lets me refresh it immediately after a mutation instead.

### React, Next.js, and Vercel

These happen at different times. At a high level, each part of the system does something like this (this is dramatic pseudocode):

```ts
// Build time
async function prerenderRoute(route) {
  const app = Next.createRouteTree(route);

  // While React walks the tree, Next.js returns cached data when it can.
  // If code reaches request-time data, Next.js tells React to postpone there.
  const { prelude, postponed } = await React.prerender(app);

  Next.cache.set(route, {
    html: prelude,
    postponed,
    revalidate,
    tags,
  });
}

// Request time
async function renderRoute(route, request) {
  const cachedRoute = Next.cache.get(route);
  response.write(cachedRoute.html);

  if (cachedRoute.postponed) {
    const app = Next.createRouteTree(route, request);
    response.stream(await React.resume(app, cachedRoute.postponed));
  }
}

// Deployment infrastructure
async function handleRequest(route, request) {
  const cachedRoute = Vercel.cdn.get(route);

  if (cachedRoute?.complete) {
    return cachedRoute.response;
  }

  if (cachedRoute?.shell) {
    const continuation = await Vercel.nextRuntime.resume(route, request);
    return stream(cachedRoute.shell, continuation);
  }

  return Vercel.nextRuntime.render(route, request);
}
```

PPR is mostly implemented in open-source React and Next.js. Vercel provides the CDN, storage, and runtime around it. It also works with `next start`, except my own Next.js server handles the cache and resume instead.

One important detail is that the CDN and the Next.js cache are still different layers. On Vercel, they are integrated, but if I put another CDN in front of a self-hosted Next.js server, invalidating a Next.js tag would not automatically purge that CDN.

## References

- [Next.js: Caching and Partial Prerendering](https://nextjs.org/docs/app/getting-started/caching)
- [Next.js: Incremental Static Regeneration with Cache Components](https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components)
- [Next.js: PPR Platform Guide](https://nextjs.org/docs/app/guides/ppr-platform-guide)
- [Next.js: Using a CDN](https://nextjs.org/docs/app/guides/cdn-caching)
- [React: prerender](https://react.dev/reference/react-dom/static/prerender)
- [React: resume](https://react.dev/reference/react-dom/server/resume)
- [Next.js source: importing React's prerender API](https://github.com/vercel/next.js/blob/62d9b8e03160727191bdcecd96c2284575621501/packages/next/src/server/app-render/stream-ops.node.ts#L16)
- [Next.js source: receiving the prelude and postponed state](https://github.com/vercel/next.js/blob/62d9b8e03160727191bdcecd96c2284575621501/packages/next/src/server/app-render/app-render.tsx#L9322)
- [Next.js source: resuming the HTML stream](https://github.com/vercel/next.js/blob/62d9b8e03160727191bdcecd96c2284575621501/packages/next/src/server/app-render/app-render.tsx#L4096)
