# Rendering and caching

How a page reads data, what it caches, and what invalidates it. The decision behind this is ADR-0007; this document is the working detail every page issue in E8 follows.

## Reading data

`src/lib/data` is the only way a page reaches Payload.

```ts
import { getPayloadClient } from '@/lib/data/payload'

const payload = await getPayloadClient()
const media = await payload.find({ collection: 'media', depth: 0, limit: 15 })
```

`getPayloadClient()` memoises the instance for the process and dedupes the lookup within one render pass, so a page and the blocks below it share a single await instead of each building their own client.

Two rules keep queries honest:

- **`depth: 0` by default.** Raise it one level at a time and only for relationships the markup actually renders. A hero that shows one image does not need the airport behind the aircraft behind the image.
- **`select` what you render.** The aircraft table has around fifty columns and a card shows five. Listing queries name their fields; detail queries may take the document.

Never read Payload from a client component, and never fetch the initial content of a page over HTTP from your own API. The page is a server component; it queries directly.

## Static, dynamic and cached

| Page kind                                   | Strategy                                                             |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Content pages (the 13 static routes)        | `generateStaticParams` over the routed locales, prerendered          |
| Collection detail (aircraft, yacht)         | `generateStaticParams` where the set is bounded, cached otherwise    |
| Listings with `searchParams`                | Cached dynamic: rendered on demand, tagged, reused until invalidated |
| Anything reading `headers()` or `cookies()` | Dynamic; keep it to the smallest possible subtree                    |

`generateStaticParams` reads `routing.locales`, never a hard-coded list, so a locale becoming public (issue #53) changes what is prerendered without touching a page.

Reaching for `headers()` or `cookies()` at the top of a page makes the whole page dynamic. Push it into a leaf, or read it in a client island, so the shell can still be prerendered.

## Cache tags

A write invalidates one tag, the collection slug (`media`, `aircraft`), with the `max` profile. Tag a cached read with `cacheTag(<collection>)` inside a `'use cache'` function. Finer tags (one listing, one document, one locale) are added together with the first reader that needs them, never ahead of it (ADR-0008).

## Invalidation

Every collection that feeds a page carries the hooks:

```ts
import { revalidateCollection } from '@/hooks/revalidate'

hooks: {
  afterChange: [revalidateCollection('media').afterChange],
  afterDelete: [revalidateCollection('media').afterDelete],
}
```

A write, a delete included, invalidates the collection tag.

Two details worth knowing:

- The hooks pass `'max'` as the revalidation profile. Next 16 deprecated the single-argument `revalidateTag`, and `max` means the next visitor is served the stale page while the new one renders behind them, instead of waiting for a blocking cache miss.
- A write carrying `context.skipRevalidation` is ignored. The E5 importers write tens of thousands of rows and must not queue one invalidation per row (ADR-0002 section 6 runs them with hooks skipped through `context`).

Adding a collection without these hooks is the usual cause of "the editor saved but the site still shows the old text", so it belongs in the review checklist below.

## Listing URLs

Filters, sorting and pagination live in the URL, never in client state. The legacy listing kept them in React state, so "load more" dropped the filters and no listing URL could be shared or crawled (`docs/legacy-inventory.md` section 4).

The first listing page (E8) brings the `searchParams` parser with it, and it keeps this contract: the parameters are `page`, `perPage`, `sort`, `direction` and one per filter; a filter accepts repetition and commas alike; anything unparseable falls back to the default rather than throwing; `perPage` is capped; the canonical URL omits defaults and sorts filters, so crawlers see one URL per listing and the cache holds one entry.

## Streaming

Wrap a slow region in `<Suspense>` with a skeleton rather than blocking the shell, and keep the fallback the same height as the content so nothing shifts when it arrives. The page shell, the header and the first screen of content should never sit behind a boundary: they are what the visual tier screenshots and what a crawler reads.

## Review checklist

For any pull request that adds or changes a page, a block or a collection:

- [ ] Data is read through `getPayloadClient()` with a justified `depth` and an explicit `select` on listings.
- [ ] The initial content is in the server response; the e2e test asserts it on the raw HTML.
- [ ] `'use client'` appears only on leaves, never on a page or a block wrapper.
- [ ] Static where it can be: `generateStaticParams` reads the routed locales.
- [ ] `headers()` and `cookies()` are not read at page level unless the page must be dynamic.
- [ ] A new collection that feeds a page carries the revalidation hooks.
- [ ] A cached read tags itself with the slug of the collection it reads.
- [ ] Listing state is in `searchParams`; unparseable values fall back to defaults and the canonical URL omits them.
- [ ] Suspense fallbacks reserve the height of what they replace.
