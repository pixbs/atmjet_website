# ADR-0007: SSR-first rendering and caching

Status: accepted (2026-09-11)

## Context

The legacy aircraft listing fetched data from the client in `useEffect`, yacht filtering ran on the client from `useSearchParams`, and most pages shipped no metadata. Performance and SEO are explicit goals of the rewrite.

## Decision

- **Server Components by default.** Pages and blocks are server components that read Payload through the Local API. The initial content of every page is in the HTML the server sends.
- **Client islands only for interactivity:** forms, carousels, dialog shells, header scroll state, the cookie banner. `'use client'` lives on the leaf, not on the page.
- **URL-driven state.** Listing filters, sorting and pagination are `searchParams`; the server renders the filtered result. No client-side data fetching for initial render.
- **Metadata on the server** through `generateMetadata`, `metadataBase` from `NEXT_PUBLIC_SITE_URL`, hreflang from the enabled locales.
- **Caching:** static generation (`generateStaticParams` per enabled locale) for content pages; cached dynamic rendering for database-driven pages; Payload `afterChange` hooks call `revalidateTag` / `revalidatePath` for the affected locales. Suspense boundaries stream slow parts without blocking the shell.
- **Proof:** every page e2e test asserts that its primary content is present in the raw server response.

## Consequences

- Legacy client-side behaviours are re-implemented server-side with the same visible result.
- Revalidation is part of every collection that feeds a page.
