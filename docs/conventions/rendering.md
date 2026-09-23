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

| Page kind                                           | Strategy                                                          | What a running build answers (#178)                                 |
| --------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| Content pages (the 13 static routes)                | `generateStaticParams` over the enabled locales, prerendered      | `x-nextjs-prerender: 1`, `x-nextjs-cache: HIT`                      |
| A locale a content page is not served in            | Rendered once, then the 307 is cached like a page                 | `x-nextjs-cache: HIT`, `location` (see #364)                        |
| `sitemap.xml`, the catalogue sitemaps, `robots.txt` | Prerendered with the content they list                            | `x-nextjs-cache: HIT`                                               |
| Collection detail (aircraft, yacht)                 | `generateStaticParams` where the set is bounded, cached otherwise | **rendered per request today**: no `generateStaticParams` on either |
| Listings with `searchParams`                        | Rendered on demand, one render per query                          | **rendered per request**: `searchParams` is a request-time API      |
| Anything reading `headers()` or `cookies()`         | Dynamic; keep it to the smallest possible subtree                 | dynamic                                                             |

The third column is what `tests/e2e/caching.e2e.spec.ts` reads back off a running build (on Vercel the cache header is `x-vercel-cache`; `x-nextjs-cache` is a local server's, #17), and the last two rows are the gap between the plan and the site: neither catalogue opts into a cache, so every visit re-queries Payload. Closing it means a `generateStaticParams` over each catalogue (both sets are already enumerated, by `listAircraftForSitemap` and `listCharterYachtsForSitemap`) or a `'use cache'` reader; it belongs to the issue that decides it, not to a page that happens to be edited.

`generateStaticParams` reads `getEnabledLocales()` (`src/lib/data/site-settings.ts`), never a hard-coded list, so a language an administrator enables is prerendered without touching a page (issue #53).

Reaching for `headers()` or `cookies()` at the top of a page makes the whole page dynamic. Push it into a leaf, or read it in a client island, so the shell can still be prerendered.

## Cache tags

A write invalidates one tag, the collection slug (`media`, `aircraft`), with the `max` profile. Tag a cached read with `cacheTag(<collection>)` inside a `'use cache'` function. Finer tags (one listing, one document, one locale) are added together with the first reader that needs them, never ahead of it (ADR-0008).

**Nothing carries one yet.** A page reads Payload through the Local API rather than through a cached function, so what Next stored carries only the path tags it writes itself — read `x-next-cache-tags` off any `.meta` under `.next/server/app` — and the tag the hooks drop matches nothing. That is why the hooks drop the rendered pages by path as well (below). The tag call stays for the first reader that opts into `'use cache'`.

## Invalidation

Every collection that feeds a page carries the hooks:

```ts
import { revalidateCollection } from '@/hooks/revalidate'

hooks: {
  afterChange: [revalidateCollection('media').afterChange],
  afterDelete: [revalidateCollection('media').afterDelete],
}
```

A write, a delete included, invalidates the collection tag **and drops every rendered page** with `revalidatePath('/', 'layout')`. Until #178 it dropped the tag alone, which reached nothing: an editor published a change, the database held it, the API served it, and the site kept the old page for ever. `tests/e2e/caching.e2e.spec.ts` saves a page through the API and reads the new title back off the next request, so the gap cannot reopen quietly.

Three details worth knowing:

- The path invalidation is deliberately blunt: one save drops the whole tree. Only the editorial collections install these hooks, a bulk import opts out, and `max` serves the stale page while the new one renders, so a save costs a re-render and never a visitor's wait. A narrower instrument is worth having only once a reader carries a tag.

- The hooks pass `'max'` as the revalidation profile. Next 16 deprecated the single-argument `revalidateTag`, and `max` means the next visitor is served the stale page while the new one renders behind them, instead of waiting for a blocking cache miss.
- A write carrying `context.skipRevalidation` is ignored. The E5 importers write tens of thousands of rows and must not queue one invalidation per row (ADR-0002 section 6 runs them with hooks skipped through `context`).

Adding a collection without these hooks is the usual cause of "the editor saved but the site still shows the old text", so it belongs in the review checklist below.

## Listing URLs

Filters, sorting and pagination live in the URL, never in client state. The legacy listing kept them in React state, so "load more" dropped the filters and no listing URL could be shared or crawled (`docs/legacy-inventory.md` section 4).

The parser is `src/lib/listing.ts`, brought by the aircraft page (#135). The parameters are `page`, `perPage`, `sort` and `direction`, plus one per filter on a listing that has filters; anything unparseable falls back to the default rather than throwing, `perPage` is capped, and the canonical URL omits defaults, so crawlers see one URL per listing and the cache holds one entry. `page` is how far the listing has been read rather than which slice is on screen: page two shows the first two pages' worth, because "show more" adds a batch under the cards already read rather than replacing them.

A listing is served by a route of its own and rendered on demand, because `searchParams` is a request-time API and reading it in the catch-all would take the prerendering away from every page it serves. Such a route says so in `DYNAMIC_PAGE_SLUGS` (`src/collections/Pages.ts`), which is what keeps `generateStaticParams` and the build's route check (#178) from expecting a prerendered page that cannot exist.

## Streaming

Wrap a slow region in `<Suspense>` with a skeleton rather than blocking the shell, and keep the fallback the same height as the content so nothing shifts when it arrives. The page shell, the header and the first screen of content should never sit behind a boundary: they are what the visual tier screenshots and what a crawler reads.

## Review checklist

For any pull request that adds or changes a page, a block or a collection:

- [ ] Data is read through `getPayloadClient()` with a justified `depth` and an explicit `select` on listings.
- [ ] The initial content is in the server response; the e2e test asserts it on the raw HTML.
- [ ] `'use client'` appears only on leaves, never on a page or a block wrapper.
- [ ] Static where it can be: `generateStaticParams` reads the enabled locales.
- [ ] `headers()` and `cookies()` are not read at page level unless the page must be dynamic.
- [ ] A new collection that feeds a page carries the revalidation hooks.
- [ ] A cached read tags itself with the slug of the collection it reads.
- [ ] Listing state is in `searchParams`; unparseable values fall back to defaults and the canonical URL omits them.
- [ ] Suspense fallbacks reserve the height of what they replace.
