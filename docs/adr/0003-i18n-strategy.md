# ADR-0003: Locales, content localisation and routing

Status: accepted (2026-09-11)

## Context

The legacy site routes `en` and `ru` with a locale prefix on every URL, ships a partial `uk` catalogue that is never loaded, and hides many strings in code (`locale === 'ru' ? ... : ...`, English-only labels, inline Russian content). Content must move into Payload.

## Decision

- **Locales:** `en` (default), `ru`, `uk` in Payload localisation with fallback to the default locale. `uk` starts **hidden**: editors can enter it, but it is not routed.
- **Enablement flag:** `SiteSettings.enabledLocales` decides which locales are public. The proxy returns 404 for hidden locales; sitemaps, hreflang alternates and the locale switcher read the same flag. The next-intl routing configuration lists all three locales; enablement is a runtime check.
- **Routing:** next-intl v4 under `src/app/(frontend)/[locale]` with `proxy.ts` (Next 16), `localePrefix: 'always'` as today, the legacy locale detection behaviour reproduced, and `/admin`, `/api` and static files excluded.
- **Ownership of strings:** page and section content, navigation, footer and contact data are localised fields in Payload (blocks and globals). Application microcopy (form validation, buttons, aria labels) lives in next-intl message catalogs in the repository. No component contains language ternaries.
- **String extraction audit:** before porting, every rendered page and component of the legacy site is walked for strings that never lived in `messages/*.json`; they are added to the catalogue and translated for `uk` (`docs/legacy-inventory.md` section 11).
- **Formatting:** ICU messages for plurals (for example hours), locale-aware dates rendered in UTC where the legacy did, hreflang with `x-default` pointing to the default locale.

## Consequences

- `uk` becomes public by flipping the flag once its catalogue and content are complete; no code change.
- Legacy URLs keep their locale prefix; redirects cover legacy paths without one.
