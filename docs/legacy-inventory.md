# ATM JET legacy website — exhaustive inventory (`legacy/v1`, commit `8b8f375`)

> Source of truth: the legacy repo at tag `legacy/v1` (commit `8b8f375`, Next.js 14 App Router + next-intl 3 + Drizzle + Tailwind 3). All paths below are relative to the legacy repo root unless prefixed with `atmjet-admin/` (the separate admin app). Every claim was checked against the code; statements that could not be confirmed from code alone are marked **UNVERIFIED**.

## 0. Purpose and how to use

- **What this is**: the single reference map of the legacy site for the from-scratch rewrite (Payload 3 + Next 16). Every route, chrome component, section, element, form, integration, table, env var, asset group and SEO artifact is described with its file, behaviour, look-defining class lists, i18n keys and known bugs.
- **Parity definition**:
  - _Visual parity_: the rendered page must look identical (same DOM structure where it affects layout, same Tailwind class effects, same fonts, same motion timings). Class lists quoted in this document are the contract.
  - _Behavioural parity_: identical behaviour **unless** the behaviour is listed in §13 with tag `fix-while-porting` (pure behaviour bug, fixing it changes no pixels) or `parity-decision` (fixing it changes the render, needs an explicit decision). `keep` marks intentional oddities that must be reproduced.
- **How issues reference this document**: every heading is a stable anchor. Use the exact heading text, e.g. `legacy-inventory.md#route-localeaircraftid`, `#section-emptylegsection-sectionsempty_legtsx`, `#element-bookingdialog-elementsbooking_dialogtsx`, `#table-aircrafts`. Headings are never renamed; new facts are appended under the existing heading.
- **Citations**: `path:line-line` refers to the legacy file at tag `legacy/v1`. Snippets are quoted verbatim where the exact behaviour matters (lookup algorithms, regexes, message formats, class lists).
- **Backlog mapping**: §15 maps every item to the epics/themes of plan §8 (E0–E12).

## 1. Stack and repository facts

### 1.1 Versions (`package.json`)

| Area         | Package                                                                                                                                                                                                                   | Range in `package.json`                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Framework    | `next`                                                                                                                                                                                                                    | `^14.2.5` (`eslint-config-next` pinned `14.2.5`)            |
| React        | `react`, `react-dom`                                                                                                                                                                                                      | `^18`                                                       |
| i18n         | `next-intl`                                                                                                                                                                                                               | `^3.17.0`                                                   |
| DB           | `drizzle-orm` `^0.32.0`, `@vercel/postgres` `^0.9.0`, `drizzle-kit` `^0.23.0` (dev), `dotenv` `^16.4.5`                                                                                                                   |                                                             |
| Styling      | `tailwindcss` `^3.4.4`, `tailwindcss-animate` `^1.0.7`, `autoprefixer`, `postcss`, `prettier-plugin-tailwindcss` `^0.6.5`, `tailwind-merge` `^3.0.1`, `clsx`, `class-variance-authority`                                  |                                                             |
| Motion       | `framer-motion` `^11.3.2`, `react-intersection-observer` `^9.13.0`                                                                                                                                                        |                                                             |
| Carousel     | `embla-carousel-react` `^8.1.6`, `embla-carousel-wheel-gestures` `^8.0.1` (`embla-carousel` types imported transitively)                                                                                                  |                                                             |
| Forms        | `react-hook-form` `^7.52.1`, `@hookform/resolvers` `^3.9.0`, `zod` `^3.23.8`, `libphonenumber-js` `^1.12.9`, `react-phone-number-input` `^3.4.12` (only `/flags` used live), `react-phone-input-2` `^2.15.0` (**unused**) |                                                             |
| Radix/shadcn | `@radix-ui/react-{dialog,label,popover,scroll-area,slider,slot,toast,tooltip}`, `cmdk` `^1.1.1`, `lucide-react` `^0.474.0`                                                                                                | all only used by dead `ui/*`/`phone-input` except none live |
| Vercel       | `@vercel/analytics` `^1.3.1`, `@vercel/speed-insights` `^1.0.12`, `@next/third-parties` `^14.2.5`, `vercel` `^37.12.1` (**unused** CLI as dependency)                                                                     |                                                             |
| Misc         | `axios` `^1.7.2` (Kommo route), `cookies-next` `^4.2.1`, `lodash` `^4.17.21` (debounce), `usehooks-ts` (**unused**), `next-sitemap` `^4.2.3` (**unused**, no config file), `prettier` `^3.3.2` (as runtime dep)           |                                                             |
| Dev          | `@svgr/webpack` `^8.1.0` (used from `next.config.mjs`), `typescript` `^5`, `eslint` `^8`, `husky` `^9.0.11`, `lint-staged` `^15.2.7`                                                                                      |                                                             |

Exact resolved versions are **UNVERIFIED**: there is **no lockfile** (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock*` all absent; `bun.lockb`/`bun.lock` are git-ignored, `.gitignore:19-20`) and no `node_modules` in the checkout.

Dependency liveness (grep of imports): live — `@hookform/resolvers`, `@next/third-parties`, `@vercel/analytics|postgres|speed-insights`, `axios` (dead route only), `clsx`, `cookies-next`, `dotenv`, `drizzle-orm`, `embla-carousel-react`, `embla-carousel-wheel-gestures`, `framer-motion`, `libphonenumber-js`, `lodash`, `next-intl`, `react-hook-form`, `react-intersection-observer`, `react-phone-number-input` (flags + types), `tailwind-merge`, `zod`, `tailwindcss-animate`, `@svgr/webpack`. Only-dead-code — `@radix-ui/*` (all), `cmdk`, `lucide-react`, `class-variance-authority`. Unused anywhere — `@radix-ui/react-label`, `next-sitemap`, `react-phone-input-2` (only a `declare module` in `src/types/react-phone-input-2.d.ts` and CSS overrides in `globals.css:283-296`), `usehooks-ts`, `vercel`.

### 1.2 Scripts and tooling

| Script (`package.json:5-13`) | Command                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `dev`                        | `next dev`                                                                                                        |
| `build:next`                 | `next build` (note: no plain `build` script)                                                                      |
| `start`                      | `next start`                                                                                                      |
| `lint`                       | `next lint`                                                                                                       |
| `format`                     | `prettier --write .`                                                                                              |
| `prepare`                    | `husky .` (husky **not installed/configured**: no `.husky/` directory)                                            |
| `studio`                     | `drizzle-kit studio` (no `generate`/`push`/`migrate` scripts; no `drizzle/` folder — git-ignored `.gitignore:47`) |

- `lint-staged` config (`package.json:74-76`): only `"*.js": "eslint --cache --fix"` — TS/TSX never linted on commit (and husky is not wired anyway).
- **No tests, no CI** (`.github/` absent), no `vercel.json`, no `.env.example`, no `next-sitemap.config.js`.
- `trustedDependencies: ["@vercel/speed-insights","unrs-resolver"]` (Bun field, `package.json:77-80`) → the project was installed with Bun.
- `.eslintrc.json`: `extends: ["next","next/core-web-vitals","prettier"]`.
- `.prettierrc.json`: single quotes, JSX single quotes, no semicolons, tabs (width 2), printWidth 100, `prettier-plugin-tailwindcss`.
- `README.md`: generic; claims messages live in `src/messages` (they live in `messages/`) and that videos live in `public/en/video/` (see §12).

### 1.3 Config files

- **`next.config.mjs`** (`next.config.mjs:1-78`): wrapped by `createNextIntlPlugin()` (default `./src/i18n.ts`).
  - `webpack()` (`:6-30`): SVGR pipeline — existing SVG file-loader rule re-applied only for `*.svg?url`; every other `*.svg` import becomes a React component via `@svgr/webpack`; original file rule gets `exclude: /\.svg$/i`.
  - `images.remotePatterns` (`:31-46`): `https://atmjet.ams3.cdn.digitaloceanspaces.com/**` and `https://atmjet.s3.eu-north-1.amazonaws.com/**`. No `dangerouslyAllowSVG`, no `trailingSlash`, no `output`.
  - `redirects()` (`:47-74`), all `permanent: true` (308):

    | source                 | destination           |
    | ---------------------- | --------------------- |
    | `/:slug/jets`          | `/`                   |
    | `/:slug/planes`        | `/:slug/aircraft`     |
    | `/:slug/planes/:id`    | `/:slug/aircraft/:id` |
    | `/:slug/aircrafts`     | `/:slug/aircraft`     |
    | `/:slug/aircrafts/:id` | `/:slug/aircraft/:id` |

- **`tailwind.config.ts`** (`tailwind.config.ts:1-82`): `darkMode: ['class']`; content globs `./src/pages/**`, `./src/components/**`, `./src/app/**` (`*.{js,ts,jsx,tsx,mdx}`); `theme.fontFamily` **replaced** (not extended): `sans: ['Inter','sans-serif']`, `serif: ['TARegressoPROEasyRegular','serif']`; `extend.colors.gray` inverted ramp (full values in §10.2); shadcn HSL tokens (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart.1-5`) all pointing at CSS variables that are **never defined**; `extend.backgroundImage.gold` (gradient string in §10.2); `extend.borderRadius` `lg/md/sm` from `var(--radius)` (never defined); `plugins: [require('tailwindcss-animate')]`.
- **`postcss.config.mjs`**: `tailwindcss` only (autoprefixer not registered even though installed).
- **`tsconfig.json`**: strict, `moduleResolution: bundler`, `jsx: preserve`, `target: ES2017`, paths `@/* → ./src/*`, include `next-env.d.ts, **/*.ts, **/*.tsx, .next/types/**/*.ts`.
- **`components.json`** (shadcn): style `new-york`, rsc, tsx, tailwind config `tailwind.config.ts`, css `src/app/[locale]/globals.css`, baseColor `neutral`, cssVariables true, aliases `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`, iconLibrary `lucide`.
- **`drizzle.config.ts`**: `dialect: postgresql`, `schema: ./src/lib/drizzle.ts`, `dbCredentials.url = process.env.POSTGRES_URL || ''`, loads `.env.local` via dotenv.
- **`.gitignore`**: ignores `.env`, `.env.local`, `.env*.local`, `/drizzle`, `bun.lock*`, `*.zip`, `*.rar`, `.vercel`.

### 1.4 Scripts folder and `optimize.ps1`

- `scripts/number-iso.js` (`:1-30`): ESM script; fetches `https://restcountries.com/v3.1/all?fields=name,cca2,idd`, keeps entries with `idd.root`, maps to `{ name (apostrophes escaped), iso: cca2, code: root + first suffix }`, sorts by `name.localeCompare`, writes `src/countries.ts` as `export const COUNTRIES: Country[] = [...]`. The committed `src/countries.ts` has **249 entries** and additionally the `Country` interface + `import flags from 'react-phone-number-input/flags'` header that the generator does **not** emit (hand-edited after generation). `COUNTRIES[0]` = Afghanistan `+93`, `COUNTRIES[1]` = Åland Islands `+35818` (see §7.2 default-country bug).
- `optimize.ps1` (`:1-28`): PowerShell TinyPNG optimizer for all `*.webp` recursively (`Invoke-RestMethod https://api.tinify.com/shrink` with Basic auth, downloads `output.url` over the source). **Line 2 assigns a real TinyPNG API key in clear text** (`$apiKey = ...`) — the value is intentionally not reproduced here; it is a leaked credential to rotate (plan E0.6).

### 1.5 Repository/git facts

- Tag `legacy/v1` → commit `8b8f375` ("🔥 feat: Implement aircraft details and listing pages with enhanced metadata and booking sections"). Prior commits: `596e0f6`, `d8f3c8a`.
- Package name `atm_jet_website_two`, version `0.1.0`, private.

## 2. Routing, locales, SEO artifacts

### 2.1 Route table (`src/app/**`)

| URL (after locale prefix)    | File                                                                                                         | Kind           | Rendering                                                                             | Notes                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/[locale]`                  | `src/app/[locale]/page.tsx`                                                                                  | page           | server (sync; `useTranslations`), `generateMetadata`                                  | Home; wraps `<main>` in `<Suspense fallback={<Preloader isStatic />}>`                                                                  |
| `/[locale]/aircraft`         | `src/app/[locale]/aircraft/page.tsx`                                                                         | page           | server shell + **client** `AircraftsList`                                             | listing, sort selects                                                                                                                   |
| `/[locale]/aircraft/[id]`    | `src/app/[locale]/aircraft/[id]/page.tsx`                                                                    | page           | async server + server action `formAction`                                             | rich detail; falls back to `[id]/old.tsx`                                                                                               |
| (not a route)                | `src/app/[locale]/aircraft/[id]/old.tsx`                                                                     | module         | async server                                                                          | imported by `[id]/page.tsx` as `VehiclePage`; its `generateMetadata` export is **dead** (only `page.tsx` metadata exports are honoured) |
| (not a route)                | `src/app/[locale]/aircraft/old.tsx`                                                                          | module         | `'use server'` async                                                                  | **DEAD** — nothing imports it (former listing with `VehiclesCarousel` ×3 + `AllAircrafts`)                                              |
| (helpers)                    | `src/app/[locale]/aircraft/actions.ts`, `aircraft_card.tsx`, `aircraft_list.tsx`                             | modules        | server actions / RSC card / client list                                               |                                                                                                                                         |
| `/[locale]/atm_jet_group`    | `src/app/[locale]/atm_jet_group/page.tsx`                                                                    | page           | server (sync)                                                                         |                                                                                                                                         |
| `/[locale]/business_agents`  | `src/app/[locale]/business_agents/page.tsx`                                                                  | page           | server (sync)                                                                         | PDFs on DO Spaces                                                                                                                       |
| `/[locale]/cargo_charter`    | `src/app/[locale]/cargo_charter/page.tsx`                                                                    | page           | server (sync)                                                                         |                                                                                                                                         |
| `/[locale]/citizens`         | `src/app/[locale]/citizens/page.tsx`                                                                         | page           | server (sync)                                                                         | `redirect('/')` unless `locale === 'ru'`                                                                                                |
| `/[locale]/empty_legs`       | `src/app/[locale]/empty_legs/page.tsx`                                                                       | page           | server (sync) + async `EmptyLegSection`                                               |                                                                                                                                         |
| `/[locale]/group_charters`   | `src/app/[locale]/group_charters/page.tsx`                                                                   | page           | server (sync)                                                                         |                                                                                                                                         |
| `/[locale]/medical_aviation` | `src/app/[locale]/medical_aviation/page.tsx`                                                                 | page           | server (sync)                                                                         |                                                                                                                                         |
| `/[locale]/partners`         | `src/app/[locale]/partners/page.tsx`                                                                         | page           | server (sync)                                                                         |                                                                                                                                         |
| `/[locale]/sales_dept`       | `src/app/[locale]/sales_dept/page.tsx`                                                                       | page           | async server (DB)                                                                     |                                                                                                                                         |
| `/[locale]/sales_yachts`     | `src/app/[locale]/sales_yachts/page.tsx`                                                                     | page           | async server (DB)                                                                     |                                                                                                                                         |
| `/[locale]/yachts`           | `src/app/[locale]/yachts/page.tsx`                                                                           | page           | async server (DB) + **client** `FilterSection`/`YachtsSection`                        | `searchParams` read client-side only                                                                                                    |
| (helpers)                    | `src/app/[locale]/yachts/YachtsSection.tsx`, `filter_section.tsx`, `dual_range.tsx`, `yacht_card.tsx`        | modules        | client / client / client (dead) / card without directive (client via `YachtsSection`) |                                                                                                                                         |
| `/[locale]/yachts/[id]`      | `src/app/[locale]/yachts/[id]/page.tsx`                                                                      | page           | async server + server action                                                          |                                                                                                                                         |
| `/[locale]` layout           | `src/app/[locale]/layout.tsx`                                                                                | layout         | async server; calls `headers()` → **every route is dynamically rendered**             | root layout (`<html>`) lives here; no `src/app/layout.tsx`                                                                              |
| `/[locale]` loading          | `src/app/[locale]/loading.tsx`                                                                               | loading        | `<Preloader isStatic />`                                                              |                                                                                                                                         |
| `/sitemap.xml`               | `src/app/sitemap.ts`                                                                                         | metadata route | static list                                                                           | outside `[locale]`                                                                                                                      |
| `/aircraft/sitemap.xml`      | `src/app/aircraft/sitemap.ts`                                                                                | metadata route | DB (`vehicles`)                                                                       | outside `[locale]`                                                                                                                      |
| `/robots.txt`                | `src/app/robots.ts`                                                                                          | metadata route | static                                                                                |                                                                                                                                         |
| `/favicon.ico`               | `src/app/favicon.ico` (4,286 B)                                                                              | static         |                                                                                       |                                                                                                                                         |
| `POST /api/post_data`        | `src/app/api/post_data/route.ts`                                                                             | route handler  | Kommo CRM                                                                             | **no caller** in code                                                                                                                   |
| (module)                     | `src/app/telegramBot.ts`                                                                                     | `'use server'` | `sendMessage`                                                                         |                                                                                                                                         |
| (module)                     | `src/app/actions.ts`                                                                                         | `'use server'` | `getAirport`, `getAircrafts`                                                          | **DEAD** except via dead `AllAircrafts`                                                                                                 |
| **missing**                  | `not-found.tsx`, `error.tsx`, `global-error.tsx`, `manifest.ts`, `/privacy` page (linked from cookie banner) | —              | —                                                                                     | Next default 404/500 pages are shown without site chrome                                                                                |

Styles: `src/app/[locale]/globals.css` (imported by the layout).

### 2.2 Middleware and i18n config

`src/middleware.ts:1-39`:

```ts
const localeMapping = { en: 'en', ru: 'ru' }
// "URL Rewrites": for the first key whose prefix matches, rebuild the same URL and wrap in a new NextRequest (functional no-op)
const locales = Object.values(localeMapping) // ['en','ru']
const defaultLocale = modifiedRequest.headers.get('x-default-locale') || 'en'
const handleI18nRouting = createIntlMiddleware({ locales, defaultLocale })
const response = handleI18nRouting(modifiedRequest)
response.headers.set('x-default-locale', defaultLocale)
export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] }
```

- Locales: **`en`, `ru`** only (`uk` messages exist but `uk` is not a routable locale — `/uk/...` is treated as an unprefixed path and redirected to `/<detected>/uk/...` → 404).
- `defaultLocale` is read from the **request header `x-default-locale`** (client-controllable) and echoed back; in practice `'en'`. `localePrefix` is not set → next-intl v3 default **`always`** (every page URL carries `/en` or `/ru`; unprefixed URLs are redirected using next-intl's detection: `NEXT_LOCALE` cookie, then `Accept-Language`, then default).
- Matcher excludes `/api`, `/_next`, `/_vercel` and **any path containing a dot** (so `/sitemap.xml`, `/aircraft/sitemap.xml`, `/robots.txt`, `/video/*.mp4`, `/images/*` bypass i18n).
- `src/i18n.ts:1-28`: `getRequestConfig` validates `locale ∈ ['en','ru']` else `notFound()`, then spreads the 13 message files `messages/${locale}/{aircraft,atm_jet_group,business_agents,cargo,citizens,empty_leg,group_charters,home_page,medical_aviation,misc,partners,sales_dept,yachts}.json` into one flat message object (namespaces are top-level keys; no collisions — verified).

Internal links that are **not** locale-prefixed (rely on middleware redirect/detection): `/` (navbar Home, `navbar.tsx:15`, rendered with `legacyBehavior passHref` and a string child), `/business_agents` & `/partners` (`options.tsx:13,30`), `/yachts` (`yachts_card.tsx:56`, `YachtsSection.tsx:104`), `/citizens` (`angle_bar.tsx:61`), `/privacy` (`cookies_consent.tsx:38`), `/aircraft/${slug}` (`aircraft_card.tsx:27`), `/aircraft/${tailNumber}` (`vehicle_card.tsx:8`), `redirect('/aircraft')` (`aircraft/[id]/old.tsx:63`), `redirect('/yachts')` (`yachts/[id]/page.tsx:78`), `redirect('/')` (`citizens/page.tsx:27`). `GroupCard` builds `/${locale}/${href}` with `href='/aircraft'` → `/en//aircraft` (double slash, `group_card.tsx:24` + `atm_jet_group/page.tsx:27,35`). `YachtCard` (charter) uses a _relative_ `yachts/${slug}` (`YachtsSection.tsx:98`), which resolves correctly under `/en/yachts`.

### 2.3 Sitemaps and robots

`src/app/sitemap.ts:1-32` — `baseURL = VERCEL_PROJECT_PRODUCTION_URL || VERCEL_URL || 'localhost:3000'`; entries (exact):

```
'/', '/aircraft', '/atm_jet_group', '/business_agents', '/cargo_charter', '/citezens',
'/empty_legs', '/group_charters', '/medical_aviation', '/partners', '/sales_dept', '/yachts'
```

each → `{ url: https://${baseURL}${path}, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.8, alternates.languages: { ru: https://${baseURL}/ru${path}, en: https://${baseURL}/en${path} } }`.
Defects: `/citezens` typo (real route `/citizens`, RU-only); `/sales_yachts` missing; primary `url` values are **unprefixed** (they 308-redirect via middleware); no `x-default`; no sitemap index referencing `/aircraft/sitemap.xml`; no yacht detail URLs; `lastModified` = generation time.

`src/app/aircraft/sitemap.ts:1-26` — selects **all `vehicles` rows where `tail_number <> ''`** (legacy table, not `aircrafts`), emits `https://${baseURL}/aircraft/${tailNumber}` (priority 0.5, daily, ru/en alternates). Detail URLs therefore point at tail numbers, while listing cards link to `aircrafts.slug`.

`src/app/robots.ts:1-12` — `userAgent: '*'`, `allow: '/'`, `disallow: '/private/'` (no such route), `sitemap: 'https://atmjet.com/sitemap.xml'` (hard-coded host).

Both sitemap files contain no dynamic opt-in (`dynamic`/`revalidate`), so under Next 14 they are generated at build time (**UNVERIFIED** on the deployed project).

### 2.4 Metadata exports

| File                                           | Export                    | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/layout.tsx:14-28`            | `generateMetadata()`      | Computes `title = 'ATM JET - Flying private made simple'` and a RU/EN description (`:19-23`) into a local `metadata` object **but never returns it** (function returns `undefined`) → no layout-level title/description.                                                                                                                                                                                                                                                                                                |
| `src/app/[locale]/page.tsx:21-50`              | `generateMetadata()`      | title RU `Аренда частного самолета, заказать самолет в Москве и любой точке мира` / EN `Private Jet Charter, Hire a Private Jet Worldwide`; description RU `Арендовать частный самолет в течение нескольких часов.✈ заказать частный самолет в Москве, других городах и странах.` / EN `Hire a private jet within a few hours.✈ Book a private jet London, and other cities and countries.`; `openGraph.videos: [{ url: https://${baseURL}/video/background_full.mp4, type: 'video/mp4', width: 1920, height: 1080 }]`. |
| `src/app/[locale]/aircraft/[id]/old.tsx:14-51` | `generateMetadata(props)` | **Dead** (not a page file). Would produce `title: ATM JET                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ${vehicle.tailModel}`, description = `vehicle.description` with `\\n` joined by `,` (`.split('\\n').join()`), `openGraph.images[{ url: http://${vehicle.image}, 800×600, alt: tailModel }]`; crashes if no vehicle (no null check). |
| every other page                               | —                         | **No metadata at all** (12 static routes, `/aircraft`, `/aircraft/[id]`, `/yachts`, `/yachts/[id]`). Intended layout strings above are the only source for E11.1.                                                                                                                                                                                                                                                                                                                                                       |

No `metadataBase`, no icons/manifest metadata (favicon served by file convention only), no canonical/hreflang tags on pages.

### 2.5 Missing framework files and loading state

- `loading.tsx` (`src/app/[locale]/loading.tsx:1-5`) renders `<Preloader isStatic />` (§3.9) during navigation streaming for every `[locale]` route.
- No `not-found.tsx` at any level: `notFound()` from `i18n.ts` (bad locale) and unknown paths show Next's unstyled default 404 (no header/footer). No `error.tsx`/`global-error.tsx`: runtime errors (e.g. `/yachts` with an empty table, §4.13) show Next's default error page.
- No `/privacy` route although the cookie banner links to it.

## 3. Global layout and chrome

### 3.1 Root layout (`src/app/[locale]/layout.tsx`)

Render order (`:42-56`):

```tsx
<html lang={locale}>
  <GoogleTagManager gtmId='GTM-WF4PPKMZ' />          // child of <html>, before <body> (invalid DOM position; @next/third-parties injects a <Script>)
  <body className={inter.className}>
    <NextIntlClientProvider messages={messages}>     // ALL messages of the locale are shipped to the client
      <Cookies />                                    // CookiesConsent banner (+ modal)
      <HeaderSection />                              // fixed header + Navbar overlay
      {children}
      <FooterSection />
      <BookingDialog host={host} />                  // host = headers().get('host') || 'no host'
    </NextIntlClientProvider>
    <SpeedInsights />
    <Analytics />
  </body>
</html>
```

- `params.locale` is used for `lang`; messages from `getMessages()`; `headers()` call forces dynamic rendering site-wide.
- **Fonts**: `Inter({ subsets: ['latin'] })` from `next/font/google` (`:12`) applied as `body` class → Cyrillic glyphs (RU pages) fall back to the system font (latin subset only). Serif `TARegressoPROEasyRegular` declared by `@font-face` in `globals.css:257-264` (`/fonts/TARegressoPROEasyRegular/font.woff2` then `.woff`, weight normal) and used through Tailwind `font-serif` (all `h1–h4`). Tailwind `font-sans` token is `'Inter','sans-serif'` — a local family name, not the next/font family (`EmptyLegCard` Counter uses `font-sans`; which face renders there is **UNVERIFIED**).
- GTM id `GTM-WF4PPKMZ` is hard-coded; GTM loads regardless of cookie consent.

### 3.2 HeaderSection (`src/components/sections/header.tsx`)

Client component. State: `isMenuOpen`, `isScrolled` (scrollY > 50), `showHeader` (true at top / scrolling up; false scrolling down), `lastScrollY`. On pathname change: `document.body.style.overflow='auto'`, menu closed (`:20-23`). Toggling the menu sets body overflow `hidden`/`auto` (`:25-28`).

```html
<section class="fixed left-0 right-0 top-0 z-50 transition-all duration-700
   {isScrolled ? 'bg-gray-100 bg-opacity-20 backdrop-blur-xl' : 'bg-transparent'}
   {showHeader || isMenuOpen ? 'translate-y-0' : '-translate-y-full'}">
  <div class="container !my-8">
    <header class="flex flex-row justify-between">
      <button class="{isMenuOpen ? 'p-2' : 'bg-transparent p-2 text-gray-900'}" aria-label="Open/Close menu button">
        <Close class="h-8 animate-in spin-in" onClick/> | <BurgerMenu class="h-8 animate-in spin-in" onClick/>
      </button>
      <Link href="/{locale}/" aria-label="Logotype, leads to home page"><Logo class="h-8 text-gray-900"/></Link>
    </header>
  </div>
</section>
{isMenuOpen && <Navbar/>}
```

When open, the button keeps the global button style (`rounded-full bg-gray-900 text-gray-100` → white pill) around the dark Close icon; when closed it is transparent with a white burger. Icons: `burger-menu.svg`, `close.svg`, `logo.svg` (all `currentColor`).

### 3.3 Navbar (`src/components/sections/navbar.tsx`)

No directive, but bundled as a client component because the client `HeaderSection` imports it; rendered only while the menu is open. Root: `<section class="fixed inset-0 bottom-0 z-40 flex-col overflow-y-auto bg-gray-100 bg-opacity-80 backdrop-blur-xl duration-200 animate-in fade-in lg:bottom-auto">`, `<nav class="container !m-0 flex h-full !flex-row content-stretch pb-10 pt-36">`. Two halves, each `w-full`:

| Column                                                                                                                               | Links (in order)                                                                               | href                                                                                                  | i18n key                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Left half, group A (`w-full flex-col justify-between lg:flex-row` → first child `[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in`) | Home                                                                                           | `/` (unprefixed, `legacyBehavior passHref`)                                                           | `navigation.home`                                                                                     |
|                                                                                                                                      | Partners                                                                                       | `/${locale}/partners`                                                                                 | `navigation.partners`                                                                                 |
|                                                                                                                                      | Personal assistants                                                                            | `/${locale}/business_agents`                                                                          | `navigation.business-agents`                                                                          |
|                                                                                                                                      | Medical aviation                                                                               | `/${locale}/medical_aviation`                                                                         | `navigation.medical-aviation`                                                                         |
|                                                                                                                                      | Empty legs                                                                                     | `/${locale}/empty_legs`                                                                               | `navigation.empty-legs`                                                                               |
|                                                                                                                                      | Cargo charter                                                                                  | `/${locale}/cargo_charter`                                                                            | `navigation.cargo-charter`                                                                            |
|                                                                                                                                      | Booking button (desktop only: `hidden self-start lg:block`, `<button class="mt-4">`)           | `?showBooking=Header` (`scroll={false}`)                                                              | `footer.button`                                                                                       |
| Left half, group B                                                                                                                   | Telegram / WhatsApp / Instagram, each `flex items-center` + `<ArrowTopRight class="size-10"/>` | `https://t.me/melentev1`, `https://wa.me/971504589926`, `https://www.instagram.com/atmjet/`           | `social-media.telegram`, `.whats-app`, `.instagram`                                                   |
|                                                                                                                                      | Booking button (mobile only: `flex self-start lg:hidden`)                                      | `?showBooking=Header`                                                                                 | `footer.button`                                                                                       |
| Right half (`w-full flex-col justify-between`), group C (`text-right` links)                                                         | ATM JET group / Aircraft / Group charters / Aircraft Sales / Yachts Sales / Yachts Charter     | `/${locale}/atm_jet_group`, `/aircraft`, `/group_charters`, `/sales_dept`, `/sales_yachts`, `/yachts` | `navigation.atm-jet-group`, `.aircraft`, `.group-charters`, `.sales-dept`, `.sales-yachts`, `.yachts` |
| Right half bottom                                                                                                                    | `<div class="flex-row justify-end gap-4 [&>*]:text-right"><LocaleSwitch/></div>`               |                                                                                                       |                                                                                                       |

`duration-600` is **not** a Tailwind default duration (75/100/150/200/300/500/700/1000) → generates no CSS; the per-link `animate-in fade-in` therefore runs at tailwindcss-animate's default 150 ms. Links inherit `a { py-2 }` from globals.

### 3.4 FooterSection (`src/components/sections/footer.tsx`)

```html
<section class="overflow-hidden bg-cover bg-top bg-no-repeat md:bg-fixed">
  <Image src="/images/home_page/footer.jpg" fill loading="lazy" class="-z-50 object-cover object-center" alt="Footer background image of a plane cabin with a view of two seats"/>
  <footer class="container !static !mb-0 !mt-24 gap-8 rounded-t-2xl bg-gray-100 bg-opacity-60 py-10 backdrop-blur-lg">
    <div class="flex-row content-between justify-between"><Logo class="h-8 text-gray-900"/><div class="flex-row gap-4"><LocaleSwitch/></div></div>
    <div class="w-full flex-row justify-between">
      <div class="[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in">  Home(/{locale}/), Partners, Personal assistants, Medical aviation, Empty legs, Cargo charter </div>
      <div class="[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in">  Telegram, WhatsApp, Instagram (each + ArrowTopRight size-10) </div>
    </div>
    <div class="w-full flex-row justify-between">
      <div class="[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in">  Aircraft Sales(/sales_dept), Yachts Sales(/sales_yachts), Group charters, ATM JET group, Aircraft, Yachts Charter(/yachts) </div>
    </div>
    <Link href="?showBooking=Footer" class="md:self-start" scroll={false}><button>{footer.button}</button></Link>
    <div class="items-center gap-2 pr-24 md:pr-0"><p>{footer.location}</p><p>{footer.copyright, {year: new Date().getFullYear()}}</p></div>
  </footer>
</section>
```

All footer page links are `/${locale}/...` prefixed. `footer.location` = `Dubai +971 (50) 458-99-26` / `Дубай +971 (50) 458-99-26`; `footer.copyright` = `©ATM JET, 2004-{year}. All rights reserved` / `... Все права защищены`. `footer.jpg` is the 1.5 MB JPEG although `footer.webp` (92 KB) exists (§12).

### 3.5 AngleBar + MenuBar (`src/components/sections/angle_bar.tsx`) — home page only

Rendered only by `src/app/[locale]/page.tsx:86`. Client component.

```html
<section class="pointer-events-none fixed right-0 bottom-0 left-0 z-30 bg-blend-difference">
  <div class="container items-end">
    <!-- .container adds my-10 → FAB floats 40px above the bottom -->
    <div
      class="{open ? 'bg-gray-800' : 'bg-gray-150 bg-opacity-10'} relative z-40 rounded-full p-4 bg-blend-difference backdrop-blur-2xl"
    >
      open →
      <Close
        class="text-gray-150 animate-in spin-in pointer-events-auto z-10 size-9 cursor-pointer bg-blend-difference"
      />
      closed→
      <Plane
        class="animate-in spin-in pointer-events-auto z-10 size-9 cursor-pointer bg-blend-difference"
      />
    </div>
    {open && <MenuBar />}
  </div>
</section>
```

`MenuBar` (`:42-74`): `<div class="pointer-events-auto absolute bottom-0 right-10 -mb-1.5 -mr-1.5 flex-row rounded-2xl bg-gray-900 px-7 py-5 text-gray-150 lg:right-16">` with column 1 (`[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in`): Telegram / WhatsApp / Instagram links (`flex items-center`, `ArrowTopRight class="size-10 text-gray-500"`), **RU only** `<Link href='/citizens' class="pt-10">{navigation.citizens}</Link>` (`locale == 'ru'`, `:60-64`; label `Для граждан РФ`), booking `<Link href='?showBooking=Angle_bar' class="mr-16 mt-4 self-start"><button class="bg-gray-150 text-gray-900">{footer.button}</button></Link>`; column 2 `<div class="h-full items-start justify-end"><LocaleSwitch/></div>`. `plane.svg` is `currentColor` (inherits page text colour `text-gray-600`).

### 3.6 LocaleSwitch (`src/components/elements/localeSwitcher.tsx`)

Client. `basePathname = pathname.substring(pathname.indexOf('/', 1))` (strips the first segment); if the result is `/en`, `/ru` or `/uk` it becomes `/`; `url = `${basePathname}?${searchParams}`` (always appends `?`, even when empty). Renders two links:

```tsx
<Link href={`/en${url}`} locale='en' scroll={false} className={`text-base ${locale == 'en' && 'opacity-50'}`}>{t('locale.en')}</Link>   // "Eng"
<Link href={`/ru${url}`} locale='ru' scroll={false} className={`text-base ${locale == 'ru' && 'opacity-50'}`}>{t('locale.ru')}</Link>   // "Рус"
// uk link commented out (:37-44)
```

Non-active link gets the literal class `false` (harmless). Query string (incl. `showBooking`) is preserved across locale switches. Consumers: Navbar, Footer, MenuBar.

### 3.7 CookiesConsent + CookiesModal (`src/components/sections/cookies_consent.tsx`, `cookies_modal.tsx`)

- Banner shows when `!hasCookie('cookie-consent')` (evaluated in `useEffect`, so never on first server paint). Markup: `<section class="fixed inset-0 top-auto z-[900]"><div class="container !flex-row flex-wrap gap-6 rounded-2xl bg-gray-150 p-6 duration-300 animate-in fade-in slide-in-from-top-10">` → `<p>{cookies.message} <Link class="text-gray-900" href="/privacy">{cookies.privacy-policy}</Link></p>` + `<div class="flex-row flex-wrap items-center gap-2">` with buttons `middle dark w-full md:w-auto` **Customize** (opens modal), `middle dark w-full md:w-auto` **Reject all**, `middle w-full md:w-auto` **Accept all**.
- Cookies written (`cookies-next` `setCookie`, default options = **session cookie**, path `/`):

  | Action                                   | `marketing-consent` | `personal-consent` | `cookie-consent` | maxAge                                       |
  | ---------------------------------------- | ------------------- | ------------------ | ---------------- | -------------------------------------------- |
  | Banner Accept all (`:17-22`)             | `true`              | `true`             | `true`           | none (session)                               |
  | Banner Reject all (`:24-29`)             | `false`             | `false`            | `true`           | none                                         |
  | Modal Accept (`cookies_modal.tsx:24-29`) | state               | state              | `true`           | `60 * 525960` s = 31,557,600 s ≈ 365.25 days |
  | Modal Reject (`:31-36`)                  | `false`             | `false`            | `true`           | none                                         |

- **Nothing reads the consent values**: GTM, Vercel Analytics and Speed Insights load unconditionally.
- Modal: `<section class="fixed inset-0 z-[901] bg-gray-150 bg-opacity-40 backdrop-blur-sm duration-300 animate-in fade-in-0" onClick=clickOutside>` → `<div class="container relative mx-auto max-h-svh items-center overflow-auto rounded-2xl bg-gray-150 stroke-gray-800 stroke-1 !p-10 !pb-0" ref>` → `<div class="max-w-screen-md gap-8 self-center pb-10">`: `h2 {cookies.title}`, `p {cookies.description}`, `hr`, row `flex-row justify-between text-gray-900` (`cookies.necessary` / `cookies.required`), `hr`, row label `cookies.marketing-cookies` + `Checkbox id=marketing-consent`, `hr`, row `cookies.personal-cookies` + `Checkbox id=personal-consent`, `hr`; sticky footer `<div class="sticky bottom-0 left-0 right-0 w-full max-w-screen-md flex-row gap-2 bg-gray-150 pb-10 pt-4">` buttons `middle dark w-full` Reject, `middle w-full` Accept. Initial checkbox state from `getCookie(...) == 'true'`.

### 3.8 Preloader (`src/components/elements/preloader.tsx`)

Client, framer-motion. Two fixed layers:

```
layer 1 <motion.div class="fixed inset-0 z-[998] items-center justify-center bg-gray-150">
   animated: initial {opacity:1,height:'100%',display:'flex'} → animate {opacity:0,height:'0%',display:'none'}; transition {duration:0.5, delay:2}
   static  : stays {opacity:1,height:'100%',display:'flex'}
layer 2 <motion.div class="fixed inset-0 z-[999] flex items-center justify-center">  <Logo class="w-[60vw] max-w-sm text-gray-900"/>
   animated: initial {opacity:0,y:-40} → keyframes opacity [0,1,1,1,0,0], y [-40,0,0,-40,-40,-40], display ['none','flex','flex','flex','none','none']; duration 4 (≈0.8 s per segment)
   static  : opacity [1], y [0], display ['flex']
```

Used: animated on home (`page.tsx:85`), static as the home `Suspense` fallback (`page.tsx:83`) and by `loading.tsx`.

### 3.9 BookingDialog (`src/components/elements/booking_dialog.tsx`)

Client, mounted globally by the layout with `host` (request Host header).

- **Query contract**: visible iff `searchParams.has('showBooking')` (any value). The value is passed to Telegram as `Component`. `direction` (JSON array, §7.1/7.3) and `confirm=true` are read by `BookingForm`.
- Effect: when visible, `dialogRef.style.display='flex'` and `document.body.style.overflow='hidden'`; when hidden, `display='none'` (component also returns `null`).
- Close (`handleClose`, `:58-67`): `confirm = searchParams.get('confirm') === 'true'`; body overflow `auto`; `router.push(confirm ? '?confirm=true' : pathname, { scroll: false })` → **all query params are dropped**; `onClose?.()`. Click outside `contentRef` closes; Close icon closes.
- Markup: `<section class="fixed inset-0 z-50 overflow-y-auto bg-gray-150 bg-opacity-40 backdrop-blur-sm duration-300 animate-in fade-in-0">` → `<div class="container relative mx-auto rounded-2xl bg-gray-150 stroke-gray-800 stroke-1 !p-14">` → `<div class="max-w-screen-md gap-8 self-center">`: `<Close class="absolute right-12 top-12 size-10 cursor-pointer hover:opacity-80"/>`, `<BookingForm host={host} close={handleClose}/>`, socials row `<div class="[&>*]:duration-600 flex-row flex-wrap items-center justify-center gap-4 [&>*]:animate-in [&>*]:fade-in">` (Telegram/WhatsApp/Instagram, `flex items-center text-base`, `ArrowTopRight size-10`), then `<Link href='tel:+971585940112' class="!-mt-6 text-center text-base text-gray-700">{footer.phone}</Link>` — the visible number is `+971 (50) 458-99-26` while the `tel:` target is `+971585940112` (§9.4).
- `createQueryString`, `onConfirm` are unused.

### 3.10 Line separator (`src/components/animated/line.tsx`)

Client. Horizontal (default): `<motion.div initial={{width:0}} whileInView={{width:'100%'}} transition={{duration:1}} class="h-[1px] bg-gray-300 {className}"/>` (re-animates on every entry; no `once`). Vertical variant (`isVertical`) `w-[1px]` with height 0→100% is **never used**. Consumers: `aircraft/page.tsx` (×2), `aircraft_card.tsx`, `aircraft/[id]/page.tsx` (×2 + per stat), `yachts/page.tsx` (×2), `yachts/yacht_card.tsx`, `yachts/[id]/page.tsx` (×2 + per stat).

## 4. Pages

Conventions: "order" lists the rendered children of `<main>` top to bottom. All pages are dynamically rendered (layout calls `headers()`); "server (sync)" means a non-async server component using `useTranslations`. Every page inherits Header/Footer/Cookies/BookingDialog from the layout (§3).

### Route: /[locale]

- File: `src/app/[locale]/page.tsx:52-106`. Server (sync). `generateMetadata` (§2.4).
- Structure: `<Suspense fallback={<Preloader isStatic />}><main> … </main></Suspense>` — the static preloader shows until the async `EmptyLegSection` resolves, then the animated preloader plays.
- Order:
  1. `<Preloader />` (animated, §3.8)
  2. `<AngleBar />` (§3.5)
  3. `<HeroSection title={t('home-hero.title')} />` — "Flying private made simple"
  4. `<MakeBookingSection />` (no card)
  5. `<WhyUsSection title={tWhyUs('title')} cards={whyUsCards} images={whyUsImages} />` — cards from `home-why-us.card1..5.{num,title,description}`; images `/images/home_page/why_us_{years,clients,trusted_by_celeb,same_day_departure,excellence}.webp`
  6. `<EmptyLegSection />` (async, DB)
  7. `<KeyFeaturesSection title={t('key-features.title')} description={t('key-features.description')} cards images />` — cards `key-features.card1..5.{title,description}`; images `/images/home_page/key_features_{tailoredp_references,cuztomized_aircrafts,payment_after_flight,pay_anyway}.webp`, `/images/home_page/key_features_shampain.jpg`
  8. `<OptionsSection />`
  9. `<PrivilegeSection />`
  10. `<YachtsSection />` (promo, `sections/yachts.tsx`)
  11. `<TilesSection />`
  12. `<TransferSection />`
  13. `<FaqSection />`
- Data: `atmjet_admin__empty_legs` + `airports` (via EmptyLegSection).
- Bugs: see §13 (hero relative video path, bogus captions track, AngleBar `duration-600`).

### Route: /[locale]/aircraft

- File: `src/app/[locale]/aircraft/page.tsx:9-54` (server shell) + `aircraft_list.tsx` (client) + `aircraft_card.tsx` (an `async function` component rendered as JSX from the client list — an async client component, same caveat as `EmptyLegCard`, §6) + `actions.ts` (server actions). No metadata.
- Order:
  1. Hero: `<section><div class="container gap-20 pt-32"><div class="items-center gap-4"><h1 class="text-center">{aircraft-hero.title}<Counter>{aircraft-hero.num}</Counter>{aircraft-hero.title2}</h1><p class="text-center md:max-w-screen-sm">{aircraft-hero.description}</p></div></div></section>` ("We have access to over " + `50,000` + " aircraft").
  2. `<Line />`
  3. Contact card: `<section><div class="container gap-10"><div class="card relative gap-4 overflow-clip p-12 md:p-24"><h2>{aircraft-contact-us.title}</h2><p class="md:w-1/2">{…description}</p><Link href='?showBooking=Contact_us_aircraft' class="mt-4" scroll={false}><button>{…button}</button></Link>` + three `<div class="option-darkening absolute inset-0 -z-10"/>` + `<div class="absolute inset-0 -z-10 bg-gray-100 opacity-80 md:hidden"/>` + `<Image src='/images/aircraft/aircraft.png' alt='aircraft' fill class="fixed -z-20 rounded-xl object-cover"/>` (the `fixed` class overrides next/image's `position:absolute` → viewport-fixed image behind the card).
  4. `<AircraftsList />`:
     - Filter card: `<section><div class="container"><div class="flex flex-col gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 md:p-10"><h3 class="col-span-full">Filter aircraft | Фильтровать самолеты</h3><div class="grid gap-[2px] overflow-hidden rounded-2xl md:grid-cols-2 md:gap-4 md:rounded-none">` two `Select`s (`form/select.tsx`): **sort** (`defaultValue='size'`, options `size`=Size/Размер, `passangers`=Passangers/Пассажиры, `range`=Range/Дальность; label Sort by/Сортировать по) and **order** (`asc`=Ascending/Возрастанию, `desc`=Descending/Убыванию; label Order/Порядок). Commented-out `type` select and `DualRange` passengers slider (`:44-68`).
     - Grid: `<section><div class="container gap-10 md:grid md:grid-cols-2 lg:grid-cols-3">{cards}<button class="big col-span-full self-center" onClick={loadMore}>Show more | Показать еще</button></div></section>`.
     - State: `passangers=[0,400]`, `sort='size'`, `order='asc'`; effect on change → `getAircrafts(0, passangers, sort, order)` then `getAircraftCovers(ids)`; `loadMore` → `getAircrafts(aircrafts.length)` **without filter/sort/order** then appends covers.
     - `AircraftCard` (`aircraft_card.tsx:12-49`): returns `null` when `cover` is empty; otherwise `<Link href={`/aircraft/${slug}`} class="group overflow-hidden rounded-2xl border border-gray-300 bg-gray-150 p-0"><div class="relative aspect-video overflow-hidden"><Image src={cover} alt="{aircraftTypeName} {registrationNumber}" width=800 height=450 class="transition-transform duration-300 ease-out group-hover:scale-125"/><img src={cover} alt={aircraftTypeName}/></div><div class="gap-3 p-6 pb-8"><h3>{aircraftTypeName} {registrationNumber}</h3><Line/><p>{aircraftTypeAircraftClassName}</p></div></Link>` — **two images are rendered** (next/image + a raw `<img>`).
  5. `<Line />`
  6. `<NewContactUs />`
- Data/queries (`actions.ts:5-37`):

```ts
db.select().from(aircrafts)
  .where(minmax ? between(aircrafts.passengersMax, minmax[0], minmax[1]) : undefined)   // [0,400] always on first load → NULL passengers_max rows excluded
  .orderBy(sortby === 'size' ? (order==='desc' ? desc : asc)(aircrafts.aircraftTypeCabinHeight)
         : sortby === 'passengers' ? …(aircrafts.passengersMax)
         : sortby === 'range' ? …(aircrafts.aircraftTypeRangeMaximum)
         : asc(aircrafts.id))
  .offset(offset).limit(15)
```

`getAircraftCovers(ids)` (`:39-63`): `aircraft_images` where `aircraftId IN ids AND type='exterior'` ordered by `aircraftId, id`; first URL per id; `''` when none (card hidden). `getImages` (`:65-74`) is unused.

- Bugs: sort option value `passangers` never matches `'passengers'` → falls to `asc(id)`; `[0,400]` excludes null pax; load-more ignores sort/filter; hidden (cover-less) cards make batches shorter than 15; double image; links unprefixed; all UI strings hard-coded ternaries (§11.4). Listing is client-fetched after mount (empty on first paint; no loading state).

### Route: /[locale]/aircraft/[id]

- File: `src/app/[locale]/aircraft/[id]/page.tsx:50-237` (rich layout) with fallback `old.tsx:53-136` (basic layout). No metadata (the `generateMetadata` in `old.tsx` is dead).
- **Lookup / fallback / redirect logic** (quoted):

```ts
// page.tsx:51-63
const names = params.id ? params.id.split('-') : []
const registrationNumber = names[1] ? `${names[0]}-${names[1]}` : names[0]
const aircraft = await db.query.aircrafts.findFirst({
  where: ilike(aircrafts.registrationNumber, registrationNumber.toUpperCase()), // ILIKE without wildcards = case-insensitive equality
  with: { images: true },
})
if (!aircraft || aircraft.images.length === 0) {
  return VehiclePage({ params }) // old.tsx
}
// old.tsx:54-63
const names = id ? id.split('-') : []
const tailNumber = `${names[0]}-${names[1]}` // "X-undefined" when no dash
const tailModel = names.slice(2).join(' ') // unused
const [vehicle] = await db
  .select()
  .from(vehicles)
  .limit(1)
  .where(eq(vehicles.tailNumber, tailNumber.toUpperCase()))
if (!vehicle) redirect('/aircraft') // unprefixed → middleware adds locale
```

So `[id]` is expected to be `<REG>-<NUMBER>-<anything…>` (the `aircrafts.slug` produced by the listing card); the first two dash-separated segments are the registration/tail number. Whether real `aircrafts.slug` values follow this shape is data-dependent (**UNVERIFIED**).

- **Rich layout** order:
  1. `<section class="md:pb-24">`: hero band `<div class="relative left-0 top-0 -z-[1] mb-[-80px] h-[40vh] w-full overflow-hidden bg-cover bg-center">` with overlays `absolute inset-0 z-10 bg-gradient-to-b from-gray-100 to-transparent` and `… bg-gradient-to-t …`, `<Image src={images[0].url} fill class="object-cover object-center"/>`; then `<div class="container !gap-10 lg:grid lg:grid-cols-2">` → `<Gallery images={urls} alt selected={images.length > 1 ? 1 : 0}/>` and the request card `<div class="gap-8 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 md:p-10"><h1>{aircraftTypeName} {registrationNumber}</h1><form class="flex flex-col gap-8" action={formAction}><div class="flex flex-col gap-[2px] rounded-2xl"><Autocomplete id='from' label=Откуда|From class="overflow-hidden rounded-t-2xl"/><Autocomplete id='to' label=Куда|To/><Input id='date' label=Дата|Date type='date' class="overflow-hidden rounded-b-2xl"/></div><button class="px-8 py-6">Request {registrationNumber}</button></form></div>`.
  2. `<Line />`
  3. `<section><div class="container gap-12">`:
     - Row 1 `<div class="gap-10 md:grid md:grid-cols-2">`: `extensionView360 ? <iframe src allowFullScreen allow='autoplay; fullscreen; web-share; xr-spatial-tracking;' class="h-full min-h-80 w-full overflow-hidden rounded-3xl border border-gray-300"/> : <Image width=600 height=600 src={images[1]?.url || images[0]?.url} class="rounded-3xl border-gray-400"/>`; description card `<div class="top-[20vh] gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 pb-16 md:sticky md:gap-10 md:self-start md:p-10"><h2>{type} {reg}</h2><p>{t('vehicle.description', {tailModel: aircraftTypeName, tailNumber: registrationNumber, tailOperator: companyName, tailYear: yearOfProduction, tailHomebase: airportIcao, tailMaxpax: passengersMax}).split('\\n') → <span/>+<br/>+<br/>}</p></div>`.
     - Row 2 `<div class="gap-10 md:grid md:grid-cols-2">`: key-stats card `<div class="top-[20vh] gap-10 rounded-3xl border border-gray-300 bg-gray-150 px-6 py-10 md:sticky md:self-start md:px-10 md:py-12 md:pb-14"><h2>Key stats | Основые факты</h2><div class="gap-6 sm:grid sm:grid-cols-2 md:gap-8">` each shown stat `<div class="flex-row items-center gap-4">{icon}<div><h3>{value}</h3><p>{label}</p></div></div>` followed (except last index) by `<Line class="col-span-full {index%2===0 && 'md:hidden'}"/>`; images column `<div class="gap-10">{images.reverse().map(<Image src class="rounded-3xl border border-gray-300 bg-gray-150" width=600 height=400/>)}</div>` (`reverse()` mutates the array in place after the earlier reads).
     - Stats (`:69-106`, icon class `size-10 color-gray text-gray-300 shrink-0`): max pax (`passengersMax`, Guests icon), type (`aircraftTypeAircraftClassName`, Refit/tools icon), cabin height `${aircraftTypeCabinHeight||0}m` (Length icon), `lenght/width` `${cabinLength||0}m/${cabinWidth||0}m` (Length icon), year (`yearOfProduction`, tools icon), range `${(aircraftTypeRangeMaximum||0).toLocaleString()}km` (tools icon); each only if truthy. Labels: en/ru object `statsLabel` (`:23-48`).
  4. `<Line />`
  5. `<NewContactUs />`
- Server action `formAction` (`:239-249`): reads `from`, `to`, `date` from FormData, reads `x-forwarded-for` (unused), then `redirect(`?showBooking=Yachts&direction=[${encodeURIComponent(JSON.stringify(direction))}]`)` — **`showBooking=Yachts` copy-paste bug** (Telegram `Component` says Yachts), value percent-encoded inside literal brackets.
- **Basic (old.tsx) layout** order:
  1. `<section class="h-[80svh] bg-cover bg-center bg-no-repeat bg-origin-content pb-96 md:bg-fixed" style="background-image:url(http://{vehicle.image})"><div class="hero-darkening absolute inset-0 z-10"/></section>` (plain `http://`).
  2. `<section><div class="container gap-4"><h1>{tailModel}</h1><p>{vehicle.description with tailModel,tailNumber,tailOperator,tailVendor(vendor),tailYear,tailHomebase,tailMaxpax; split '\\n' → span + single br}</p></div></section>`
  3. `<MakeBookingSection />`
  4. `<section><div class="container md:flex-row"><div class="card w-full bg-gray-150 p-8 md:p-10">` 10 `ContextLine`s (`<div class="h-10 flex-row items-center justify-between border-b border-gray-300"><p class="w-full">{label}</p><p class="w-full">{value}</p></div>`) — labels `vehicle.tail-number, tail-operator, tail-year, tail-maxpax, tail-homebase, tail-homebase-city, tail-homebase-country, tail-manufacturer, tail-interiorrefit, tail-exteriorrefit`; values `tailNumber, tailOperator, tailYear, tailMaxpax, tailHomebase, tailHomebase_city, tailHomebase_country, tailManufacturer, tailInteriorrefit, tailExteriorrefit`.
  5. `<NewContactUs />`
- Data: `aircrafts` + `aircraft_images` (relation `images`, all types, DB order); fallback `vehicles` by `tail_number`.

### Route: /[locale]/atm_jet_group

- File: `src/app/[locale]/atm_jet_group/page.tsx:5-44`. Server (sync). No metadata.
- Order: (1) hero `<section><div class="container items-center gap-4 pt-32"><p class="rounded-full border border-gray-300 px-4 py-1 text-sm">{atm-jet-hero.chip}</p><h1 class="pt-2 text-center">{atm-jet-hero.title}</h1><p class="max-w-screen-sm pt-8 text-center">{atm-jet-hero.description}</p></div></section>`; (2) `<section><div class="container"><div class="overflow-hidden rounded-2xl"><GroupCard group1 imageSrc='/images/atm_jet_group/group1.webp' href='/aircraft'/><hr/><GroupCard group2 imageSrc='/images/atm_jet_group/group2.webp' href='/sales_dept'/></div></div></section>` (keys `group1|group2.{title,description,button}`); (3) `<YachtsSection />`; (4) `<PrivilegeSection />`.
- Bug: GroupCard hrefs become `/{locale}//aircraft`, `/{locale}//sales_dept`.

### Route: /[locale]/business_agents

- File: `src/app/[locale]/business_agents/page.tsx:7-87`. Server (sync). No metadata.
- Order: (1) hero `<section><div class="container gap-20 pt-32"><h1 class="text-center">{business-agents-hero.title}</h1><div class="gap-10 lg:flex-row"><div class="w-full gap-6"><h2>{guide.title}</h2><div class="flex-row gap-4"><Diamond class="h-11 w-11 shrink-0 md:h-11 md:w-11"/><p>{guide.description}</p></div><hr/><div class="flex-row gap-4"><Diamond …/><p>{guide.description2}</p></div></div><Image src='/images/business_agencies/hero2.webp' class="h-80 w-full rounded-2xl object-cover object-center" loading='lazy' width=2240 height=1280/></div></div></section>`; (2) `<WhyUsSection title={home-why-us.title} cards={home-why-us.card1..5} images={home why-us images}/>`; (3) `<section><div class="container gap-6 md:flex-row"><FileCard documents.document1 imageUrl='/images/business_agencies/file1.webp' url={checklistUrl}/><FileCard documents.document2 imageUrl='/images/business_agencies/file2.webp' url={presentationUrl}/></div></section>`; (4) `<TransferSection />`; (5) `<BestPriceSection />`.
- PDF URLs (`:27-35`), by locale (`en` vs anything else):
  - checklist EN `https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20EN.pdf`, RU `…executive%20RU.pdf` (note the double `%20%20`).
  - presentation EN `https://atmjet.ams3.cdn.digitaloceanspaces.com/presentation/ATM%20JET%20Presentation.pdf`, RU `…/ATM%20JET%20Presentation%20RU.pdf`.

### Route: /[locale]/cargo_charter

- File: `src/app/[locale]/cargo_charter/page.tsx:5-37`. Server (sync). No metadata.
- Order: (1) `<SubpageHeroSection title={cargo-hero.title} description={cargo-hero.description} imageUrl='/images/cargo_charter/hero.webp'/>`; (2) `<WhyUsSection title={cargo-why-us.title} cards={cargo-why-us.card1..4 (num '')} images={/images/cargo_charter/why_us_{global,personalized,security,guarantees}.webp}/>`; (3) `<NewContactUs />`. Commented: `<CargoRequestSection/>`, `<ContactUsSection … imageSrc='/images/cargo_charter/contact_us.webp'/>`.

### Route: /[locale]/citizens

- File: `src/app/[locale]/citizens/page.tsx:8-85`. Server (sync). No metadata. **`if (locale !== 'ru') redirect('/')`** (`:26-28`, evaluated after hooks) → EN users land on `/` → middleware → `/en`.
- Order: (1) `<SubpageHeroSection title={citizens-hero.title} description='' imageUrl='/images/citizens/hero.webp'/>`; (2) `<section><div class="container py-12"><div class="card items-center gap-8 p-12 md:flex-row md:gap-12"><Logo classname='h-12'/><div class="h-[1px] w-full shrink-0 bg-gray-400 md:h-40 md:w-[1px]"/><p>{citizens-hero.description}</p></div></div></section>` — **`classname` (lowercase) typo**: the prop is not applied; the SVG (viewBox 0 0 326 64, no width/height) renders at its CSS-default size (**UNVERIFIED** exact rendered size; must be captured in the visual baseline); (3) Forbes quote card `<section><div class="container"><div class="card gap-8 bg-gray-150 p-8 md:gap-10 md:p-10"><ForbesLogo class="-mb-6 h-14"/><h2 class="rounded-r-2xl border-l-2 border-gray-500 bg-gray-200 px-8 py-4 text-3xl md:px-10">{quote.quote}</h2><p class="border-y border-gray-400 bg-gold bg-clip-text px-10 py-4 text-center text-transparent md:px-16">{quote.description}</p></div></div></section>` (commented `?showBooking=Citizens` button); (4) founder quote card, same markup with `<Logo class="-mb-6 h-14"/>` and **inline RU text** (`:67-72`): h2 `С 2004 года наша миссия в ATM JET — обеспечивать клиентам возможность летать без ограничений по всему миру несмотря на санкции и ограничения. Мы преодолеваем любые границы, чтобы наши клиенты могли наслаждаться лучшим сервисом в каждом полете`, p `Артем Румянцев - основатель ATM JET`; (5) `<MakeBookingSection isCard />`; (6) `<WhyUsSection title={citizens-why-us.title} cards={card1..5 with num '' title '' description=citizens-why-us.cardN.title} images={/images/citizens/why_us_{sanctions,techstops,foreignaircrafts,coordination,anypayment}.webp}/>` — `why_us_foreignaircrafts.webp` **does not exist** (file is `why_us_foreignaircraft.webp`) → broken image on card 3; (7) `<NewContactUs />`.

### Route: /[locale]/empty_legs

- File: `src/app/[locale]/empty_legs/page.tsx:7-48`. Server (sync) + async section. No metadata.
- Order: (1) `<section><div class="container gap-16 pb-24 pt-32"><h1 class="text-center"><Counter class="bg-gold bg-clip-text pb-2 text-7xl text-transparent">{empty-leg-hero.num}</Counter><br/>{empty-leg-hero.title}</h1><div class="card items-center gap-4 overflow-hidden lg:flex-row"><div class="w-full"><Image src='/images/empty_legs/hero.png' class="w-full" width=1920 height=1080/></div><div class="w-full gap-8 p-8"><h2>{empty-leg-hero.subtitle}</h2><p>{empty-leg-hero.description}</p></div></div></div></section>` (`num` = `75%`); (2) `<section><div class="container gap-4 pb-24"><h2>{empty-leg-descriptor.title}</h2><p>{empty-leg-descriptor.description}</p></div></section>`; (3) `<EmptyLegSection />`; (4) `<NewContactUs />`.

### Route: /[locale]/group_charters

- File: `src/app/[locale]/group_charters/page.tsx:6-44`. Server (sync). No metadata.
- Order: (1) `<SubpageHeroSection title={group-charters-hero.title} description={…description} imageUrl='/images/group_charter/hero.webp'/>`; (2) `<MakeBookingSection />`; (3) `<section><div class="container">` three `<WhyUsCard num='' title description topPadding={(i+1)*32} imageSrc/>` **directly in the container** (no sticky column, no `overflow-clip rounded-2xl` wrapper) with images `/images/business_agencies/hero.webp`, `/images/group_charter/card2.webp` (4.2 MB), `/images/group_charter/hero.webp`; keys `group-charters-cards.card1..3.{title,description}`; (4) `<NewContactUs />`.

### Route: /[locale]/medical_aviation

- File: `src/app/[locale]/medical_aviation/page.tsx:5-34`. Server (sync). No metadata.
- Order: (1) `<SubpageHeroSection title={medical-hero.title} description={medical-hero.description} imageUrl='/images/medical/hero.webp'/>`; (2) `<KeyFeaturesSection title={medical-key-features.title} description={…description} cards={card1..4} images={/images/medical/slide1.webp, slide4.webp, slide2.webp, slide3.webp}/>` (image order 1,4,2,3); (3) `<NewContactUs />`.

### Route: /[locale]/partners

- File: `src/app/[locale]/partners/page.tsx:7-80`. Server (sync). No metadata.
- Order: (1) hero `<section><div class="container gap-20 pt-32"><div class="gap-10"><h1 class="text-pretty text-center">{partners-hero.title}<Counter class="inline-block min-w-16 bg-gold bg-clip-text text-transparent">{partners-hero.num}</Counter>{partners-hero.title2}</h1><p class="text-pretty text-center">{partners-hero.description}</p></div><Image src='/images/partners/hero.webp' class="h-64 rounded-2xl object-cover object-center" loading='lazy' width=1200 height=260/></div></section>` (commented `instant-payment` card `:58-61`); (2) `<WhyUsSection title={'Clients benefit' | 'Клиенты выбирают нас'} description='' cards={home-why-us.card1..5} images={home why-us images}/>`; (3) `<WhyUsSection title={we-offer.subtitle} description={we-offer.description} cards={we-offer.card1..4 (num '')} images={/images/partners/white-label.webp, /images/business_agencies/insurance2.webp, /images/partners/label.webp, /images/partners/payment.jpg}/>`; (4) `<PersonalManagerSection />`; (5) `<NewContactUs />`.

### Route: /[locale]/sales_dept

- File: `src/app/[locale]/sales_dept/page.tsx:14-95`. Async server (DB). No metadata.
- Query (`:27-37`): `db.select().from(vehicles).orderBy(sql`CASE WHEN ${vehicles.tailYear} = '' THEN NULL ELSE CAST(${vehicles.tailYear} AS INT) END DESC NULLS LAST`).limit(15).catch(() => [])` (no `source`/type filter — `vehicles` also holds yacht rows, §8.4).
- Order: (1) `<HeroSalesSection />`; (2) `<PersonalManagerSection />`; (3) if rows: `<section><div class="container"><div class="card gap-8 rounded-2xl bg-gray-150 p-8 !pr-0 md:gap-10 md:p-10"><h2>{aircraft.title}</h2><VehiclesCarousel vehicles={rows}/></div></div></section>`; (4) `<OptionsSelectionSection title={sales-options.title} card1={{title,description,list: t('sales-options.card1.list').split(' \\n'), imageSrc:'/images/jets_dep/jetsmarket_page_aircrafts_services_legaldpt.webp'}} card2={{…card2…, '/images/jets_dep/jetsmarket_page_aircrafts_services_financedpt.webp'}}/>`; (5) `<AdvantagesSection title={aircraft-descriptor.title} cards={card1..3} imageSrc='/images/jets_dep/jetsmarket_page_team_atmjet.webp'/>`; (6) `<WhyUsSection title='ATM JET' description={sales-why-us.title} cards={sales-why-us.card1..3 {num,title,description}} images={/images/jets_dep/jetsmarket_page_specialmanagement_{50flights,experience,yields}.webp}/>`; (7) `<NewContactUs />`.

### Route: /[locale]/sales_yachts

- File: `src/app/[locale]/sales_yachts/page.tsx:14-107`. Async server (DB). No metadata.
- Query (`:17-21`): `db.select().from(yachts).catch(() => [])` (legacy `yachts` table, no order/limit).
- Order: (1) `<HeroYachtsSection />` (all defaults from `yachts-hero`, button shown → `?showBooking=Hero_yachts`); (2) `<KeyFeaturesSection title={carousel.title} description={carousel.description} cards={carousel.card1..4} images={/images/yachts/yacht_page_over20years_{management,plan,database,luxury}.webp}/>`; (3) gold-border descriptor `<section><div class="container"><div class="rounded-xl bg-gold p-0.5"><div class="rounded-xl bg-gray-150 p-10"><h2 class="text-center">{yachts-descriptor.title}</h2></div></div></div></section>`; (4) recent yachts `<section><div class="container"><div class="card gap-8 rounded-2xl bg-gray-150 p-8 md:gap-10 md:p-10"><h2>{recent-yachts.title}</h2><YachtCarousel vehicles={yachts}/></div></div></section>`; (5) `<WeInspectSection />`; (6) `<OptionsSelectionSection title={yachts-options.title} card1={{…, list: split(' \\n'), '/images/yachts/yacht_page_yachtservices_legal.webp'}} card2={{…, '/images/yachts/yacht_page_yachtservices_finance.webp'}}/>`; (7) "20 years" section `<section><div class="container"><h2 class="mx-auto max-w-xl text-center">{yachts-why-us.title}</h2><p class="mx-auto max-w-xl py-4 text-center">{yachts-why-us.description}</p><Image src='/images/yachts/yacht_page_over20years_l.webp' height=1920 width=1080 alt='Image of a yacht' class="my-10 w-full rounded-xl object-cover object-center" loading='lazy'/></div></section>`; (8) `<WhyUsSection title={yachts-why-us.title} cards={yachts-why-us.card1..4 (num '')} images={same four over20years images}/>`; (9) `<NewContactUs />`.

### Route: /[locale]/yachts

- Files: `src/app/[locale]/yachts/page.tsx:9-88` (async server), `filter_section.tsx` (client), `YachtsSection.tsx` (client), `yacht_card.tsx` (card). No metadata.
- Query (`:13-18`): `db.select().from(newYachts).orderBy(newYachts.id).catch(() => [])`.
- Derived ranges (`:20-67`, all **dead** since `DualRange` is commented out, but still executed): `findMinPrice/MaxPrice` (round to 10 of min/max `customerPrice`), `findMinLenght` (round to 10), `findMaxLenght` (raw max), `findMinGuests` (round to 5), `findMaxGuests` (round to 10) — each does `.filter(...).sort(...)[0].field` → **`TypeError` when no yacht has the field** (empty table crashes the page).
- Order: (1) `<HeroYachtsSection title={yachts-charter-hero.title} description={…description} description2={…description2} isButtonHidden/>` (overline falls back to `yachts-hero.overline`); (2) `<FilterSection price={{min,max,step:250}} lenght={{min,max,step:10}} guests={{min,max,step:1}}/>`; (3) `<Line/>`; (4) `<YachtsSection yachts={yachts}/>`; (5) `<Line/>`; (6) `<NewContactUs/>`.
- **FilterSection** (`filter_section.tsx:14-175`): `<section><div class="container"><form class="flex flex-col gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 md:p-10" onSubmit><h3 class="col-span-full">Filter yachts | Фильтровать яхты</h3><div class="grid gap-[2px] overflow-hidden rounded-2xl md:grid-cols-3 md:gap-4 md:rounded-none">` five local `Select`s:

  | name/id      | label (en/ru)            | options `value` → label en / ru                                                                                                                                                         | default             |
  | ------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
  | `guests`     | Guests / Гости           | `15` To 15 guests / До 15 гостей; `30` From 15 to 30 guests / От 15 до 30 гостей; `60` From 30 to 60 guests / От 30 до 60 гостей; `60+` More than 60 / Более 60 гостей; `All` All / Все | `All`               |
  | `price`      | Price / Цена             | `1200` To 1200 AED / До 1200 AED; `3500` To 3500 AED / До 3500 AED; `Lux` Lux / Люкс; `All` All / Все                                                                                   | `All`               |
  | **`lenght`** | Length ft / Длина футы   | `All` All / Все; `20` To 20 ft / До 20 фт; `40` From 20 to 40 ft / От 20 до 40 фт; `60` From 40 to 60 ft / От 40 до 60 фт                                                               | `All`               |
  | `sort`       | Sort by / Сортировать по | `price` Price / Цена; `length` Length / Длина; `guests` Guests / Гости                                                                                                                  | `searchParams.sort  |     | 'price'` |
  | `order`      | Order / Порядок          | `asc` Ascending / Возрастанию; `desc` Descending / Убыванию                                                                                                                             | `searchParams.order |     | 'asc'`   |

  Submit button `<button type='submit' class="big !px-24 md:self-end">Apply | Применить</button>`. `handleSubmit` (`:49-66`): `console.log(JSON.stringify(entries))`; builds `{ guests, price, length: formData.get('lenght'), sort, order, yearBuilt: formData.get('year-built') /* always null */ }`, sets only truthy values, `router.push('?' + params, { scroll: false })`. Guests/price/length selects are **not** re-initialised from the URL (always reset to `All` after navigation). The `useState` for `length/price/guests` and the `Range` component (`:199-247`) are unused. Local `Select`: `<div class="relative w-full overflow-hidden bg-gray-900 text-gray-100 md:rounded-md"><label class="absolute left-7 top-4 text-xs font-semibold text-gray-500"/><select class="w-full appearance-none rounded-none border-none bg-gray-900 pb-4 pl-6 pt-9 outline-none focus:outline-none focus:ring-0 {className}" name={id||name}/></div>`.

- **YachtsSection** filter/sort semantics (`YachtsSection.tsx:13-99`, quoted):

```ts
let price = [0, 10000000], length = [0, 10000000], guests = [0, 10000000]
switch (searchParams.get('price')) { case '1200': price=[0,1200]; break; case '3500': price=[0,3500]; break; case 'Lux': price=[3500,10000000]; break; case 'All': price=[0,10000000]; break; default: break }
switch (searchParams.get('length')) { case 'all': length=[0,10000000]; break; case '20': length=[0,20]; break; case '40': length=[20,40]; break; case '60': length=[40,60]; break }   // form sends 'All' (capital) → no case → default range
switch (searchParams.get('guests')) { case '15': guests=[0,15]; break; case '30': guests=[15,30]; break; case '60': guests=[30,60]; break
  case '60+': guests = [60, 10000000]          // NO break → falls through
  case 'All': guests = [0, 10000000]; break }  // so "More than 60" == All
const sortedYachts = yachts.filter(y => (Number(y.guestsDay)||0) within guests && (Number(y.length)||0) within length && (Number(y.customerPrice)||0) within price)
switch (sortBy) { case 'price': sort by Number(customerPrice); case 'length': by Number(length); case 'guests': by Number(guestsDay) }   // ascending
if (order === 'desc') sortedYachts.reverse()
```

Markup: `<section class="gap-10 md:py-16 md:pb-24"><div class="container gap-10 md:grid md:grid-cols-2"><h2 class="col-span-full self-center md:text-center">Yachts available for rent in Dubai | Яхты доступные в аренду в Дубае</h2>{cards | empty}</div></section>`; empty state `<div class="col-span-full items-center gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 md:p-10"><h3>No yachts found</h3><Link href='/yachts'><button class="btn btn-primary">Reset filters</button></Link></div>` (English only; `btn btn-primary` are undefined classes). A second local `Select` copy exists in this file (`:124-140`, unused).

- **YachtCard** (`yacht_card.tsx:13-100`): `<Link href={slug || '/yachts'} class="group overflow-hidden rounded-2xl border border-gray-300 bg-gray-150 p-0"><div class="relative aspect-video overflow-hidden">{photos?.[0] && <Image src={photos[0]} width=800 height=450 class="transition-transform duration-300 ease-out group-hover:scale-125"/>}</div><div class="gap-3 p-6 pb-8"><h3>{manufacturer} {name ? `"${name}"` : ''}</h3><span class="self-start rounded-md bg-gold px-2 py-0.5 font-bold text-gray-150">{customerPrice} {currency} / per hour|за час</span><Line/><div class="grid grid-cols-2 gap-2 lg:grid-cols-3">` six stats `<div class="flex-row items-center gap-2 {i>3 && 'hidden lg:flex'}">{icon w-6 h-6 text-gray-300 mr-2}<span>{stat[locale]}</span></div>`: `${guestsDay} guests|гостей`, `${length}ft / ${Math.round(length*0.3048)}m` (`фт`/`м`), `${cabins} cabins|каюты`, `min ${minHours} hours`/`мин ${pluralizeHours}` (RU plural: `час`/`часа`/`часов`, `:102-113`), `${bathrooms} bathrooms|ванные`, `${refit} refit|ремонт`. Icons: guests, length, cabins, clock, bathrooms, tools.

### Route: /[locale]/yachts/[id]

- File: `src/app/[locale]/yachts/[id]/page.tsx:69-253`. Async server + server action. No metadata.
- Lookup (`:72-78`): `db.select().from(newYachts).limit(1).where(or(ilike(newYachts.slug, `%${id}%`)))` — **substring** match, no ordering (first row in physical order); `if (!yacht || !yacht.photos) return redirect('/yachts')`.
- Description (`:79-82`): `(locale === 'en' ? descriptionEn : descriptionRu)?.split('.').slice(0, -1).map(s => s.trim() + '.')` — each sentence becomes a paragraph; the text after the last `.` is dropped.
- Order:
  1. `<section class="md:pb-24">`: if `photos[0]`: hero band `<div class="relative left-0 top-0 -z-[1] mb-[-80px] h-[40vh] w-full overflow-hidden bg-cover bg-fixed bg-center" style="background-image:url(\"{photos[0]}\")">` + the two gradient overlays; `<div class="container !gap-10 lg:grid lg:grid-cols-2">`: `<Gallery images={photos} alt="{manufacturer} {name}" selected={1}/>` (**crashes with a single photo**: `images[1]` undefined → `<Image src={undefined}>`), request card `<div class="gap-8 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 md:p-10"><h1>{manufacturer} "{name}"</h1><form class="flex flex-col gap-8" action={formAction}><div class="flex flex-col gap-[2px] overflow-hidden rounded-2xl"><Input name='from' class="cursor-not-allowed bg-gray-800 text-gray-500" label=From|Откуда disabled value={location}/><Input name='date' type='date' label=Date|Дата/><div class="gap-[2px] md:flex-row"><Input name='hours' type='number' label=Hours|Часы min={minHours||1} defaultValue={minHours||1}/><Input name='guests' type='number' label=Guests|Гости min=1 max={guestsDay||10} defaultValue={minHours||1}/></div></div><div class="grid items-center gap-4 md:grid-cols-2"><button class="self-start px-8 py-6">Request {name}</button><p>{(customerPrice || 1000).toLocaleString()} {currency}/Hour|Час</p></div></form></div>` (guests `defaultValue` uses `minHours` — copy-paste; `customerPrice` is a numeric **string**, so `toLocaleString` adds no separators). Local `Input` (`:259-268`): `<div class="relative w-full bg-gray-900 text-gray-100"><label class="absolute left-7 top-4 text-xs font-semibold text-gray-500"/><input class="px-7 pb-4 pt-9 {className}" name={id||name}/></div>`.
  2. `<Line/>`
  3. `<section class="md:py-16 md:pb-24"><div class="container gap-12">`: row 1 `<div class="gap-10 md:grid md:grid-cols-2"><div class="overflow-clip"><Image src={photos[photos.length-1]} class="sticky top-[20vh] rounded-3xl border border-gray-300 bg-gray-150" width=600 height=400/></div>` + key-stats card (same classes as aircraft) with 6 stats (each followed by `<Line class="col-span-full {index%2===0 && 'md:hidden'}"/>`, **including after the last**) — `pax day/night` `${guestsDay} / ${guestsNight}`, `lenght ft/m` `${length} / ${Math.round(length*0.3048)}`, `cabins`, `bathrooms`, `min rental hours` `${minHours} hours` (English unit in RU), `refit`; then `<div class="col-span-full"><p>Included in the price: | Включено в стоимость:</p><h3>{locale==='ru' ? includedRu : includedEn}</h3></div>`; icons guests, length, cabins, bathrooms, clock, tools (`size-10 color-gray text-gray-300 shrink-0`). Row 2 `<div class="relative items-start gap-6 md:grid md:grid-cols-2 md:gap-10">`: about card `<div class="top-[20vh] gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 pb-16 md:sticky md:gap-10 md:self-start md:p-10"><h2>About | Об {name}</h2><div class="flex flex-col gap-4">{paragraphs}</div></div>`; images `<div class="gap-10">{photos.slice(2, -1).slice(2).map(<Image class="rounded-3xl border border-gray-300 bg-gray-150" width=600 height=400/>)}</div>` = photos index 4 … length-2.
  4. `<Line/>`
  5. `<NewContactUs/>`
- Server action (`:270-281`): reads `from`, `date`, `guests`, `hours`; `redirect(`?showBooking=Yachts&direction=[${JSON.stringify(direction)}]`)` (raw JSON, not encoded). Because the `from` input is `disabled`, **it is not submitted** → `from: null` → omitted from the Telegram message.

## 5. Sections (`src/components/sections/`)

`src/components/sections/index.ts` re-exports 28 names: `AdvantagesSection, AngleBar, BestPriceSection, CargoRequestSection, ContactUsSection, Cookies (=CookiesConsent), EmptyLegSection, FaqSection, FooterSection, HeaderSection, HeroSection, HeroSalesSection, SubpageHeroSection, HeroYachtsSection, KeyFeaturesSection, MakeBookingSection, Navbar, OptionsSection, OptionsSelectionSection, PersonalFlightManagerSection, PersonalManagerSection, PrivilegeSection, TestimonialsSection, TilesSection, TransferSection, WeInspectSection, WhyUsSection, YachtsSection`. Not in the index: `NewContactUs` (default export of `new_contact_us.tsx`), `AllAircrafts` (default of `all_aircrafts.tsx`), `CookiesModal` (named, `cookies_modal.tsx`), `MenuBar` (named, `angle_bar.tsx`), `findByICAO` (default of `empty_leg.tsx`). Header, Navbar, Footer, AngleBar/MenuBar, CookiesConsent/CookiesModal are documented in §3.

Global CSS reminders that shape every section: `div { flex flex-col }`, `section { relative flex flex-col items-center justify-center }`, `.container { relative my-10 flex max-w-screen-xl flex-col px-6 md:px-10 lg:px-16 }` (§10.1).

### Section: AdvantagesSection (sections/advantages.tsx)

- Client (`'use client'`, framer-motion). Props `{ title, imageSrc, cards: 3×{title, description} }`.
- `<section><div class="container"><h2 class="mb-4 text-center">{title}</h2><div class="gap-10 overflow-hidden rounded-2xl bg-gray-150"><AdvantagesCard/></div></div></section>`; `AdvantagesCard` = `<motion.div class="gap-10 overflow-hidden rounded-2xl bg-gray-150 pb-8" initial={{opacity:0,y:-50}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}}><Image src alt={title} class="aspect-[17/5] object-cover object-center" loading='lazy' width=1360 height=400/><div class="gap-8 px-6 md:flex-row">{cards → <motion.div class="w-full gap-3" (same motion)><h3 class="md:text-center"/><p class="md:text-center"/></motion.div>}</div></motion.div>`.
- Consumer: `/sales_dept`.

### Section: AngleBar (sections/angle_bar.tsx)

See §3.5. Client. Exports `AngleBar`, `MenuBar`. i18n: `social-media.*`, `navigation.citizens`, `footer.button`. Assets: `arrow-top-right.svg`, `close.svg`, `plane.svg`. Consumer: home only.

### Section: BestPriceSection (sections/best_price.tsx)

- Server (sync). i18n `best-price.{title,description,button}`.
- `<section><div class="container"><div class="card !flex-col-reverse items-center bg-gray-150 lg:!flex-row"><div class="p-8 md:p-10"><h2 class="bg-gold bg-clip-text text-transparent">{title}</h2><p class="mt-4">{description}</p><Link href='?showBooking=Best_price' class="mt-10 md:self-start" scroll={false}><button class="big">{button}</button></Link></div><Image src='/images/business_agencies/insurance.webp' alt='Best price' class="h-80 w-full rounded-2xl object-cover object-center" loading='lazy' width=600 height=320/></div></div></section>`.
- Consumer: `/business_agents`.

### Section: CargoRequestSection (sections/cargo_request.tsx) — DEAD

- Server (sync). i18n `cargo-form.{title,button}`. `<section><div class="container"><div class="card gap-6 p-8 md:p-10"><h2 class="lg:text-center">{title}</h2><RequestForm buttonText={button}/></div></div></section>`. Only referenced in a comment (`cargo_charter/page.tsx:27`).

### Section: ContactUsSection (sections/contact_us.tsx) — DEAD

- Props `{ title, description?, buttonText, imageSrc }`. `<section class="bg-cover bg-center md:bg-fixed" style="background-image:url({imageSrc})"><div class="hero-darkening absolute inset-0"/><div class="container min-h-svh content-center items-center justify-center lg:min-h-[50svh]"><h2 class="text-center"/><p class="pt-4 text-center"/><Link href='?showBooking=Contact_us' scroll={false}><button class="big mt-10"/></Link></div></section>`. Referenced only in comments (`aircraft/old.tsx:113`, `cargo_charter/page.tsx:28`).

### Section: CookiesConsent / CookiesModal (sections/cookies_consent.tsx, cookies_modal.tsx)

See §3.7. Client. i18n `cookies.*` (13 keys, all used). Asset: `check.svg` via `Checkbox`.

### Section: EmptyLegSection (sections/empty_leg.tsx)

- File starts with `'use server'` and exports two async functions (`EmptyLegSection`, default `findByICAO`) — both are therefore registered as server actions; the component still renders as an RSC. `getLocale()` is called without `await` and unused (`:11`).
- Data: `db.select().from(emptyLegs).catch(() => [])` (**no ordering, no date/expiry filter**, `order` column ignored); then for each row `findByICAO(card.from)` and `findByICAO(card.to)` (**2N extra queries**):

```ts
export default async function findByICAO(icao: string) {
  const airport = await db
    .select()
    .from(airports)
    .where(ilike(airports.icaoCode, `%${icao}%`))
    .limit(1)
  const city = airport[0]?.cityEng ? airport[0].cityEng : ''
  const country = airport[0]?.countryEng ? airport[0].countryEng : ''
  if (city === '' && country === '') return ''
  return `${city}, ${country}` // English names only, regardless of locale
}
```

Rows where either lookup returns `''` are dropped (`throw` → `null` → filtered).

- Markup: `<section class="bg-gray-150"><div class="container gap-8 py-10 pt-10 lg:flex-row"><div class="top-40 min-w-40 flex-shrink-0 gap-4 self-start lg:sticky lg:w-72"><h2>{empty-leg.title}</h2><p>{empty-leg.description}</p></div><div class="gap-4">{cards → <EmptyLegCard {...card}/>}<div class="card mt-4 items-start gap-4 border-0 bg-gradient-to-b from-gray-200 from-15% to-[#14323D] p-6 md:bg-fixed"><h3>{empty-leg.telegram.title}</h3><p class="text-gray-900">{…description}</p><Link href='tg:\\nesolve?domain=@atmjet1'><button class="big mt-2 bg-blue-600 text-gray-900">{…button}</button></Link></div></div></div></section>`.
- The Telegram href is the literal string `tg:\\nesolve?domain=@atmjet1` (JSX attribute strings do not process backslash escapes, so both backslashes survive) — malformed; intended `tg://resolve?domain=atmjet1`.
- Consumers: home, `/empty_legs`.

### Section: FaqSection (sections/faq.tsx)

- Client. i18n `faq.title`, `faq.question1..5`, `faq.answer1..5`. State `expanded` (default `0` → first item open).
- `<section><div class="container lg:flex-row"><h2 class="max-w-10 shrink-0 md:min-w-80">{title}</h2><div class="pt-4">{5× <div class="gap-6 border-b border-gray-300 py-6"><Accordion i expanded setExpanded title={questionN} class="cursor-pointer font-serif text-2xl text-gray-900"><div class="flex flex-row overflow-hidden"><p>{answerN.split('\\n') → <span/>+<br/>}</p></div></Accordion></div>}</div></div></section>`.
- Dead inner component `Accordiontwo` (`:52-62`). Consumer: home.

### Section: FooterSection (sections/footer.tsx)

See §3.4. Server (sync). i18n `navigation.*` (12 keys, not `citizens`), `social-media.*`, `footer.{button,location,copyright}`. Assets `logo.svg`, `arrow-top-right.svg`, `/images/home_page/footer.jpg`.

### Section: HeaderSection (sections/header.tsx)

See §3.2. Client. Assets `burger-menu.svg`, `close.svg`, `logo.svg`.

### Section: HeroSection (sections/hero.tsx)

- Server (sync). Props `{ title }`. Hard-coded overline `ATM JET` and `©ATM JET`.
- `<section><div class="container z-20 !my-0 h-svh justify-center gap-2"><p class="text-center text-sm">ATM JET</p><h1 class="text-center">{title}</h1><p class="absolute bottom-8 left-5 z-20 text-sm">©ATM JET</p></div><div class="hero-darkening absolute inset-0 z-10"/><video autoPlay muted loop playsInline preload='auto' class="absolute inset-0 z-0 h-full w-full object-cover"><source src='video/background_full.mp4' type='video/mp4' class="object-cover"/><track src='/path/to/captions.vtt' kind='subtitles' srcLang='en' label='English'/></video></section>`.
- `videoSrcMobile = 'video/background.mp4'` is defined but **unused** (`:8`); the desktop source path is **relative** (no leading slash) — it resolves against the current URL (`/en` → `/video/background_full.mp4`; a trailing-slash URL such as `/en/` would resolve to `/en/video/…`, which is why `public/en/video/` duplicates exist). The `<track>` points to a non-existent file (404). No poster.
- Consumer: home.

### Section: HeroSalesSection (sections/hero_sales.tsx)

- Server (sync). i18n `sales-hero.{overline,num1,headline1,num2,headline2,description,button}` (`num1`=`20+`, `num2`=`500+`).
- `<section><div class="container z-20 !my-0 h-svh items-start justify-center gap-2"><p class="text-sm uppercase">{overline}</p><h1 class="duration-1000 animate-in fade-in slide-in-from-top-10"><Counter class="bg-gold bg-clip-text text-transparent md:bg-fixed">{num1}</Counter> {headline1}<br/><Counter …>{num2}</Counter> {headline2}</h1><p class="max-w-xs pt-4 text-gray-900">{description.split('\\n') → span+br}</p><Link href='?showBooking=Hero_sales' scroll={false}><button class="big mt-8">{button}</button></Link><p class="absolute bottom-8 left-5 z-20 text-sm">©ATM JET</p></div><div class="hero-darkening absolute inset-0 z-10"/><Image src='/images/jets_dep/jetsmarket_page_firstscreen_mainpic.webp' alt='Hero sales' class="md:object-fixed absolute inset-0 z-0 h-full w-full object-cover" loading='lazy' width=1920 height=1080/></section>` (`md:object-fixed` is not a Tailwind class → no-op; hero image lazy-loaded).
- Consumer: `/sales_dept`.

### Section: SubpageHeroSection (sections/hero_subpage.tsx)

- Server (sync). Props `{ title, description, imageUrl }`. `<section><div class="container gap-20 pt-32"><div class="gap-4"><h1 class="text-center">{title}</h1><p class="text-balance text-center">{description}</p></div><Image src={imageUrl} alt={title} class="h-64 w-full rounded-2xl object-cover" loading='lazy' width=1920 height=1080/></div></section>`.
- Consumers: `/cargo_charter`, `/citizens`, `/group_charters`, `/medical_aviation`.

### Section: HeroYachtsSection (sections/hero_yachts.tsx)

- Server (sync). Props (all optional, defaulting to `yachts-hero.{overline,title,description,description2,button}`) + `isButtonHidden`.
- `<section class="min-h-[680]"><div class="container z-20 !my-0 h-svh items-start justify-end gap-2 pb-14 md:justify-center"><p class="text-sm uppercase">{overline}</p><h1 class="duration-1000 animate-in fade-in slide-in-from-top-10">{title}</h1><p class="max-w-lg pt-4 text-gray-900">{description}</p><p class="max-w-lg pt-4 text-gray-900">{description2}</p>{!isButtonHidden && <Link href='?showBooking=Hero_yachts' scroll={false}><button class="big mt-8">{button}</button></Link>}<p class="absolute bottom-8 left-5 z-20 hidden text-sm md:block">©ATM JET</p></div><div class="hero-darkening absolute inset-0 z-10"/><Image class="absolute inset-0 z-0 h-full w-full object-cover" loading='lazy' src='/images/yachts/yacht_page_firstscreen_mainpic.webp' alt='yacht' width=1920 height=1080/></section>` (`min-h-[680]` has no unit → invalid CSS, ignored).
- Consumers: `/sales_yachts` (defaults), `/yachts` (charter texts, button hidden).

### Section: KeyFeaturesSection (sections/key_features.tsx)

- Server (sync). Props `{ title, description, cards: {title, description}[], images: string[] }`.
- `<section class="overflow-hidden bg-gray-150"><div class="container relative mx-auto w-full gap-4 px-4 md:flex-row md:gap-5"><div class="relative z-10 gap-4 md:min-w-80"><h2 class="bg-gold bg-clip-text text-transparent md:bg-fixed">{title}</h2><p class="mb-8">{description}</p></div><KeyFeaturesCarousel>{cards → <KeyFeatureCard title description imageSrc={images[i]}/>}</KeyFeaturesCarousel></div></section>`.
- Consumers: home (5 cards), `/medical_aviation` (4), `/sales_yachts` (4).

### Section: MakeBookingSection (sections/make_booking.tsx)

- Server (sync). Props `{ isCard? }`. i18n `form.title`. `<section><div class="container py-12"><div class="gap-8 {isCard && 'rounded-2xl bg-gray-200 p-8'}"><h2>{form.title}</h2><RequestForm/></div></div></section>` (class string is `gap-8 false` when not a card).
- Consumers: home, `/group_charters`, `aircraft/[id]/old.tsx` (plain); `/citizens` (`isCard`); dead `aircraft/old.tsx` (`isCard`).

### Section: Navbar (sections/navbar.tsx)

See §3.3. i18n `navigation.*` (12), `social-media.*`, `footer.button`. Asset `arrow-top-right.svg`.

### Section: OptionsSection (sections/options.tsx)

- Server (sync). i18n `options.{assistant,agencies,button}`.
- `<section><div class="container gap-6 py-10 lg:flex-row lg:content-stretch">` tile 1 `<div class="relative h-80 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl bg-cover p-12"><Link href='/business_agents' class="z-10 flex h-full flex-col items-start justify-between gap-8"><h2 class="z-10">{assistant}</h2><button>{button}</button></Link><div class="option-darkening absolute inset-0"/><Image src='/images/home_page/For-Business-Agents-one.webp' alt='For Business Agents' class="-z-10 object-cover object-center" fill loading='lazy'/></div>`; tile 2 same shell with `<Link href='/partners'>`, `<h2>{agencies}</h2>`, overlays `<div class="absolute inset-0 -z-10 bg-gray-100 opacity-60"/><div class="option-darkening absolute inset-0 -z-10"/>`, `<Image src='/images/home_page/2-for-business-agents.webp' class="-z-20 object-cover object-center" fill loading='lazy'/>`.
- Consumer: home.

### Section: OptionsSelectionSection (sections/options_selection.tsx)

- Server (sync). Props `{ title, card1, card2 }` each `{ title, description, list: string[], imageSrc }` (lists come from `t(...).split(' \\n')`).
- `<section><div class="container gap-8"><h2 class="text-center">{title}</h2><div class="gap-8 lg:flex-row"><OptionCard/><OptionCard/></div></div></section>`; `OptionCard` = `<div class="card sticky w-full gap-4 overflow-hidden bg-gray-150"><Image src alt={title} class="h-48 w-full object-cover object-center" loading='lazy' width=1128 height=200/><div class="gap-4 p-8"><h3 class="bg-gold bg-clip-text text-transparent">{title}</h3><p>{description}</p></div><div class="gap-1 p-8 pt-0">{list → <div class="rounded-lg bg-gray-100 px-6 py-4 text-gray-800"><p class="bg-gold bg-clip-text text-transparent">{item}</p></div>}</div></div>` (`sticky` without `top` → no effect).
- Consumers: `/sales_dept`, `/sales_yachts`.

### Section: PersonalFlightManagerSection (sections/personal_flight_manager.tsx) — DEAD

- Client. i18n `personal-flight-manager.{title,description,subtitle,button}`. `<section><div class="container"><div class="card gap-8 bg-gray-150 p-8 md:gap-10 md:p-10"><div class="gap-4"><h2 class="md:text-center"/><p class="md:text-center"/></div><div class="gap-6"><hr/><h3 class="bg-gold bg-clip-text text-transparent lg:text-center">{subtitle}</h3><hr/></div><Link href='?showBooking=Personal_flight_manager' scroll={false} class="self-center"><button class="big"/></Link></div></div></section>`. No consumer.

### Section: PersonalManagerSection (sections/personal_manager.tsx)

- Server (sync). i18n `personal-manager.{title,description,chips}`; `chips` split on `;` and trimmed (5 chips).
- `<section><div class="container"><div class="items-center gap-10 overflow-hidden rounded-2xl bg-gray-150 lg:flex-row-reverse"><div class="relative aspect-video h-full w-full bg-red-50 lg:aspect-square">aaa<Image src='/images/jets_dep/personal_manager.webp' alt='personal manager' class="h-full object-cover object-top" loading='lazy' fill/></div><div class="w-full gap-4 px-6 pb-10 lg:items-start lg:py-10"><h2 class="bg-gold bg-clip-text text-transparent">{title}</h2><p>{description}</p><div class="flex-row flex-wrap gap-2">{chips → <p class="rounded-lg bg-gray-100 p-2 text-sm uppercase text-gray-800">{chip}</p>}</div></div></div></div></section>`.
- Defects (visible): literal text node `aaa` and `bg-red-50` placeholder background behind the image (`:13-14`).
- Consumers: `/partners`, `/sales_dept`.

### Section: PrivilegeSection (sections/privilege.tsx)

- Server (sync). i18n `privilege.{title,title2,card1..3.{title,description},contact.{title,description,telegram,whatsapp}}`.
- `<section class="bg-gray-150"><div class="container gap-10 lg:flex-row"><h2 class="top-40 flex-shrink-0 gap-6 self-start lg:sticky lg:w-72"><span class="lg:text-4xl">{title}</span> <br/><span class="bg-gold bg-clip-text text-transparent">{title2}</span></h2><div class="relative w-full gap-4 self-stretch overflow-clip"><div class="overflow-clip rounded-2xl">{3× <PrivilegeCard icon title topPadding={(i+1)*32} description/>}</div><PrivilegeContact/></div></div></section>`.
- `PrivilegeCard`: `<div class="card sticky -mb-16 gap-4 overflow-hidden bg-gray-150 bg-opacity-90 p-8 pb-24 backdrop-blur-lg last:mb-0 last:pb-14 md:flex-row" style="top:{topPadding}px">{icon}<div class="gap-4 md:w-full"><h3 class="bg-gold bg-clip-text font-serif text-transparent">{title}</h3><p>{description}</p></div></div>`. Icons (`h-11 w-11 shrink-0 md:h-11 md:w-11`, gradient-filled SVGs): `plane-gold.svg`, `exchange.svg`, `diamond-gold.svg` (`car-gold.svg` commented out).
- `PrivilegeContact`: `<div class="overflow-clip rounded-2xl bg-gold p-0.5"><div class="rounded-2xl bg-fixed repeat-infinite lg:flex-row-reverse" style="background-color:rgba(23,22,20,1);background-image:url(/images/home_page/pattern.png)"><div class="w-full justify-center p-6 md:p-10"><h3 class="bg-gold bg-clip-text font-serif text-transparent">{contact.title}</h3><p class="pt-4">{contact.description}</p><div class="flex-row flex-wrap gap-4 p-0 pt-6"><Link href='https://t.me/melentev1'><button class="big bg-gold">{contact.telegram}</button></Link><Link href='https://wa.me/971504589926'><button class="big bg-gold">{contact.whatsapp}</button></Link></div></div></div></div>` (commented `artem.webp` image; `repeat-infinite` has no effect without an animation).
- Consumers: home, `/atm_jet_group`.

### Section: TestimonialsSection (sections/testimonials.tsx) — DEAD

- Server (sync). i18n `testimonials.title`, `testimonials.card1..5.{description,name,title}`; images `/images/testimonials/{sardar.webp,pele.png,nicole.png,anna_netrebko.png,jamiroquai.webp}`. `<section class="overflow-hidden bg-gray-150"><div class="container static gap-8"><h2/><TestimonialsCarousel>{5× TestimonialsCard}</TestimonialsCarousel></div></section>`. No consumer.

### Section: TilesSection (sections/tiles.tsx)

- Client. Images `/images/tiles/slice_0..7.webp`. `useInView({ triggerOnce: true, threshold: 0.5 })` on the grid.
- `<section><div class="container !grid grid-cols-2 md:grid-cols-3" ref>{8× <motion.div class="aspect-w-1 aspect-h-1 relative" initial='hidden' animate={inView ? 'visible' : 'hidden'} variants={{hidden:{opacity:0,scale:0}, visible:{opacity:1,scale:1}}} transition={{duration:0.4, delay:index*0.1}}><Image src alt="Tile {n}" class="object-cover" width=400 height=400/></motion.div>}</div></section>` (`aspect-w-1 aspect-h-1` need the aspect-ratio plugin → no effect).
- Consumer: home.

### Section: TransferSection (sections/transfer.tsx)

- Server (sync). i18n `transfer.title` (`subtitle` commented, `button` unused).
- `<section><div class="container"><div class="gap-6 rounded-2xl bg-gray-200 p-8"><div class="gap-8 md:flex-row-reverse"><div class="relative -mx-8 -mt-8 h-48 items-center justify-center overflow-hidden rounded-t-2xl bg-cover bg-center md:m-0 md:w-full"><Image src='/images/home_page/transfer.webp' alt='Image of black car' class="absolute object-cover" layout='fill'/><div class="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-b from-transparent from-50% to-black"/></div><h2>{title}</h2></div><RequestForm/></div></div></section>` (legacy `layout='fill'` prop).
- Consumers: home, `/business_agents`.

### Section: WeInspectSection (sections/we_inspect.tsx)

- Server (sync). i18n `we-incpect.title`, `we-incpect.card1..5.{title,description}` (namespace typo is real). Images `/images/yachts/image_01..05.svg` (served unoptimised by next/image).
- `<section class="overflow-hidden"><div class="container static gap-8"><h2>{title}</h2><TestimonialsCarousel>{5× WeInspectCard}</TestimonialsCarousel></div></section>`; `WeInspectCard` = `<div class="embla__slide mr-8 w-4/5 flex-shrink-0 justify-between gap-3 overflow-hidden rounded-xl bg-gray-150 bg-cover bg-center pt-8 last:mr-0 md:w-2/3 lg:w-1/3"><div class="gap-3 px-8"><h3/><p/></div><Image src alt={title} width=560 height=320 class="h-52 w-full object-cover object-center" loading='lazy'/></div>`.
- Consumer: `/sales_yachts`.

### Section: WhyUsSection (sections/why_us.tsx)

- Server (sync). Props `{ title, description?, cards: {num,title,description}[], images: string[] }`.
- `<section><div class="container gap-10 lg:flex-row"><div class="top-40 flex-shrink-0 gap-6 self-start lg:sticky lg:w-72"><h2>{title}</h2><p>{description}</p></div><div class="relative w-full self-stretch overflow-clip rounded-2xl">{cards → <WhyUsCard num title description topPadding={(i+1)*32} imageSrc={images[i]}/>}</div></div></section>`.
- Consumers: home, `/business_agents`, `/cargo_charter`, `/citizens`, `/partners` (×2), `/sales_dept`, `/sales_yachts`.

### Section: YachtsSection (sections/yachts.tsx) — promo

- Server (sync). i18n `yachts.{title,description}` (`description2` commented). `<section><div class="container"><h2 class="mb-4 text-center">{title}</h2><p class="mb-10 text-center">{description}</p><YachtsCard/></div></section>`. Namespace `yachts` lives in `messages/*/atm_jet_group.json`. Not to be confused with `src/app/[locale]/yachts/YachtsSection.tsx` (listing grid).
- Consumers: home, `/atm_jet_group`.

### Section: NewContactUs (sections/new_contact_us.tsx) — default export

- Client. `useInView({ triggerOnce: true, threshold: 0.5 })` on the first row; all four blocks animate from `{opacity:0, y:-100}` to `{opacity:1, y:0}` (`duration 0.5, ease 'easeOut'`, delays 0.3 / 0.3 / 0.6 / 0).
- `<section><div class="container gap-10 py-20"><div class="gap-10 lg:flex-row" ref>` Telegram card `<motion.div class="w-full"><Link href='https://t.me/melentev1' class="card peer flex flex-col items-start gap-4 border-0 bg-gradient-to-b from-gray-100 from-15% to-[#14323D] p-10 transition-all ease-out hover:border-gray-900 hover:from-25% md:bg-fixed"><h3>Telegram</h3><p class="text-gray-900">{RU|EN text}</p><ArrowTR class="mt-5 h-5 stroke-none text-gray-900 peer-hover:translate-x-10"/></Link></motion.div>`; WhatsApp card identical with `https://wa.me/971504589926`, `to-[#0e2a15]`, `<h3>Whatsapp</h3>`; second row `<div class="gap-10 lg:flex-row">` → `<motion.div class="card w-full p-10 lg:w-2/3 lg:p-16"><BookingForm host='contact_us' close={() => router.push('')}/></motion.div>` + `<motion.div class="card w-full justify-center gap-4 p-10 lg:w-1/3"><Link href='mailto:info@atmjet.com'><h3 class="transition-opacity duration-300 ease-in-out hover:opacity-40">info@atmjet.com</h3></Link><Link href='tel:+971(585)940-112'><h3 …>+971 (50) 458-99-26</h3></Link><p>{Telephone line is open 24/7 | Телефонная линия открыта 24/7}</p></motion.div>`.
- Hard-coded strings: `Telegram`, `Whatsapp`, EN `Manage your enquiries and bookings on go via private chat with our team` / RU `Управляйте своими запросами и бронированиями на ходу через приватный чат с нашей командой`; EN `Get instant support and answers to your questions directly from our team` / RU `Получайте мгновенную поддержку и ответы на ваши вопросы непосредственно от нашей команды`; email, phone.
- Quirks: `host='contact_us'` → the Telegram "From" link reads `https://contact_us/<pathname>`; `bookingType` is `''` for the inline form (no `showBooking` param); `peer-hover:` on a descendant has no effect; `router.push('')` after submit.
- Consumers: `/aircraft`, `/aircraft/[id]` (both layouts), `/cargo_charter`, `/citizens`, `/empty_legs`, `/group_charters`, `/medical_aviation`, `/partners`, `/sales_dept`, `/sales_yachts`, `/yachts`, `/yachts/[id]`.

### Section: AllAircrafts (sections/all_aircrafts.tsx) — DEAD

- Client. Uses dead `getAircrafts(offset)` from `src/app/actions.ts` (`vehicles` where `tail_number <> ''`, limit 15). `<section><div class="container gap-10"><div class="flex-row flex-wrap gap-y-10">{VehicleCard…}</div><button class="big self-center" onClick=loadMore>Show more | Показать еще</button></div></section>`. Only imported by dead `aircraft/old.tsx`.

## 6. Elements (`src/components/elements/`, `animated/`, `form/`, `ui/`, `hooks/`, `drizzle-ssr.tsx`)

`src/components/elements/index.ts` exports: `Accordion, AutoComplete, BookingDialog, Checkbox, Counter, CounterInput, EmptyLegCard, FileCard, GroupCard, KeyFeatureCard, KeyFeaturesCarousel, LocaleSwitch, Preloader, TestimonialsCard, TestimonialsCarousel, VehicleCard, VehiclesCarousel, WhyUsCard, YachtCard, YachtCarousel, YachtsCard, DotButton, useDotButton`. Not in the index: `Gallery` (default), `ImagesCarousel`, `PrevButton/NextButton/usePrevNextButtons`, `RangeSlider` (default, dead). Three "yacht card" files exist: `elements/yacht_card.tsx` (sale yacht, legacy `yachts` table), `elements/yachts_card.tsx` (home promo), `app/[locale]/yachts/yacht_card.tsx` (charter listing card, §4). Two autocompletes exist: `elements/autocomplete.tsx` (`AutoComplete`, controlled, RequestForm) and `form/autocomplete.tsx` (`Autocomplete`, uncontrolled, aircraft detail form).

### Element: Accordion (elements/accordion.tsx)

Client. Props `{ title, i, expanded: false|number, setExpanded, children, className }`; `isOpen = i === expanded`. `<motion.p initial={false} animate={{opacity: isOpen ? '80%' : '100%'}} onClick={() => setExpanded(isOpen ? false : i)} class={className}>{title}</motion.p><AnimatePresence initial={false}>{isOpen && <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} transition={{duration:0.4}}>{children}</motion.div>}</AnimatePresence>`. Consumer: FaqSection.

### Element: AutoComplete (elements/autocomplete.tsx)

Client, controlled (`value`, `onChange` from RHF `Controller`). Debounced (`lodash.debounce`, 300 ms, recreated per locale) call to `getAirports(term, locale)` (`src/utils/getAiport.ts`, §8.6). Dropdown when `autocomplete.length > 1`; the first entry (raw term) is skipped (`index > 0`). `onBlur` clears the list after 200 ms (so `onClick` on an item still fires). Selecting calls `onChange({ target: { value: suggestion } })`. Markup: `<div class="relative"><input type='text' value onChange {...inputProps}/>{list && <ul class="absolute bottom-0 z-50 mt-4 max-h-40 w-80 shrink-0 translate-y-full overflow-y-auto rounded-xl border bg-gray-900 shadow-lg">{<li class="cursor-pointer px-4 py-2 text-gray-100 hover:bg-gray-800">}</ul>}</div>`. `handleChange` (non-debounced) is defined but unused. Consumer: `Direction` (From/To).

### Element: Autocomplete (form/autocomplete.tsx) — duplicate

Client, uncontrolled (`inputValue` state), floating label; same debounce/`getAirports`; dropdown when `length > 0` (renders an empty `<ul>` when only the raw term is returned) at `z-[999]`; item click sets the input value. Markup: `<div class="relative w-full text-gray-100"><label class="absolute left-7 top-4 text-xs font-semibold text-gray-500">{label}</label><input class="px-7 pb-4 pt-9 {className}" value name={id||name} onChange onBlur {...rest}/>…</div>`. Consumer: `aircraft/[id]/page.tsx` (From/To).

### Element: BookingDialog (elements/booking_dialog.tsx)

See §3.9. i18n `social-media.*`, `footer.phone`. Assets `arrow-top-right.svg`, `close.svg`.

### Element: Carousel arrows (elements/carousel_arrows.tsx)

`usePrevNextButtons(emblaApi)` → `{prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick}` (updates on `reInit`/`select`). `PrevButton`/`NextButton`: `<button type='button' class="h-10 w-10 flex items-center justify-center rounded-lg !bg-gray-100 border-gray-500 border-2 text-gray-700 cursor-pointer hover:border-gray-700 hover:text-gray-700 hover:opacity-100 {className}"><LeftAngle class="h-3.5 w-7"/></button>` (Next uses `rotate-180`). Asset `left-angle.svg` (viewBox 0 0 8 14). No `'use client'` directive (imported only by client carousels). Consumers: ImagesCarousel, KeyFeaturesCarousel, VehiclesCarousel, YachtCarousel.

### Element: Carousel dots (elements/carousel_dot_button.tsx)

Client. `useDotButton(emblaApi)` → `{selectedIndex, scrollSnaps, onDotButtonClick}`; `DotButton` = plain `<button type='button'>`. Consumer: ImagesCarousel.

### Element: Checkbox (elements/checkbox.tsx)

`<div class="relative {className}"><input type='checkbox' class="peer relative box-border flex h-6 w-6 cursor-pointer appearance-none items-center rounded-sm border-2 border-gray-900 bg-gray-100 p-0" {...props}/><Check class="pointer-events-none absolute right-0 top-0 z-10 hidden h-6 w-6 text-gray-900 peer-checked:block"/></div>`. Asset `check.svg`. Consumer: CookiesModal.

### Element: Counter (elements/counter.tsx)

Client. Props `{ children: string, className }`. `useInView()` (no options → toggles on every entry/exit) + `useAnimation()`. On enter: `controls.start({opacity:1, y:0, transition:{duration:0.5}})` and counts every number in the string from 0 to its value over `duration = 800` ms in `incrementTime = 30` ms steps:

```ts
const matches = children.match(/\d+([,.]\d+)?/g) // e.g. "50,000" → ["50,000"], "75%" → ["75"], "20+" → ["20"]
const numbers = matches.map((num) => parseFloat(num.replace(/,/g, '')))
// each step: value += target / (800/30); rendered with children.replace(/\d+([,.]\d+)?/g, () => newStart[i].toLocaleString(undefined, { maximumFractionDigits: 0 }))
// when every value >= target → setCount(children)  (original string restored, incl. original separators)
```

On exit: `controls.start({opacity:0, y:-20})` and reset text. Rendered as `<motion.span ref class initial={{opacity:0, y:-20}} animate={controls}>{count}</motion.span>`. Consumers: `/aircraft` hero (`50,000`), `/empty_legs` (`75%`), `/partners` (`partners-hero.num`), HeroSales (`20+`, `500+`), WhyUsCard (`num`), EmptyLegCard (`$price`), dead `aircraft/old.tsx`.

### Element: CounterInput (elements/counter_input.tsx)

Client, RHF `useController({ name: props.name || 'passengers', defaultValue: 1 })`. Range 1–25. `<div class="flex-row items-center rounded-sm bg-gray-900 px-4 py-2.5 text-sm font-normal text-gray-100 {className}"><label class="pr-4" for='passengers'>{placeholder}</label><button class="size-8 rounded-lg border border-gray-700 p-0 {value<=1 && 'cursor-not-allowed opacity-50'}" onClick=decrement>-</button><input class="w-10 border-none bg-transparent stroke-none p-0 py-1 text-center focus:stroke-none" id='passengers' value onChange onBlur {...inputProps}/><button class="… {value>=25 && …}" onClick=increment>+</button></div>`. Typed input is clamped to 1–25 (`Number(e.target.value)`); non-numeric ignored. `id='passengers'` is duplicated for every leg. Consumer: `Direction`.

### Element: EmptyLegCard (elements/empty_leg_card.tsx)

`'use client'` **and** `export async function` (async client component; renders under React 18.3 canary with a console warning — exact behaviour **UNVERIFIED**). i18n `empty-leg.button`. `<motion.div class="props gap-3 bg-gray-100 p-6" initial={{opacity:0,y:-50}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}}><div class="flex-row justify-between"><p class="text-sm">{new Date(start).toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}</p><Link href='?showBooking=Empty-legs' scroll={false}><button>{button}</button></Link></div><div class="flex-row items-start gap-2"><Counter class="font-sans text-3xl font-black text-gray-900">{`$${price?.toLocaleString() ?? 'N/A'}`}</Counter><p class="text-xs line-through">{'$' + ((price ?? 0) * 2.5).toLocaleString()}</p><p class="rounded-lg bg-red-500 px-1 text-xs font-bold text-gray-900">-60%</p></div><div class="flex-row gap-4"><p>{fromAirport}({from.toUpperCase()})</p><p>{' -> '}</p><p>{toAirport}({to.toUpperCase()})</p></div></motion.div>`. Date is always `en-US` long format (e.g. `March 5, 2025`) regardless of locale; strike price = price × 2.5; badge always `-60%`; `props` is a stray class name.

### Element: FileCard (elements/file_card.tsx)

`<div class="overflow-hidden rounded-2xl bg-gray-150 md:min-w-80"><Image src={imageUrl} alt={title} width=560 height=320 class="h-56 w-full object-cover object-center" loading='lazy'/><div class="gap-6 p-6"><h3>{title}</h3><Link href={url} class="md:self-start" target='_blank'><button>{button}</button></Link></div></div>`. Consumer: `/business_agents` (PDFs).

### Element: Gallery (elements/gallery.tsx)

Client. Props `{ images, alt, selected = 0 }`. `<div class="gap-10"><Image width=600 height=600 alt src={images[selectedImage]} class="rounded-3xl border-gray-400"/><div class="snap no-scrollbar snap-x snap-mandatory flex-row gap-2 overflow-y-hidden overflow-x-scroll">{images → <div id="image-{i}" onClick class="aspect-video h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg {i!==selected && 'opacity-50'}"><Image width=100 height=100 alt src/></div>}</div></div>`; selecting scrolls the thumb into view (`{behavior:'smooth', block:'nearest', inline:'center'}`). Consumers: aircraft detail (`selected = images.length > 1 ? 1 : 0`), yacht detail (`selected = 1`, unsafe).

### Element: GroupCard (elements/group_card.tsx)

Props `{ title, description, button, imageSrc, href }`. `<div class="relative w-full bg-cover bg-center p-8 md:flex-row md:p-10" style="background-image:url({imageSrc})"><div class="z-10"><h2>{title}</h2><p class="pt-3">{description}</p><Link href={`/${locale}/${href}`}><button class="mt-6">{button}</button></Link></div><div class="absolute inset-0 bg-gradient-to-r from-gray-150 via-gray-150 to-gray-150/80 md:from-0% md:via-40% md:to-transparent"/></div>`. Consumer: `/atm_jet_group` (produces `//` URLs).

### Element: ImagesCarousel (elements/images_carousel.tsx)

Client, embla (`props.options`, `WheelGesturesPlugin`). `<div class="overflow-clip bg-gray-150" ref><div class="flex-row">{slides → <Image src alt="Slide {i}" class="aspect-video w-full shrink-0 rounded-xl object-cover object-center" loading='lazy' width=720 height=405/>}</div><PrevButton class="absolute left-4 top-1/2 -translate-y-1/2"/><NextButton class="absolute right-4 top-1/2 -translate-y-1/2"/><div class="absolute bottom-2 left-0 right-0 z-30 flex-row flex-wrap items-center justify-center gap-2">{snaps → <DotButton class="h-4 w-4 appearance-none rounded-full p-0 {selected ? 'bg-gold' : 'bg-gray-500'}"/>}</div></div>`. Consumer: sale `YachtCard`.

### Element: KeyFeatureCard (elements/key_features_card.tsx)

Client. `<motion.div class="embla__slide relative aspect-[3/4] w-full flex-shrink-0 justify-end gap-4 bg-cover pr-10 md:w-1/2" initial={{opacity:0}} whileInView={{opacity:1}} transition={{duration:0.5}}><h3 class="z-10">{title}</h3><p class="z-10">{description}</p><Image src class="absolute inset-0 h-full w-full object-cover object-center" alt={title} width=400 height=500/><div class="darkening absolute inset-0"/></motion.div>`. Consumer: KeyFeaturesSection.

### Element: KeyFeaturesCarousel (elements/key_features_carousel.tsx)

Client, embla `{ loop: true, align: 'start' }` + wheel gestures; tracks `scrollProgress` (unused in render). `<><div class="relative w-full"><div class="embla overflow-clip" ref><div class="embla__container flex-row">{children}</div></div></div><div class="right-4 top-4 flex-row gap-2 md:absolute"><PrevButton/><NextButton/></div></>`. Consumer: KeyFeaturesSection.

### Element: LocaleSwitch (elements/localeSwitcher.tsx)

See §3.6.

### Element: Preloader (elements/preloader.tsx)

See §3.8. Asset `logo.svg`.

### Element: RangeSlider (elements/range_slider.tsx) — DEAD

Unused dual-range prototype (green Tailwind demo card, hard-coded "Price Range" copy). No consumer.

### Element: TestimonialsCard (elements/testimonials_card.tsx) — DEAD

Client. `<motion.div class="embla__slide relative mr-8 flex w-full flex-shrink-0 flex-col items-stretch justify-between gap-3 overflow-hidden rounded-xl bg-cover bg-center p-8 last:mr-0 md:w-2/3 lg:w-1/3" initial={{opacity:0}} whileInView={{opacity:1}} transition={{duration:0.5}} style=bg image><div class="absolute inset-0 bg-gray-100 bg-opacity-90 backdrop-blur-xl"/><p class="z-10 h-64 pr-12 text-gray-900">“{description}”</p><div class="relative -mx-4 -mb-4 flex flex-col gap-1 rounded-xl bg-gray-150 p-4 pr-40"><p class="font-serif text-xl text-gray-900">{name}</p><p>{title}</p><div class="absolute bottom-3 right-4 size-32 rounded-2xl bg-cover bg-center" style=bg image/></div></motion.div>`. Consumer: dead TestimonialsSection only.

### Element: TestimonialsCarousel (elements/testimonials_carousel.tsx)

Client, embla `{ align: 'start' }` + wheel gestures (no loop). `<div class="embla" ref><div class="embla__container flex-row">{children}</div><div class="embla__progress"><div class="embla__progress__bar absolute -bottom-10 left-0 h-2 rounded-full bg-gold md:bg-fixed" style="width:{scrollProgress}%"/></div></div>`. Live consumer: WeInspectSection (the progress bar is the gold line under the "we inspect" carousel); dead: TestimonialsSection.

### Element: VehicleCard (elements/vehicle_card.tsx)

Props: a `vehicles` row. `<Link href={`/aircraft/${tailNumber}`} class="w-full shrink-0 pr-4 md:w-1/2 lg:w-1/3"><div class="aspect-video rounded-xl bg-cover bg-center" style="background-image:url(https://{image})"/><h3 class="pt-10">{tailModel}</h3><div class="mt-4 h-10 flex-row content-stretch items-center justify-stretch border-b border-gray-300"><p class="w-full">Year:</p><p class="w-full">{tailYear}</p></div><div class="h-10 flex-row items-center justify-between border-b border-gray-300"><p class="w-full">Pax:</p><p class="w-full">{tailMaxpax}</p></div></Link>`. English-only labels. Consumers: VehiclesCarousel (`/sales_dept`), dead AllAircrafts.

### Element: VehiclesCarousel (elements/vehicles_carousel.tsx)

Client, embla `{ loop: true, align: 'start' }` + wheel gestures. `<div class="relative"><div class="embla overflow-clip" ref><div class="embla__container flex-row">{vehicles → <VehicleCard {...v}/>  /* no key */}</div></div><PrevButton class="absolute -left-4 top-1/2 -translate-y-1/2 lg:-translate-x-full"/><NextButton class="absolute -right-4 top-1/2 -translate-y-1/2 lg:translate-x-full"/></div>`. Prop `useImgInsteadOfThumb` is unused. Consumer: `/sales_dept`; dead `aircraft/old.tsx`.

### Element: WhyUsCard (elements/why_us_card.tsx)

Client. Props `{ num?, title, description, imageSrc?, topPadding? }`. `<motion.div class="card sticky -mb-16 gap-4 overflow-hidden bg-gray-150 bg-opacity-90 pb-24 backdrop-blur-lg last:mb-0 last:pb-10 md:flex-row md:gap-16 md:py-0 md:last:pb-0" initial={{opacity:0,y:-50}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}} style="top:{topPadding}px"><div class="gap-4 p-8 md:w-full md:pb-24 md:pt-16">{num && <Counter class="bg-gold bg-clip-text font-serif text-6xl text-transparent md:bg-fixed">{num}</Counter>}<h3>{title}</h3><p>{description}</p></div>{imageSrc && <Image src alt={title} class="aspect-video w-full object-cover object-center lg:w-1/2" loading='lazy' width=1200 height=1200/>}</motion.div>`. Consumers: WhyUsSection, `/group_charters` (direct).

### Element: YachtCard (elements/yacht_card.tsx) — sale yacht

Props: a legacy `yachts` row. Computes `name = `${length}m ${shipyard} yacht ${name} (${location})`` (unused). `<div class="relative w-full shrink-0 gap-6 pr-4 md:gap-10 lg:flex-row"><div class="relative w-full overflow-hidden rounded-xl"><ImagesCarousel slides={pictures || []}/></div><div class="flex-row justify-around lg:flex-col"><Numeric title='Guests:' number={guests||0}><People/></Numeric><Numeric title='Cabins:' …><Beds/></Numeric><Numeric title='Crew:' …><Captain/></Numeric></div><div class="min-w-80"><TextLine title='Shipyard:' value={shipyard}/><TextLine 'Year built:' year/><TextLine 'Length:' `${length} feet`/><TextLine 'Beam:'/><TextLine 'Draft:'/><TextLine 'Cruising speed:'/><TextLine 'Max speed:'/><TextLine 'Location:'/></div></div>`; `Numeric` = `<div class="gap-2"><p class="font-semibold text-gray-900">{title}</p><div class="flex-row gap-2">{icon}<h3>{number}</h3></div></div>`; `TextLine` = `<div class="h-10 flex-row items-center justify-between border-b border-gray-300"><p class="w-full">{title}</p><p class="w-full">{value}</p></div>`. Icons `ion_people.svg`, `f7_bed-double-fill.svg`, `healthicons_security-worker.svg` (gradient fills, no size class → intrinsic 33×32). English-only. Consumer: YachtCarousel (`/sales_yachts`).

### Element: YachtCarousel (elements/yacht_carousel.tsx)

Client, embla `{ loop: true, align: 'start' }` + wheel. `<div class="gap-4 overflow-clip" ref><div class="flex-row">{vehicles → <YachtCard {...v} key={index}/>}</div><div class="w-full flex-row items-center justify-center gap-2"><PrevButton/><NextButton/></div></div>`. Consumer: `/sales_yachts`.

### Element: YachtsCard (elements/yachts_card.tsx) — home promo

Client. i18n `yachts.{title,card1..3.{title,description},call-to-action,button}`. `<motion.div class="gap-10 overflow-hidden rounded-2xl bg-gray-150" (y -50→0, 0.5 s)><Image src='/images/home_page/yachts.webp' class="min-h-64 object-cover object-center" loading='lazy' alt={title} width=1200 height=255/><div class="gap-8 px-6 md:flex-row">{3× <motion.div class="w-full gap-3" (same motion)><h3/><p/></motion.div>}</div><motion.div class="mx-6 mb-6 gap-4 overflow-hidden rounded-2xl bg-gray-100 md:text-center" (same motion)><Image src='/images/atm_jet_group/yachts.webp' alt={call-to-action} class="mx-auto aspect-[3/1] w-full object-cover object-center" loading='lazy' width=1100 height=400/><div class="gap-6 p-6"><h3>{call-to-action}</h3><Link href='/yachts'><button class="md:self-center md:px-8">{button}</button></Link></div></motion.div></motion.div>`. Consumer: promo YachtsSection.

### Element: Line (animated/line.tsx)

See §3.10.

### Element: form/input.tsx (Input)

`<div class="relative w-full bg-gray-900 text-gray-100 {className}"><label class="absolute left-7 top-4 text-xs font-semibold text-gray-500">{label}</label><input class="px-7 pb-4 pt-9 {className}" name={id||name} {...rest}/></div>` (className applied twice). Consumer: aircraft detail form (date). A near-identical local `Input` lives in `yachts/[id]/page.tsx:259-268` (no className on wrapper).

### Element: form/select.tsx (Select)

`<div class="relative w-full overflow-hidden bg-gray-900 text-gray-100 md:rounded-md"><label class="absolute left-7 top-4 text-xs font-semibold text-gray-500">{label}</label><select class="w-full appearance-none rounded-none border-none bg-gray-900 pb-4 pl-6 pt-9 outline-none focus:outline-none focus:ring-0 {className}" name={id||name} {...rest}>{children}</select></div>`. Consumer: `aircraft_list.tsx`. Two more local copies: `yachts/filter_section.tsx:182-197` (identical) and `yachts/YachtsSection.tsx:129-140` (`pr-6`, `pb-4 pl-6 pt-9`, unused).

### Element: form/phone-input.tsx — DEAD

shadcn-style `react-phone-number-input` wrapper using `ui/button`, `ui/command`, `ui/input`, `ui/popover`, `ui/scroll-area`, `lucide-react`; hard-coded `Search country...`, `No country found.`. No consumer.

### Element: form/direction.tsx, form/request_flight.tsx, form/booking.tsx

See §7.

### Elements: ui/* (shadcn) — all DEAD except transitively

`button.tsx` (cva variants default/destructive/outline/secondary/ghost/link; sizes default/sm/lg/icon), `command.tsx` (cmdk + `Dialog`), `dialog.tsx`, `input.tsx`, `label.tsx`, `popover.tsx`, `scroll-area.tsx`, `slider.tsx` (Radix slider with optional tooltip; thumb `h-5 w-5 rounded-full border-2 border-gray-150 bg-orange-200`, track `bg-gray-800 h-2`, range `bg-primary bg-gold`), `toast.tsx`, `toaster.tsx` (uses `hooks/use-toast`), `tooltip.tsx`. Only `slider.tsx` is imported by live-but-unused code (`yachts/dual_range.tsx` and `filter_section.tsx` import `Slider`, but `DualRange` usage is commented out). `src/hooks/use-toast.ts` (react-hot-toast-style reducer, `TOAST_LIMIT 1`, `TOAST_REMOVE_DELAY 1000000`) is only imported by `ui/toaster.tsx`. These rely on shadcn CSS variables that are never defined (§10.1).

### Element: DualRange (app/[locale]/yachts/dual_range.tsx) — DEAD

Client wrapper around `ui/slider`: `<div class="relative rounded-lg bg-white p-4">{label && <label class="pointer-events-none absolute left-6 right-6 top-3 flex justify-between text-xs font-semibold text-gray-500"><span>{label}</span><span class="font-bold text-gray-150">{value[0].toLocaleString()}{unit} - {value[1].toLocaleString()}{unit}</span></label>}<Slider class="h-10 pt-6" {...rest}/></div>`. All usages commented out (`aircraft_list.tsx:60-68`, `filter_section.tsx:79-86,104-112,125-133`).

### Element: drizzle-ssr.tsx (components/drizzle-ssr.tsx) — DEAD

`'use server'` component selecting all `airports` and rendering their ids in a `<div>`. No consumer.

### Element: arrows.css (elements/arrows.css) — DEAD

Embla demo stylesheet (`.embla`, `.embla__viewport`, `.embla__container`, `.embla__slide`, `.embla__button*`, `.embla__dot*`, CSS vars `--slide-height/--slide-spacing/--slide-size`, `--detail-medium-contrast`, `--text-body`, …). **Never imported** — the `embla`, `embla__container`, `embla__slide`, `embla__progress*` class names used by the carousels therefore carry no styles (layout comes from the Tailwind classes next to them).

## 7. Forms and the booking flow

### 7.1 RequestForm + Direction (`src/components/form/request_flight.tsx`, `direction.tsx`)

- Client, `react-hook-form` + `zodResolver`. Schema (`direction.tsx:6-18`, `request_flight.tsx:11-13`):

```ts
export const directionSchema = z.object({
  from: z.string().nonempty('From is required'),
  to: z.string().optional(),
  date: z
    .string()
    .nonempty('Date is required')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  returnDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .optional(),
  passengers: z.number().int().positive('passengers must be a positive number'),
})
const schema = z.object({ direction: z.array(directionSchema) })
```

Validation errors are **never displayed** (no error rendering; invalid submit silently does nothing).

- Props `{ buttonText?, buttonClassName?, max = 4 }`. Default values: one leg `{ from: '', to: '', date: '', passengers: 1 }`. `useFieldArray('direction')`.
- Submit (`:43-48`): `methods.reset()` then `router.push(`?showBooking=Flight_request&direction=${JSON.stringify(data.direction)}`, { scroll: false })` — opens the BookingDialog with the legs serialized as JSON in the query (URL-encoded by the router).
- Round trip (`:58-66`): switching to round trip removes legs `1..n` (`remove([1..])`), hides "Add leg", and in `Direction` the date label becomes `form.when` (instead of `form.date`) and an extra `returnDate` field (label `form.returnDate`) appears. Switching back keeps one leg (previous extra legs are lost — see commit `d8f3c8a` "transfer data between round trip and multi-leg": only removal is implemented).
- `showConfirm` (`?confirm=true`) is read but its render block is commented out (`:68-75`).
- Markup: `<form class="flex flex-col gap-6 lg:gap-3">{fields → <div class="flex flex-col gap-2 lg:flex-row"><Direction index showReturn={isRoundTrip}/>{index != 0 && <button type='button' class="self-end border border-gray-300 bg-gray-100 text-gray-900 lg:h-14 lg:w-48">{form.delete-leg}</button>}{index == 0 && <button type='submit' class="w-48 {buttonClassName} hidden lg:flex lg:items-center lg:justify-center">{buttonText || form.request-quote}</button>}</div>}<div class="flex-row flex-wrap justify-between gap-4"><div class="flex-row gap-1 rounded-full border border-gray-500 p-0.5"><button type='button' class="{isRoundTrip ? 'bg-gray-100 text-gray-900' : 'bg-gray-300 text-gray-800'}">{form.multi-leg}</button><button type='button' class="{isRoundTrip ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-900'}">{form.round-trip}</button></div>{fields.length < max && !isRoundTrip && <button type='button' class="self-start border border-gray-300 bg-gray-100 text-gray-900">{form.add-leg}</button>}</div><button type='submit' class="big lg:hidden {buttonClassName}">{buttonText || form.request-quote}</button></form>`.
- `Direction` markup: `<div class="w-full content-stretch items-stretch justify-stretch gap-0.5 rounded-xl lg:flex-row">` From: `<div class="relative"><label class="absolute left-4 top-4 z-10 text-xs font-semibold">{form.from}</label><AutoComplete value onChange placeholder={form.from} class="w-full rounded-t-xl pt-8 lg:h-full lg:min-w-40 lg:rounded-sm lg:rounded-l-xl"/></div>`; To: same with `class="w-full pt-8 lg:h-full lg:min-w-40"`; Date: `<div class="w-full rounded-sm bg-gray-900"><div class="relative"><label …>{showReturn ? form.when : form.date}</label><input type='date' class="min-h-16 w-full flex-shrink-0 pb-3 pt-7 text-sm lg:h-full"/></div></div>`; Return (only round trip): `<div class="relative w-full rounded-sm bg-gray-900">` same input with `form.returnDate`; Passengers: `<CounterInput placeholder={form.passengers} class="w-full rounded-b-xl lg:rounded-sm lg:!rounded-r-xl"/>` (`onChange` wraps `Number(e.target.value)`).
- Consumers: MakeBookingSection, TransferSection (+ dead CargoRequestSection with `buttonText`).

### 7.2 BookingForm (`src/components/form/booking.tsx`)

- Client. Props `{ host, close }`. Reads `showBooking` (→ `bookingType`), `direction` (→ `JSON.parse(searchParams.get('direction') || '[]')` — malformed JSON throws during render), `confirm`.
- Schema (`:22-36`):

```ts
const schema = z.object({
  name: z.string().min(1, 'Required').max(32),
  email: z.string().email('Invalid email'),
  phone_number: z
    .string()
    .min(1)
    .refine(
      (v) => {
        const d = v.replace(/\D/g, '')
        return d.length >= 8 && d.length <= 15
      },
      { message: 'Invalid phone number' },
    ),
  tags: z.array(z.string()).optional(),
})
```

`useForm({ resolver, mode: 'onBlur', defaultValues: { name:'', phone_number:'', email:'', tags: [] } })`; errors shown only when `touchedFields[field] && errors[field]` as `<p class="mt-1 text-xs text-red-500">`.

- **Phone / country** (`:81,112,145-164,223-229`): `selectedCountry` initial = **`COUNTRIES[1]` = Åland Islands `+35818`** (the default-country bug; placeholder shows `+35818 123 456 789`). On focus of an empty field the value becomes `+`; `handlePhoneChange` forces a leading `+`, formats with `new AsYouType().input(raw)`, and auto-selects the country whose `code` equals `+` + the first 1–3 digits (`/^\+(\d{1,3})/`) — codes longer than 3 digits (e.g. `+35818`) can never be auto-matched. Backspace/Delete at caret position 1 is blocked when the value starts with `+`. Dropdown: button `absolute inset-y-0 left-0 flex items-center gap-2 bg-transparent pl-4` with `<Flag iso class="h-4 w-4"/>` + inline chevron SVG (`h-3 w-3 text-gray-400`); panel `absolute left-0 top-full z-10 mt-[2px] w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-[0_6px_20px_rgba(0,0,0,0.08)]` with a search input (`data-search`, placeholder `Search`, `autoFocus`, `class="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-gray-300 placeholder-gray-400 focus:outline-none"`, ArrowUp/ArrowDown/Enter navigation) and `<ul class="max-h-60 overflow-y-auto">` items `flex cursor-pointer items-center gap-4 px-4 py-3 text-gray-300 first:rounded-t-xl last:rounded-b-xl last:border-b-0` + active `bg-gray-700` / `hover:bg-gray-800`, each `<Flag/> <span class="flex-1 text-sm">{highlighted localized name}</span><span class="text-sm font-semibold">{code}</span>`; empty → `<li class="px-4 py-3 text-sm text-gray-500">{contact-form.no-results}</li>`. Names localized via `Intl.DisplayNames([locale], { type: 'region' })` (fallback `en`); filtering normalizes accents/spaces (`normalize`, `:50-54`) and also matches dial-code digits. Selecting sets `phone_number = `${code} `` unless it already starts with the code. Outside `mousedown` closes.
- Heading (`:246`): `<h2 class="text-center text-gray-900">{contact-form.title}</h2>` above the form, on every booking form there is.
- Fields markup: name `<div class="flex flex-col gap-1"><label class="text-sm text-gray-900">{contact-form.name}</label><input placeholder={contact-form.name-placeholder} type='text' class="w-full border-b bg-transparent px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none {error ? 'border-red-500 focus:border-red-500' : 'focus:border-gold border-gray-600'}"/></div>`; phone same with `type='tel'`, `py-2 pl-20 pr-4`, `value={phoneFieldValue === '+' ? '' : phoneFieldValue}`; email `type='email'`; chips `<div class="flex flex-row flex-wrap gap-2 py-6">` → `Chip` = `<div><input id type='checkbox' class="peer sr-only" value {...register('tags')}/><label for class="rounded-full border border-gray-400 bg-background px-5 py-2 font-semibold uppercase transition-colors hover:border-gray-800 peer-checked:border-transparent peer-checked:bg-gold peer-checked:text-gray-100">{tag}</label></div>`; submit `<button type='submit' class="big self-center !px-24 text-black">{contact-form.send}</button>`. (`focus:border-gold` and `bg-background` resolve to nothing — `gold` is a background-image token and `--background` is undefined.)
- Chips (`:239-242`, hard-coded): RU `['Запрос на партнерство', 'пресс', 'другое']`, EN `['Partnership request', 'press', 'other']`.
- Confirm view (`:231-237`): `<h2 class="text-center text-gray-900">{contact-form.confirm}</h2><Checkmark class="mx-auto my-10 h-20 text-orange-200"/>` — only when `?confirm=true`, which **nothing ever sets** (unreachable).
- Submit (`:197-221`): builds the Telegram message (§7.4) with `url = `https://${host}${pathname}``, `await sendMessage(msg, 'MarkdownV2')` inside `try { … } finally { close() }` → the dialog/inline form closes whether or not the send succeeded; errors propagate as unhandled promise rejections; no success/failure feedback; form values are not reset for the inline form.

### 7.3 Detail-page inline forms and their server actions

| Page                                  | Fields submitted                                                        | Server action redirect (verbatim)                                                              | Notes                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/aircraft/[id]` (`page.tsx:239-249`) | `from`, `to` (Autocomplete), `date`                                     | `redirect(`?showBooking=Yachts&direction=[${encodeURIComponent(JSON.stringify(direction))}]`)` | wrong dialog source (`Yachts`); JSON percent-encoded inside literal `[...]`; `x-forwarded-for` read and discarded |
| `/yachts/[id]` (`page.tsx:270-281`)   | `from` (**disabled → not submitted → null**), `date`, `guests`, `hours` | `redirect(`?showBooking=Yachts&direction=[${JSON.stringify(direction)}]`)`                     | raw JSON (router encodes); `from` never reaches Telegram                                                          |

Both produce a query the BookingDialog reads as `direction = [ {…} ]`.

### 7.4 Telegram message format (`booking.tsx:166-214`, verbatim)

```ts
const mdEscape = (t: string) => t.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, '\\$&') // does NOT escape backslash
const msg = [
  '*🚀  New Booking Request*',
  '──────────────',
  `👤 *Name:* ${mdEscape(data.name)}`,
  `🌐 *Locale:* ${mdEscape(locale)}`,
  `💼 *Component:* ${mdEscape(bookingType)}`,
  '',
  `📞 *Phone:* \`${mdEscape(data.phone_number.replaceAll(' ', ''))}\``,
  `✉️ *Email:* ${mdEscape(data.email)}`,
  '',
  data.tags?.length ? `🏷️ *Tags:* ${mdEscape(data.tags.join(', '))}` : '🏷️ *Tags:* None',
  '',
  formatDirectionsMd(directions),
  '',
  `🔗 From ${mdEscape(url)}`,
].join('\n')
// formatDirectionsMd: for each leg i → `*${i + 1}\\. Direction*` + '\n' + rows.join('\n'), legs joined by '\n\n';
//   rows (only when value !== null/undefined/''): `*From:* v`, `*To:* v`, `*Date:* v`, `*Return:* v`, `*Passengers:* v`, `*Guests:* v`, `*Hours:* v`  (values mdEscape'd)
//   empty list → '*No directions*'
```

### 7.5 `?showBooking=` values

| Value                           | Source file                                                                                  | Live?                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `Header`                        | `sections/navbar.tsx:23,40`                                                                  | yes                                        |
| `Footer`                        | `sections/footer.tsx:64`                                                                     | yes                                        |
| `Angle_bar`                     | `sections/angle_bar.tsx:65`                                                                  | yes (home)                                 |
| `Hero_sales`                    | `sections/hero_sales.tsx:33`                                                                 | yes                                        |
| `Hero_yachts`                   | `sections/hero_yachts.tsx:33`                                                                | yes (`/sales_yachts`; hidden on `/yachts`) |
| `Best_price`                    | `sections/best_price.tsx:14`                                                                 | yes                                        |
| `Empty-legs`                    | `elements/empty_leg_card.tsx:28`                                                             | yes                                        |
| `Flight_request` (+`direction`) | `form/request_flight.tsx:45`                                                                 | yes                                        |
| `Contact_us_aircraft`           | `app/[locale]/aircraft/page.tsx:31` (also dead `aircraft/old.tsx:78`)                        | yes                                        |
| `Yachts` (+`direction`)         | `app/[locale]/yachts/[id]/page.tsx:280` **and** `app/[locale]/aircraft/[id]/page.tsx:248`    | yes (aircraft one is a bug)                |
| `Contact_us`                    | `sections/contact_us.tsx:23`                                                                 | dead                                       |
| `Personal_flight_manager`       | `sections/personal_flight_manager.tsx:24`                                                    | dead                                       |
| `Citizens`                      | `app/[locale]/citizens/page.tsx:56,74`                                                       | commented out                              |
| (none; `host='contact_us'`)     | `sections/new_contact_us.tsx:72` inline form → `Component` empty, URL `https://contact_us/…` | yes                                        |

### 7.6 `?direction=` and `?confirm=true`

- `direction`: JSON array of `{ from?, to?, date?, returnDate?, passengers?, guests?, hours? }` produced by RequestForm (raw `JSON.stringify`), the aircraft action (percent-encoded inside `[…]`) and the yacht action (raw inside `[…]`). Consumed only by `BookingForm` (`JSON.parse`).
- `confirm=true`: read by `BookingDialog.handleClose` (keeps `?confirm=true` when closing), `BookingForm` (confirm view) and `RequestForm` (dead block). **Never written by any code path** → the confirm state is unreachable in production.

### 7.7 Yachts filter form and aircraft sort selects

Documented in §4 (`/[locale]/yachts` FilterSection table and `/[locale]/aircraft` selects). Summary of URL params on `/yachts`: `guests ∈ {15,30,60,60+,All}`, `price ∈ {1200,3500,Lux,All}`, `length ∈ {All,20,40,60}` (form field is named `lenght`), `sort ∈ {price,length,guests}`, `order ∈ {asc,desc}`; only `sort`/`order` are re-applied to the selects after navigation. `/aircraft` keeps sort/order in client state only (no URL).

## 8. Data layer (`src/lib/drizzle.ts`)

Connection: `drizzle(vercelSql, { schema })` over `@vercel/postgres` (`:323`), which reads `POSTGRES_URL` from the environment; `dotenv` loads `.env.local` at import (`:19`). No migrations, no `drizzle/` folder in the site repo; the DDL for the admin-owned tables lives in `atmjet-admin/drizzle/*.sql` (§8.10). Every query except the aircraft detail/yacht detail lookups is wrapped in `.catch(() => [])`, so DB outages render empty sections rather than errors.

### Table: airports

`pgTable('airports')` (`:21-35`): `id serial PK`, `iata_code varchar(255) NN`, `icao_code varchar(255) NN`, `name_rus`, `name_eng`, `city_rus`, `city_eng`, `gmt_offset`, `country_rus`, `country_eng`, `iso_code`, `latitude`, `longitude` (all `varchar(255) NOT NULL`). Columns read: `icao_code` (filter), `city_eng`, `country_eng` (`sections/empty_leg.tsx:63-75`). Consumers: EmptyLegSection (`ilike(icao_code, '%<from|to>%') limit 1`), dead `drizzle-ssr.tsx` (`id`). Ordering: none.

### Table: atmjet_admin__empty_legs (`emptyLegs`)

(`:37-49`): `id serial PK`, `start timestamptz NN`, `end timestamptz NN`, `from varchar(4) NN`, `to varchar(4) NN`, `type varchar(255)`, `category varchar(255)`, `company varchar(255)`, `safety varchar(255)`, `price integer default 0`, `order integer`. Read by the site: `start`, `price`, `from`, `to` (EmptyLegCard); `end`, `type`, `category`, `company`, `safety`, `order` are written by the admin but **never used** by the site. Query: `select * from emptyLegs` — **no order, no limit, no expiry filter**. Written by `atmjet-admin` (`empty_legs_actions.ts`).

### Table: city_list (`cityList`)

(`:51-54`): `id serial PK`, `name varchar(30) NN default ''`. **Unused** by site and admin. Must be preserved (unknown external producer; **UNVERIFIED** contents).

### Table: vehicles

(`:56-108`): mixed legacy catalogue with `source integer default 1` and both plane (`tail_*`) and yacht (`yacht_*`) columns: `id serial PK`, `article varchar(50)`, `price decimal(12,2) '0.00'`, `old_price decimal(12,2)`, `weight decimal(13,3)`, `image varchar(255)`, `thumb varchar(255)`, `vendor integer 0`, `made_in varchar(100) ''`, `new/popular/favorite integer 0`, `tags/color/size text`, `source integer 1`, `yacht_maxspeed varchar(20)`, `yacht_speed varchar(20)`, `yacht_winter_areas varchar(255)`, `yacht_summer_areas varchar(255)`, `yacht_guests varchar(20)`, `yacht_year varchar(20)`, `yacht_builder varchar(100)`, `yacht_length varchar(50)`, `tail_homebase_country varchar(100)`, `tail_maxpax varchar(20)`, `tail_homebase_name varchar(255)`, `tail_homebase varchar(255)`, `tail_operator varchar(100)`, `tail_number varchar(50)`, `tail_model varchar(100)`, `tail_manufacturer varchar(100)`, `tail_exteriorrefit varchar(20)`, `tail_interiorrefit varchar(20)`, `tail_homebase_city varchar(100)`, `tail_year varchar(20)`. Indexes: `article_idx, price_idx, old_price_idx, vendor_idx, new_idx, favorite_idx, popular_idx, made_in_idx`.
Consumers and columns read: aircraft sitemap (`tail_number <> ''` → `tail_number`); `/sales_dept` (all columns, `ORDER BY CASE WHEN tail_year='' THEN NULL ELSE CAST(tail_year AS INT) END DESC NULLS LAST LIMIT 15`, no `source` filter); `aircraft/[id]/old.tsx` (`tail_number = UPPER(x)` limit 1; reads `tail_model, tail_number, tail_operator, vendor, tail_year, tail_homebase, tail_maxpax, tail_homebase_city, tail_homebase_country, tail_manufacturer, tail_interiorrefit, tail_exteriorrefit, image`); VehicleCard (`id, tail_number, image, tail_model, tail_year, tail_maxpax`); dead `aircraft/old.tsx` (`tail_maxpax` numeric ranges 2–6 / 7–10 / >10 via `trim(tail_maxpax) ~ '^[0-9]+$'`), dead `app/actions.ts` (`offset/limit 15`). `image` values are stored **without scheme** (rendered as `https://${image}` in VehicleCard and `http://${image}` in `old.tsx`); host **UNVERIFIED** (not derivable from code).

### Table: yachts

(`:110-125`): `id serial PK`, `name text`, `shipyard text`, `year integer`, `length numeric`, `beam numeric`, `draft numeric`, `cabins integer`, `guests integer`, `crew integer`, `cruising_speed integer`, `max_speed integer`, `location text`, `pictures text[]`. Consumer: `/sales_yachts` (`select *`, no order/limit) → sale `YachtCard` reads all columns; `pictures[]` go through `next/image` so they must be on an allowed host (DO CDN or S3; which one is **UNVERIFIED**).

### Table: new_airports (`newAirports`)

(`:127-160`): `id serial PK`, `icao text`, `iata text`, `label_en`, `label_ru`, `city_en`, `city_ru`, `country_en`, `country_ru`, `passengers_per_year text` (mapped as `passengers`), `type_en`, `type_ru`, `alies_en`, `alies_ru`, `wikidata` (all `text`). Indexes: `icao_idx, iata_idx, idx_airports_city_en, idx_airports_city_ru, idx_airports_label_en, idx_airports_label_ru, idx_airports_country_en, idx_airports_country_ru, idx_airports_alies_en, idx_airports_alies_ru`. Consumers: `src/utils/getAiport.ts` (live), `src/app/actions.ts` (dead). `type_*`, `wikidata` unused.

### Table: contact (`person`)

(`:162-167`): `id serial PK`, `name text`, `phone text`, `email text`. Referenced only through `newYachtsRelations` (`contact_id`, `captain_id` → `contact.id`, `:205-214`); **never queried** by the site; the admin has no UI for it. Holds PII (plan E4.8).

### Table: new_yachts (`newYachts`)

(`:169-203`): `id serial PK`, `name text`, `slug text`, `description text` (mapped `descriptionEn`), `description_ru text`, `manufacturer text`, `owner text`, `contact_id integer`, `bussines_price numeric`, `customer_price numeric`, `currency text`, `captain_id integer`, `location text`, `length numeric`, `guests_day numeric`, `guests_night numeric`, `cabins text`, `bathrooms text`, `refit numeric`, `min_hours numeric`, `included text` (mapped `includedRu`), `included_en text`, `photos text[]`. Indexes `contact_idx, captain_idx, yacht_name_idx`. Consumers: `/yachts` (`select * order by id`), charter `YachtCard` (`name, manufacturer, photos, slug, customer_price, currency, length, guests_day, cabins, bathrooms, refit, min_hours`), `/yachts/[id]` (`slug ILIKE '%id%' limit 1`; reads `description(_ru), manufacturer, name, photos, location, customer_price, currency, min_hours, guests_day, guests_night, length, cabins, bathrooms, refit, included(_en)`). Unused: `owner, contact_id, captain_id, bussines_price`. Numeric columns arrive as **strings** (drizzle `numeric`), hence the `Number()` casts. `photos[]` are S3 URLs written by the admin (`https://${AWS_S3_BUCKET_NAME}.${AWS_S3_ENDPOINT}/yachts/<timestamp>-<filename>`). Written by `atmjet-admin` (add/edit/delete actions).

### Table: atmjet_admin__users (`users`)

(`:216-220`): `id serial PK`, `username varchar(256) NN`, `password text NN` (**plaintext**, compared with `===` in the admin). Unused by the site. Preserve for the admin until decommission (plan E12.4).

### Table: aircrafts

(`:222-278`): `id serial PK unique`, `slug text NN unique`, `registration_number text`, `year_of_production integer`, `passengers_max integer`, `serial_number text`, `hours_flown integer`, `cycles integer`, `verified_at text`, `tech_operator text`, `is_cargo/is_for_sale/is_for_lease/is_for_charter boolean default false`, `pdf_attachment text`, `pdf_attachment_name text`, `company_slug text`, `company_name text`, `extension_refurbishment boolean`, `extension_view_360 text`, `extension_cabin_crew boolean`, `extension_divan_seats integer`, `extension_lavatory boolean`, `extension_beds integer`, `extension_hot_meal boolean`, `extension_wireless_internet boolean`, `extension_pets_allowed boolean`, `extension_cabin_height/length/width text`, `extension_luggage_volume text`, `extension_shower boolean`, `extension_satellite_phone boolean`, `extension_sleeping_places integer`, `extension_description text`, `extension_spec_equipment text`, `airport_iata text`, `airport_icao text`, `airport_name text`, `aircraft_type_slug text`, `aircraft_type_name text`, `aircraft_type_speed_typical real`, `aircraft_type_range_maximum integer`, `aircraft_type_cabin_height real`, `aircraft_type_cabin_length real`, `aircraft_type_cabin_width real`, `aircraft_type_pax_maximum integer`, `aircraft_type_aircraft_class_name text`.
Columns actually read: listing card `slug, id, aircraft_type_name, registration_number, aircraft_type_aircraft_class_name`; sort/filter `passengers_max, aircraft_type_cabin_height, aircraft_type_range_maximum, id`; detail `registration_number (lookup), passengers_max, aircraft_type_aircraft_class_name, aircraft_type_cabin_height/length/width, year_of_production, aircraft_type_range_maximum, extension_view_360, aircraft_type_name, company_name, airport_icao`. Everything else (booleans, PDF, extension_* details, airport_iata/name, type slug/speed/pax) is stored but never rendered. No DDL in either repo (**UNVERIFIED** origin; `migration_status` suggests an external import job).

### Table: aircraft_images (`aircraftImagesTable`)

(`:280-287`): `id serial PK`, `aircraft_id integer NN references aircrafts.id ON DELETE CASCADE`, `type text enum('exterior','cabin','cockpit') NN`, `url text NN`. Consumers: `getAircraftCovers` (`type='exterior'`, `order by aircraft_id, id`, first per aircraft), detail page (`with: { images: true }` — all types, DB order; `images[0]` = hero, `images[1]` = gallery default/second image, reversed list at the bottom), dead `getImages`. `url` values are absolute (must match `remotePatterns`; host **UNVERIFIED**).

### Table: migration_status (`migrationStatusTable`)

(`:289-293`): `id serial PK`, `last_processed_page integer`, `last_processed_slug text`. Unused by site/admin; bookkeeping of the (external) aircraft import. Preserve.

### 8.1 Aircraft lookup and listing pagination (quoted)

See §4 `/[locale]/aircraft` (`actions.ts:5-37`, page size 15, `offset = loaded.length`, load-more without sort/filter) and `/[locale]/aircraft/[id]` (`page.tsx:51-63`, `old.tsx:54-63`).

### 8.2 Yachts: `yachts` vs `new_yachts`

- `yachts` = legacy **sale** catalogue (`/sales_yachts` carousel; `pictures[]`, `shipyard`, `crew`, speeds).
- `new_yachts` = **charter** catalogue managed by `atmjet-admin` (`/yachts`, `/yachts/[id]`; `photos[]`, hourly `customer_price` + `currency`, `min_hours`, `included(_en)`, `slug`).
- Admin slug rule (`atmjet-admin/src/app/form/yachts/_actions/add-yacht.tsx:70-74`, same in `edit-yachts.tsx:83-87`): `name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_')` — non-ASCII (Cyrillic) names collapse to `''`/`_`, duplicates are not prevented (no unique index), and the site matches slugs with `ILIKE '%id%'`.

### 8.3 Empty legs

`select *` from `atmjet_admin__empty_legs` → 2 `airports` lookups per row (`ILIKE '%ICAO%' LIMIT 1`, English city/country) → cards with unresolved airports dropped; no ordering (`order` column ignored), no `end`/`start` expiry filtering; price shown as `$` with ×2.5 strike-through and a constant `-60%` badge.

### 8.4 `vehicles` is a mixed planes + yachts table

`source integer default 1` plus `yacht_*` columns indicate rows of both kinds; `/sales_dept` and the aircraft sitemap only filter on `tail_year`/`tail_number`, so yacht rows with empty tail fields are excluded by accident (`tail_number <> ''`) or sorted last (`NULLS LAST`). Which `source` value means what is **UNVERIFIED** (data profiling needed; plan E5.3/E5.8).

### 8.5 Airports autocomplete — live (`src/utils/getAiport.ts`)

```ts
if (!str || str.length < 2) return [str]
const searchTerm = `%${toTitleCase(str.trim())}%`                 // toTitleCase: /([^\s:\-])([^\s:\-]*)/g → first char upper, rest lower
query = db.select({ id, cityEn, cityRu, labelEn, labelRu, countryEn, countryRu, iata, icao, passengers }).from(newAirports)
  .where(or(ilike(cityEn), ilike(cityRu), ilike(labelEn), ilike(labelRu), ilike(aliesEn), ilike(aliesRu), ilike(countryEn), ilike(countryRu), ilike(iata), ilike(icao)))   // 10 columns, same term
  .orderBy(newAirports.passengers)                                   // passengers_per_year is TEXT → lexicographic ASC (NULLs last); not numeric, not descending
  .limit(20)
if (query.length === 0) return [str]
query = de-duplicated by (cityEn, cityRu, iata, icao)
return [str, ...query.map(item => `${city} ${ICAO ? `(${ICAO})` : ''} ${country}, ${label}`)]
//   city/country/label = locale==='ru' ? (ru || en) : (en || ru);  ICAO = item.icao || item.iata
// any error → console.error + [str]
```

`ilike` is case-insensitive, so the title-casing only affects the returned `str`? — no: the raw `str` is returned as element 0 and title-casing only feeds the LIKE pattern (no effect on matching). `performance.now()` timing is vestigial.

### 8.6 Airports autocomplete — dead (`src/app/actions.ts`)

Locale-branched version: RU searches `city_ru/label_ru/country_ru/iata/icao` with a title-cased term and returns `[toTitleCase(str), …]`; EN searches `city_en/label_en/country_en/iata/icao` and, when the term contains `st`, re-queries with `st→saint` and concatenates (no de-dupe); limit 20 each; no min length; unused `searchCache`/`CACHE_TTL` (5 min) and `formatResults`. Also `getAircrafts(offset)` over `vehicles` (§8 vehicles). Only `AllAircrafts` (dead) imports this file.

### 8.7 Unused tables and why they must be preserved

`city_list`, `contact`, `atmjet_admin__users`, `migration_status` are not read by the site. `contact` is referenced by `new_yachts.contact_id/captain_id` (data relationship, PII); `atmjet_admin__users` is the admin's auth store until E12.4; `migration_status`/`city_list` belong to unknown external tooling. Plan E5.2 restores the whole DB into a frozen `legacy` schema, so nothing may be dropped before E12.6.

### 8.8 DDL available only in `atmjet-admin/drizzle/*.sql`

| Migration (`_journal.json` `when`)           | Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0000_supreme_vin_gonzales.sql` (2024-08-11) | `CREATE TABLE IF NOT EXISTS "atmjet_admin__empty_legs" (id, start, end, from varchar(4), to varchar(4), type, company, safety, price integer default 0)`; `CREATE TABLE IF NOT EXISTS "atmjet_admin__users" (id, username varchar(256), password text)`                                                                                                                                                                                                                                  |
| `0001_overrated_hercules.sql` (2024-08-12)   | `ALTER TABLE "atmjet_admin__empty_legs" ADD COLUMN "order" integer;`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `0002_round_franklin_storm.sql` (2024-08-12) | `ALTER TABLE "atmjet_admin__empty_legs" ADD COLUMN "category" varchar(255);`                                                                                                                                                                                                                                                                                                                                                                                                             |
| `0003_powerful_moondragon.sql` (2025-02-25)  | `CREATE TABLE IF NOT EXISTS "new_yachts" (… 23 columns incl. "included_en" text, "photos" text[])`; three `CREATE INDEX IF NOT EXISTS` (`contact_idx`, `captain_idx`, `yacht_name_idx`); then, **in the same statement block without a `--> statement-breakpoint`**, `ALTER TABLE "new_yachts" ADD COLUMN "included_en" text;` — the column already exists in the CREATE → the ALTER fails (no `IF NOT EXISTS`) → **corrupt migration** (hand-edited; cannot be replayed on a fresh DB). |

`airports`, `new_airports`, `vehicles`, `yachts`, `contact`, `city_list`, `aircrafts`, `aircraft_images`, `migration_status` have **no DDL anywhere**; the only description is the Drizzle schema in the site repo (`src/lib/drizzle.ts`) — exact column types/constraints in production are **UNVERIFIED** (plan E5.3 archaeology).

### 8.9 Image URL hosts per column

| Column                             | Form                         | Host (from code)                                                                                                                         |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `vehicles.image`, `vehicles.thumb` | host+path **without scheme** | prefixed `https://` (VehicleCard) or `http://` (`old.tsx`); host UNVERIFIED                                                              |
| `yachts.pictures[]`                | absolute URL                 | must be `atmjet.ams3.cdn.digitaloceanspaces.com` or `atmjet.s3.eu-north-1.amazonaws.com` (next/image `remotePatterns`); UNVERIFIED which |
| `new_yachts.photos[]`              | absolute URL                 | S3 `https://<AWS_S3_BUCKET_NAME>.<AWS_S3_ENDPOINT>/yachts/<ts>-<file>` (admin); older rows UNVERIFIED                                    |
| `aircraft_images.url`              | absolute URL                 | must match `remotePatterns`; UNVERIFIED which host                                                                                       |
| PDFs (business_agents)             | absolute URL                 | `atmjet.ams3.cdn.digitaloceanspaces.com` (4 files, §9.4)                                                                                 |

## 9. Integrations, environment variables, external links

### 9.1 Telegram (`src/app/telegramBot.ts`)

- `'use server'` module. **Module-level guards** (`:6-7`): `if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is missing from environment')`, `if (!RAW_USERS) throw new Error('ALLOWED_USERS is missing from environment')` — evaluated when the server bundle containing the action loads (whether this fails the build or the first invocation is **UNVERIFIED**). `ALLOWED_USERS` = comma-separated chat ids, trimmed, empties dropped.
- `sendMessage(text, parseMode = 'MarkdownV2')`: **sequential** `fetch('https://api.telegram.org/bot${TOKEN}/sendMessage', POST JSON { chat_id, text, parse_mode })` per chat id; on the first non-OK response it logs `Telegram error for <id>: <status> <body>` and **throws** (`Failed to send to <id>: <status>`) — remaining recipients are skipped; returns `true` on success. `disable_web_page_preview` is typed but never sent. No retries, no persistence of leads.
- Caller: `BookingForm.onSubmit` (client → server action).

### 9.2 Kommo CRM (`src/app/api/post_data/route.ts`) — DEAD

`POST /api/post_data` reads **query params** (`name, phone_number, email, direction, from, locale, path`), builds `[{ name, _embedded: { contacts: [{ name, custom_fields_values: [ {field_id: 979514 → phone_number}, {979516 → email}, {1077072 → direction}, {1077074 → path}, {1076512 → locale}, {1077076 → from}, {1077074 → path /* duplicated */} ] }] } }]` and `axios.post('https://businessjet.kommo.com/api/v4/leads/complex', data, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRM_AUTH}`, 'Access-Control-Allow-Origin': '*' } })`. Returns `NextResponse.json(response)` (the **entire axios response object**, including request config with the `Authorization` header) and on failure `NextResponse.json(error)` with **status 200** (same leak). An older `fetch` implementation is commented out (`:84-104`). **No code calls this route.** No auth/rate limiting.

### 9.3 Analytics and cookies

- GTM `GTM-WF4PPKMZ` hard-coded (`layout.tsx:44`); `@vercel/analytics` `<Analytics/>` and `@vercel/speed-insights` `<SpeedInsights/>` unconditional; `cookies-next` consent cookies (§3.7) gate nothing.

### 9.4 Environment variables

| Variable                                                                                                                                       | Where                                                                          | Required?         | Purpose                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------- | ----------------------------------------- |
| `POSTGRES_URL`                                                                                                                                 | `@vercel/postgres` (implicit), `drizzle.config.ts:10`                          | yes (DB)          | Neon/Vercel Postgres connection (pooled)  |
| `TELEGRAM_BOT_TOKEN`                                                                                                                           | `src/app/telegramBot.ts:3`                                                     | yes (throws)      | bot token                                 |
| `ALLOWED_USERS`                                                                                                                                | `src/app/telegramBot.ts:4`                                                     | yes (throws)      | comma-separated Telegram chat ids         |
| `CRM_AUTH`                                                                                                                                     | `src/app/api/post_data/route.ts:110` (+ commented `:89`)                       | no (dead route)   | Kommo bearer token                        |
| `VERCEL_PROJECT_PRODUCTION_URL`                                                                                                                | `layout.tsx:17`, `page.tsx:24`, `sitemap.ts:5`, `aircraft/sitemap.ts:7`        | Vercel system var | base host for sitemap/OG URLs (no scheme) |
| `VERCEL_URL`                                                                                                                                   | same files                                                                     | Vercel system var | fallback host; then `'localhost:3000'`    |
| (admin) `POSTGRES_URL`, `NEXTAUTH_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_S3_ENDPOINT` | `atmjet-admin/.env` (tracked!), `.env.example`, `src/lib/s3.ts`, yacht actions | admin only        | see §14                                   |

`.env.local` is loaded by `dotenv` in `src/lib/drizzle.ts:19` and `drizzle.config.ts:4`. No `NEXT_PUBLIC_*` variables exist; GTM id, phone numbers, socials, PDF URLs and DB hosts are all hard-coded.

### 9.5 External links, phones, emails, socials, PDFs

| Target                                                                                                | Files                                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `https://t.me/melentev1` (Telegram DM)                                                                | `navbar.tsx:28`, `footer.tsx:40`, `angle_bar.tsx:48`, `booking_dialog.tsx:86`, `privilege.tsx:93`, `new_contact_us.tsx:33` |
| `https://wa.me/971504589926` (WhatsApp, +971 50 458 9926)                                             | `navbar.tsx:32`, `footer.tsx:44`, `angle_bar.tsx:52`, `booking_dialog.tsx:90`, `privilege.tsx:96`, `new_contact_us.tsx:52` |
| `https://www.instagram.com/atmjet/`                                                                   | `navbar.tsx:36`, `footer.tsx:48`, `angle_bar.tsx:56`, `booking_dialog.tsx:94`                                              |
| `tg:\\nesolve?domain=@atmjet1` (**malformed**, literal backslashes; Telegram channel `@atmjet1`)      | `empty_leg.tsx:53`                                                                                                         |
| `tel:+971585940112` (**+971 58 594 0112**) shown as `+971 (50) 458-99-26` (`footer.phone`)            | `booking_dialog.tsx:99`                                                                                                    |
| `tel:+971(585)940-112` (same 58-number, punctuated) shown as `+971 (50) 458-99-26`                    | `new_contact_us.tsx:85-89`                                                                                                 |
| `mailto:info@atmjet.com` / text `info@atmjet.com`                                                     | `new_contact_us.tsx:80-84`                                                                                                 |
| Text `Dubai +971 (50) 458-99-26` (`footer.location`), `+971 (50) 458-99-26` (`footer.phone`)          | `footer.tsx:68`, `booking_dialog.tsx:100`                                                                                  |
| PDF `…/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20EN.pdf` / `…RU.pdf` | `business_agents/page.tsx:29-30`                                                                                           |
| PDF `…/presentation/ATM%20JET%20Presentation.pdf` / `…Presentation%20RU.pdf`                          | `business_agents/page.tsx:34-35`                                                                                           |
| `https://api.telegram.org/bot<token>/sendMessage`                                                     | `telegramBot.ts:34`                                                                                                        |
| `https://businessjet.kommo.com/api/v4/leads/complex`                                                  | `route.ts:85,107`                                                                                                          |
| `https://atmjet.com/sitemap.xml`                                                                      | `robots.ts:10`                                                                                                             |
| `https://restcountries.com/v3.1/all?fields=name,cca2,idd`                                             | `scripts/number-iso.js:4`                                                                                                  |
| `https://api.tinify.com/shrink`                                                                       | `optimize.ps1:13`                                                                                                          |

Two different phone numbers are in play: **+971 50 458 99 26** (displayed everywhere, WhatsApp) and **+971 58 594 0112** (both `tel:` links). Plan E4.2 marks phones as a decision.

## 10. Styling and animation contract

### 10.1 `src/app/[locale]/globals.css` — element rules (verbatim `@apply` lists)

| Selector                                                                                | Rule                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@layer utilities .no-scrollbar`                                                        | `::-webkit-scrollbar { display:none }`, `-ms-overflow-style:none; scrollbar-width:none`                                                                                                                                                                                       |
| `:root`                                                                                 | `@apply scroll-smooth bg-gray-100 text-sm text-gray-600 lg:text-base;`                                                                                                                                                                                                        |
| `*`                                                                                     | `box-sizing: border-box; margin: 0;`                                                                                                                                                                                                                                          |
| `div`                                                                                   | `@apply flex flex-col;` (**every div is a flex column**)                                                                                                                                                                                                                      |
| `section`                                                                               | `@apply relative flex flex-col items-center justify-center;`                                                                                                                                                                                                                  |
| `button, .button`                                                                       | `@apply rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-100 hover:opacity-75;`                                                                                                                                                                             |
| `button.big`                                                                            | `@apply rounded-2xl px-8 py-4 text-lg font-normal;`                                                                                                                                                                                                                           |
| `button.middle`                                                                         | `@apply rounded-lg px-6 py-3 text-base font-normal;`                                                                                                                                                                                                                          |
| `button.middle.dark`                                                                    | `@apply border border-gray-900 bg-transparent text-gray-900;`                                                                                                                                                                                                                 |
| `input`                                                                                 | `@apply rounded-sm bg-gray-900 px-4 py-4 text-sm font-normal text-gray-100;` + `-webkit-appearance:none; appearance:none;`                                                                                                                                                    |
| `input.dark`                                                                            | `@apply border-b border-gray-600 bg-transparent text-gray-900 placeholder:text-gray-600;` (no live consumer)                                                                                                                                                                  |
| `a`                                                                                     | `@apply py-2;`                                                                                                                                                                                                                                                                |
| `h1,h2,h3,h4`                                                                           | `@apply font-serif text-gray-900;`                                                                                                                                                                                                                                            |
| `h1`                                                                                    | `@apply text-5xl lg:text-6xl;`                                                                                                                                                                                                                                                |
| `h2`                                                                                    | `@apply text-4xl lg:text-5xl;`                                                                                                                                                                                                                                                |
| `h3`                                                                                    | `@apply text-2xl lg:text-3xl;`                                                                                                                                                                                                                                                |
| `h4`                                                                                    | `@apply text-xl lg:text-2xl;` (no live consumer)                                                                                                                                                                                                                              |
| `hr`                                                                                    | `@apply border-t border-gray-300;`                                                                                                                                                                                                                                            |
| `.container`                                                                            | `@apply relative my-10 flex max-w-screen-xl flex-col px-6 md:px-10 lg:px-16;` (Tailwind's own `.container` is also generated: `width:100%` + breakpoint max-widths, centered? — no `container.center` config, so **not centered**; `mx-auto` is added where needed)           |
| `.card`                                                                                 | `@apply rounded-3xl border border-gray-400;`                                                                                                                                                                                                                                  |
| `.darkening`                                                                            | four stacked `linear-gradient`s toward `#171614` (0deg from 15%…100%, 90deg from 48.46%…100%, 270deg from 50%…100%, 180deg from 1.82%…81.23%) — full stop lists at `globals.css:100-178`                                                                                      |
| `.hero-darkening`                                                                       | `linear-gradient(0deg, rgba(26,26,26,0) 66.34% … #1a1a1a 96.56%)`, `linear-gradient(180deg, rgba(26,26,26,0) 53.66% … #1a1a1a 100%)`, `rgba(26,26,26,0.7)` — `globals.css:180-221`                                                                                            |
| `.option-darkening`                                                                     | `linear-gradient(270deg, rgba(23,22,20,0) -28.59% … #171614 110.26%)` — `globals.css:223-243`                                                                                                                                                                                 |
| `body`                                                                                  | `color: rgb(var(--foreground-rgb)); background: linear-gradient(to bottom, transparent, rgb(var(--background-end-rgb))) rgb(var(--background-start-rgb));` — **all three variables undefined** → invalid values → body keeps `:root` colours (`bg-gray-100`, `text-gray-600`) |
| `@layer utilities .text-balance`                                                        | `text-wrap: balance`                                                                                                                                                                                                                                                          |
| `@font-face`                                                                            | `TARegressoPROEasyRegular`, `url('/fonts/TARegressoPROEasyRegular/font.woff2') format('woff2'), url('…/font.woff') format('woff')`, normal/normal                                                                                                                             |
| commented block                                                                         | `input[type='range']` thumb/track styles (`:266-281`)                                                                                                                                                                                                                         |
| `.react-tel-input`, `.react-tel-input .form-control`, `.react-tel-input .flag-dropdown` | overrides for `react-phone-input-2` (`w-full`; `w-full rounded-none border-b border-gray-600 bg-transparent py-4 pl-14 text-gray-900 placeholder:text-gray-600` + `border-left/top/right: none !important`; transparent flag dropdown) — **dead** (library unused)            |

Undefined CSS variables referenced: `--foreground-rgb`, `--background-start-rgb`, `--background-end-rgb` (body), `--radius` (Tailwind `rounded-lg/md/sm` **are overridden** by `extend.borderRadius` → `rounded-lg` = `var(--radius)` = invalid → these three utilities render **no border radius** wherever used: e.g. `rounded-lg` in `button.middle`, chips in PersonalManager, OptionCard list items, carousel arrows, Gallery thumbs, EmptyLegCard badge `rounded-lg`, `rounded-md` in `form/select.tsx`, charter YachtCard price badge; `rounded-sm` in `input`, Checkbox, CounterInput), and all shadcn `hsl(var(--…))` colours (`bg-background`, `bg-primary`, …).

### 10.2 `tailwind.config.ts` tokens

- Gray ramp (inverted: low = dark): `100 #1A1A1A`, `150 #171614`, `200 #1E1E1E`, `300 #2C2C2C`, `400 #474444`, `500 #707070`, `600 #A2ABAD`, `700 #C0C9CB`, `800 #F0F1F6`, `900 #FFFFFF`. Default Tailwind colours other than gray remain available (`red-500`, `red-50`, `blue-600`, `orange-200`, `black`, `white`, `neutral-900` are used).
- `backgroundImage.gold` (verbatim): `linear-gradient(22deg, #DFAB53 -24.85%, #E6BE6B -7.56%, #EFD487 12.04%, #EBCA7A 33.04%, #DFAB53 98.1%), linear-gradient(180deg, rgba(21, 21, 21, 0.00) 0%, rgba(21, 21, 21, 0.01) 6.67%, rgba(21, 21, 21, 0.04) 13.33%, rgba(21, 21, 21, 0.08) 20%, rgba(21, 21, 21, 0.15) 26.67%, rgba(21, 21, 21, 0.23) 33.33%, rgba(21, 21, 21, 0.33) 40%, rgba(21, 21, 21, 0.44) 46.67%, rgba(21, 21, 21, 0.56) 53.33%, rgba(21, 21, 21, 0.67) 60%, rgba(21, 21, 21, 0.77) 66.67%, rgba(21, 21, 21, 0.85) 73.33%, rgba(21, 21, 21, 0.92) 80%, rgba(21, 21, 21, 0.96) 86.67%, rgba(21, 21, 21, 0.99) 93.33%, #151515 100%)` — used as `bg-gold` (buttons, badges, border wrappers) and `bg-gold bg-clip-text text-transparent` (gold text), often with `md:bg-fixed`.
- Fonts: `sans: ['Inter','sans-serif']`, `serif: ['TARegressoPROEasyRegular','serif']`.
- Radius: `lg: var(--radius)`, `md: calc(var(--radius) - 2px)`, `sm: calc(var(--radius) - 4px)` (undefined → see 10.1).
- Plugin: `tailwindcss-animate`. Custom classes used but **not defined anywhere** (no-ops): `duration-600`, `aspect-w-1`, `aspect-h-1`, `md:object-fixed`, `min-h-[680]`, `btn`, `btn-primary`, `color-gray`, `border-gold`, `focus:border-gold`, `bg-background`, `props`, `embla*`.

### 10.3 z-index map

| z                 | Element                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `z-[999]`         | Preloader logo layer; `form/autocomplete.tsx` dropdown                                                                                                                                               |
| `z-[998]`         | Preloader background                                                                                                                                                                                 |
| `z-[901]`         | CookiesModal                                                                                                                                                                                         |
| `z-[900]`         | CookiesConsent banner                                                                                                                                                                                |
| `z-50`            | HeaderSection bar; BookingDialog overlay; `elements/autocomplete.tsx` dropdown; (dead ui: dialog/popover/tooltip)                                                                                    |
| `z-40`            | Navbar overlay; AngleBar FAB                                                                                                                                                                         |
| `z-30`            | AngleBar section; ImagesCarousel dots                                                                                                                                                                |
| `z-20`            | hero text containers (`hero`, `hero_sales`, `hero_yachts`) and their `©ATM JET`                                                                                                                      |
| `z-10`            | `hero-darkening` overlays, `option-darkening`, hero-band gradients, KeyFeatureCard text, options tile links/h2, direction labels, checkbox check, group card content, phone dropdown, AngleBar icons |
| `z-0`             | hero media                                                                                                                                                                                           |
| `-z-[1]`          | detail hero bands                                                                                                                                                                                    |
| `-z-10` / `-z-20` | option tile overlays/images, aircraft contact card overlays/image                                                                                                                                    |
| `-z-50`           | footer background image                                                                                                                                                                              |

### 10.4 `tailwindcss-animate` usages (enter animations; defaults: duration 150 ms, `fade-in` = from opacity 0, `spin-in` = from rotate 30deg, `slide-in-from-top-10` = from translateY(-2.5rem), `slide-in-from-top-4` = -1rem)

| File:line                                                                                 | Classes                                                      | Effective timing                  |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------- |
| `header.tsx:70,72`                                                                        | `h-8 animate-in spin-in` (Close / BurgerMenu)                | 150 ms                            |
| `angle_bar.tsx:26,31`                                                                     | `… animate-in spin-in`                                       | 150 ms                            |
| `navbar.tsx:11`                                                                           | `duration-200 animate-in fade-in` (overlay)                  | 200 ms                            |
| `navbar.tsx:14,27,46`, `footer.tsx:31,39,55`, `angle_bar.tsx:47`, `booking_dialog.tsx:85` | `[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in`          | 150 ms (`duration-600` undefined) |
| `hero_sales.tsx:12`, `hero_yachts.tsx:29`                                                 | `duration-1000 animate-in fade-in slide-in-from-top-10` (h1) | 1000 ms                           |
| `cookies_consent.tsx:35`                                                                  | `duration-300 animate-in fade-in slide-in-from-top-10`       | 300 ms                            |
| `cookies_modal.tsx:40`, `booking_dialog.tsx:71`                                           | `duration-300 animate-in fade-in-0`                          | 300 ms                            |
| `request_flight.tsx:72` (commented)                                                       | `duration-500 animate-in fade-in-0 slide-in-from-top-4`      | dead                              |
| `privilege.tsx:75`                                                                        | `repeat-infinite` (no animation attached)                    | no-op                             |
| `ui/*` (dead)                                                                             | radix `data-[state]` enter/exit sets                         | dead                              |

CSS transitions: `header.tsx:61` `transition-all duration-700`; `aircraft_card.tsx:36` & `yachts/yacht_card.tsx:77` `transition-transform duration-300 ease-out group-hover:scale-125`; `new_contact_us.tsx:34,53` `transition-all ease-out` (hover gradient stop), `:81,86` `transition-opacity duration-300 ease-in-out hover:opacity-40`; `booking.tsx:431` chip `transition-colors`; global `button:hover { opacity: .75 }` (no transition).

### 10.5 framer-motion usages

| Component                                                                            | initial → animate/whileInView                                                                                                               | transition                                | once?               |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------- |
| Preloader (§3.8)                                                                     | keyframes                                                                                                                                   | bg `0.5s delay 2s`; logo `4s`             | mount               |
| Line                                                                                 | `{width:0}` → `whileInView {width:'100%'}`                                                                                                  | `1s`                                      | no (re-runs)        |
| Counter                                                                              | `{opacity:0,y:-20}` → controls `{opacity:1,y:0}`                                                                                            | `0.5s` (+ 800 ms count)                   | no (resets on exit) |
| Accordion                                                                            | title opacity `100%`↔`80%`; content `height 0 → auto`, exit `0` (`AnimatePresence initial={false}`)                                         | `0.4s`                                    | —                   |
| WhyUsCard, EmptyLegCard, YachtsCard (×3 blocks), AdvantagesSection (card + 3 blocks) | `{opacity:0,y:-50}` → `whileInView {opacity:1,y:0}`                                                                                         | `0.5s`                                    | no                  |
| KeyFeatureCard, TestimonialsCard (dead)                                              | `{opacity:0}` → `whileInView {opacity:1}`                                                                                                   | `0.5s`                                    | no                  |
| TilesSection                                                                         | variants `hidden {opacity:0,scale:0}` / `visible {opacity:1,scale:1}`, driven by `useInView({triggerOnce:true, threshold:0.5})` on the grid | `0.4s`, `delay index*0.1`                 | yes                 |
| NewContactUs (4 blocks)                                                              | `{opacity:0,y:-100}` → `{opacity:1,y:0}` when `inView` (`triggerOnce`, `0.5`)                                                               | `0.5s easeOut`, delays `0.3, 0.3, 0.6, 0` | yes                 |

`react-intersection-observer` is used in `counter.tsx` (`useInView()` default), `tiles.tsx`, `new_contact_us.tsx`.

### 10.6 Parallax / `bg-fixed` usages

`footer.tsx:15` (`md:bg-fixed` on the section — the actual image is a `fill` `<Image>`, so the class has no visual effect), `empty_leg.tsx:50` (`md:bg-fixed` on a gradient card), `new_contact_us.tsx:34,53` (`md:bg-fixed` gradient cards), `privilege.tsx:75` (`bg-fixed` pattern), `key_features.tsx:18`, `hero_sales.tsx:13,18`, `why_us_card.tsx:28` (`md:bg-fixed` on gold **text** gradients → the gradient is fixed to the viewport while scrolling), `testimonials_carousel.tsx:29` (progress bar), `yachts/[id]/page.tsx:125` (`bg-fixed` hero photo), `aircraft/[id]/old.tsx:95` (`md:bg-fixed` hero), dead `contact_us.tsx:16`. `aircraft/page.tsx:42` uses `class="fixed"` on a `fill` image (viewport-fixed). Safari/iOS ignores `background-attachment: fixed` (plan E2.9).

### 10.7 `arrows.css`

Dead (never imported). See §6.

## 11. i18n catalog (`messages/{en,ru,uk}/*.json`)

Loaded by `src/i18n.ts` as one flat object per locale (13 files). Totals (leaf keys): **en 384, ru 384, uk 375**. No namespace collisions across files.

### 11.1 Namespaces per file (leaf-key counts, identical in en/ru)

| File                    | Namespaces (keys)                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `aircraft.json`         | `aircraft-hero`(4), `aircraft-contact-us`(3), `our-fleet`(8), `vehicle`(21)                                                                                                                |
| `atm_jet_group.json`    | `atm-jet-hero`(3), `group1`(3), `group2`(3), `yachts`(11)                                                                                                                                  |
| `business_agents.json`  | `business-agents-hero`(1), `guide`(3), `documents`(4), `best-price`(3)                                                                                                                     |
| `cargo.json`            | `cargo-hero`(2), `cargo-why-us`(9), `cargo-form`(4)                                                                                                                                        |
| `citizens.json`         | `citizens-hero`(2), `citizens-why-us`(6), `quote`(3)                                                                                                                                       |
| `empty_leg.json`        | `empty-leg-hero`(4), `empty-leg-descriptor`(2), `empty-leg`(6), `empty-leg-contact-us`(3)                                                                                                  |
| `group_charters.json`   | `group-charters-hero`(2), `group-charters-cards`(6)                                                                                                                                        |
| `home_page.json`        | `home-hero`(1), `form`(13), `home-why-us`(16), `key-features`(12), `options`(3), `privilege`(12), `testimonials`(16), `transfer`(3), `faq`(11), `contact-form`(11)                         |
| `medical_aviation.json` | `medical-hero`(2), `medical-key-features`(10), `medical-contact-us`(2)                                                                                                                     |
| `misc.json`             | `locale`(6), `social-media`(3), `navigation`(13), `cookies`(13), `footer`(4)                                                                                                               |
| `partners.json`         | `partners-hero`(4), `instant-payment`(3), `we-offer`(11), `personal-flight-manager`(4), `partners-contact-us`(3)                                                                           |
| `sales_dept.json`       | `sales-hero`(7), `personal-manager`(3), `aircraft`(1), `sales-options`(7), `aircraft-descriptor`(7), `sales-why-us`(10), `sales-contact-us`(3)                                             |
| `yachts.json`           | `yachts-hero`(5), `yachts-charter-hero`(5), `carousel`(10), `yachts-descriptor`(1), `recent-yachts`(1), `we-incpect`(11), `yachts-options`(7), `yachts-why-us`(11), `yachts-contact-us`(3) |

### 11.2 `uk` gaps (10 missing keys + 1 typo key)

| File             | Missing in `uk`                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home_page.json` | `form.passengers` (present as **`form.passangers`** = `Пасажири`, `messages/uk/home_page.json:10`), `key-features.card5.title`, `key-features.card5.description` |
| `misc.json`      | `navigation.sales-yachts`                                                                                                                                        |
| `partners.json`  | `partners-hero.description`                                                                                                                                      |
| `yachts.json`    | `yachts-charter-hero.overline`, `.title`, `.description`, `.description2`, `.button` (whole namespace)                                                           |

`uk` is not routable today (§2.2); the `locale.uk` label (`Укр`) exists in all three catalogs and the switcher link is commented out.

### 11.3 Line-break / list conventions inside message values

- Literal two-character `\n` sequences (JSON `"\\n"`) split by `.split('\\n')`: `vehicle.description`, `faq.answer1..5` (spaces around: `. \n `), `sales-hero.description`.
- `' \n'` (space + literal `\n`) separated lists split by `.split(' \\n')`: `sales-options.card1.list`, `sales-options.card2.list`, `yachts-options.card1.list`, `yachts-options.card2.list`.
- `;` separated chips: `personal-manager.chips` (5 items).
- Sentence split on `.` (DB content, not messages): yacht descriptions (§4).
- ICU placeholders: `footer.copyright` `{year}`; `vehicle.description` `{tailModel} {tailNumber} {tailOperator} {tailYear} {tailHomebase} {tailMaxpax}`.

### 11.4 Orphaned / unused keys

Never referenced by any code (39, static analysis): `our-fleet.title`, `our-fleet.turbo-prop`, `our-fleet.super-light-jets`, `our-fleet.super-midsize-jets`, `our-fleet.ultra-long-range-jets`, `vehicle.tail-vendor`, `vehicle.tail-weight`, `vehicle.yacht-maxspeed`, `vehicle.yacht-speed`, `vehicle.yacht-winter-areas`, `vehicle.yacht-summer-areas`, `vehicle.yacht-guests`, `vehicle.yacht-year`, `vehicle.yacht-builder`, `vehicle.yacht-length`, `cargo-form.from`, `cargo-form.to`, `empty-leg-contact-us.{title,description,button}`, `transfer.button`, `contact-form.description`, `contact-form.phone-placeholder`, `medical-contact-us.{title,button}`, `locale.{english,russian,ukrainian}`, `instant-payment.button`, `we-offer.title`, `sales-contact-us.{title,description,button}`, `yachts-charter-hero.{overline,button}`, `yachts-why-us.subtitle`, `yachts-contact-us.{title,description,button}`.

Referenced only by dead or commented code: `our-fleet.{light-jets,midsize-jets,heavy-jets}` (dead `aircraft/old.tsx`), `testimonials.*` (16, dead section), `cargo-form.{title,button}` (dead section), `personal-flight-manager.*` (4, dead section), `partners-contact-us.*` (3, comments), `instant-payment.{title,description}` (comment), `transfer.subtitle` (comment), `yachts.description2` (comment), `quote.button` (comment), `locale.uk` (comment), `form.confirm` (commented block). Whole namespaces with **no live consumer**: `our-fleet`, `testimonials`, `cargo-form`, `personal-flight-manager`, `partners-contact-us`, `instant-payment`, `empty-leg-contact-us`, `medical-contact-us`, `sales-contact-us`, `yachts-contact-us`.

Live namespaces: `aircraft-hero`, `aircraft-contact-us`, `vehicle` (11 of 21 keys, via the fallback layout + description), `atm-jet-hero`, `group1`, `group2`, `yachts`, `business-agents-hero`, `guide`, `documents`, `best-price`, `cargo-hero`, `cargo-why-us`, `citizens-hero`, `citizens-why-us`, `quote`, `empty-leg-hero`, `empty-leg-descriptor`, `empty-leg`, `group-charters-hero`, `group-charters-cards`, `home-hero`, `form`, `home-why-us`, `key-features`, `options`, `privilege`, `transfer`, `faq`, `contact-form`, `medical-hero`, `medical-key-features`, `locale`, `social-media`, `navigation`, `cookies`, `footer`, `partners-hero`, `we-offer`, `personal-manager`, `sales-hero`, `aircraft`, `sales-options`, `aircraft-descriptor`, `sales-why-us`, `yachts-hero`, `yachts-charter-hero`, `carousel`, `yachts-descriptor`, `recent-yachts`, `we-incpect`, `yachts-options`, `yachts-why-us`.

### 11.5 Hard-coded UI strings outside the message files (by file)

| File                                                                                                                                                                        | Strings                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[locale]/layout.tsx:19-23`                                                                                                                                         | title `ATM JET - Flying private made simple`; RU/EN descriptions (never emitted)                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/app/[locale]/page.tsx:26-33`                                                                                                                                           | RU/EN title + description (metadata)                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/components/sections/hero.tsx:13,15`                                                                                                                                    | `ATM JET`, `©ATM JET`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `sections/hero_sales.tsx:36`, `sections/hero_yachts.tsx:37`                                                                                                                 | `©ATM JET`                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `sections/new_contact_us.tsx:36-40,55-59,80-91`                                                                                                                             | `Telegram`, `Whatsapp`, 2 RU/EN card descriptions, `info@atmjet.com`, `+971 (50) 458-99-26`, `Telephone line is open 24/7` / `Телефонная линия открыта 24/7`                                                                                                                                                                                                                                                                                                      |
| `components/form/booking.tsx:23-34,112,239-242,337`                                                                                                                         | zod messages `Required`, `Invalid email`, `Invalid phone number`; placeholder `${code} 123 456 789`; chips RU `Запрос на партнерство / пресс / другое`, EN `Partnership request / press / other`; `Search`; Telegram message labels (English)                                                                                                                                                                                                                     |
| `components/form/direction.tsx:7-17`                                                                                                                                        | `From is required`, `Date is required`, `Invalid date format`, `passengers must be a positive number`                                                                                                                                                                                                                                                                                                                                                             |
| `app/[locale]/aircraft/aircraft_list.tsx:41-104`                                                                                                                            | `Filter aircraft`/`Фильтровать самолеты`, `Sort by`/`Сортировать по`, `Size`/`Размер`, `Passangers`/`Пассажиры`, `Range`/`Дальность`, `Order`/`Порядок`, `Ascending`/`Возрастанию`, `Descending`/`Убыванию`, `Show more`/`Показать еще` (+ commented Type options)                                                                                                                                                                                                |
| `app/[locale]/aircraft/[id]/page.tsx:23-48,133-144,193`                                                                                                                     | `statsLabel` en/ru (`max pax`/`макc пассажиров`, `type`/`тип`, `cabin height`/`высота салона`, `lenght/width`/`длина/ширина`, `year`/`год`, `range`/`дальность`), `From`/`Откуда`, `To`/`Куда`, `Date`/`Дата`, `Request {reg}`, `Key stats`/`Основые факты`; units `m`, `km`                                                                                                                                                                                      |
| `app/[locale]/aircraft/[id]/old.tsx:37`                                                                                                                                     | `ATM JET                                                                                                                                                                                                                                                                                                                                                                                                                                                          | {tailModel}` (dead) |
| `app/[locale]/yachts/filter_section.tsx:76-169`                                                                                                                             | all labels/options (table in §4) + `Apply`/`Применить`                                                                                                                                                                                                                                                                                                                                                                                                            |
| `app/[locale]/yachts/YachtsSection.tsx:103-116`                                                                                                                             | `Yachts available for rent in Dubai`/`Яхты доступные в аренду в Дубае`, `No yachts found`, `Reset filters`                                                                                                                                                                                                                                                                                                                                                        |
| `app/[locale]/yachts/yacht_card.tsx:29-54,86,102-113`                                                                                                                       | `guests`/`гостей`, `ft`/`m`/`фт`/`м`, `cabins`/`каюты`, `min … hours`/`мин … час(а/ов)`, `bathrooms`/`ванные`, `refit`/`ремонт`, `per hour`/`за час`                                                                                                                                                                                                                                                                                                              |
| `app/[locale]/yachts/[id]/page.tsx:17-61,102,174-177,198,216-225`                                                                                                           | `statsLabel` en/ru (`pax day/night`, `lenght ft/m`, `cabins`, `bathrooms`, `min rental hours`, `refit`, `Included in the price:`) and RU equivalents, `inputLabel` en/ru (`From/Date/Hours/Guests`), `${minHours} hours`, `Request {name}`, `Hour`/`Час`, `Key stats`/`Основые факты`, `About`/`Об`                                                                                                                                                               |
| `app/[locale]/partners/page.tsx:65`                                                                                                                                         | `Clients benefit`/`Клиенты выбирают нас`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `app/[locale]/sales_dept/page.tsx:87`                                                                                                                                       | WhyUs title `ATM JET`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `app/[locale]/citizens/page.tsx:67-72`                                                                                                                                      | founder quote (RU) + `Артем Румянцев - основатель ATM JET`                                                                                                                                                                                                                                                                                                                                                                                                        |
| `components/elements/yacht_card.tsx:9,17-35`                                                                                                                                | `Guests:`, `Cabins:`, `Crew:`, `Shipyard:`, `Year built:`, `Length:` + `feet`, `Beam:`, `Draft:`, `Cruising speed:`, `Max speed:`, `Location:`, `${length}m ${shipyard} yacht …`                                                                                                                                                                                                                                                                                  |
| `components/elements/vehicle_card.tsx:17,21`                                                                                                                                | `Year:`, `Pax:`                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `components/elements/empty_leg_card.tsx:27-43`                                                                                                                              | `en-US` date format, `$`, `N/A`, `-60%`, `->`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `components/sections/all_aircrafts.tsx:33` (dead)                                                                                                                           | `Show more`/`Показать еще`                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `components/sections/header.tsx:67,75`                                                                                                                                      | aria-labels `Open/Close menu button`, `Logotype, leads to home page`                                                                                                                                                                                                                                                                                                                                                                                              |
| alt texts                                                                                                                                                                   | `footer.tsx:17` (cabin description), `transfer.tsx:15` `Image of black car`, `options.tsx:22,40` `For Business Agents`, `best_price.tsx:20` `Best price`, `hero_sales.tsx:41` `Hero sales`, `hero_yachts.tsx:44` `yacht`, `personal_manager.tsx:17` `personal manager`, `tiles.tsx:33` `Tile {n}`, `images_carousel.tsx:29` `Slide {i}`, `sales_yachts/page.tsx:97` `Image of a yacht`, `aircraft/page.tsx:40` `aircraft`, `privilege.tsx:13-15` icon `alt` props |
| `components/sections/personal_manager.tsx:14`                                                                                                                               | stray text `aaa`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| dead: `form/phone-input.tsx` (`Search country...`, `No country found.`), `elements/range_slider.tsx` (`Price Range`, `Use slider or enter min and max price`, `Min`, `Max`) |                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## 12. Assets

### 12.1 `public/` summary (187 files; 88 referenced incl. the `en/video` duplicates, 99 unreferenced = 51.1 MB)

| Folder                                   | Files | webp/jpg/png/svg           | Bytes      | Notes                                                                                                                                                                                                                                                 |
| ---------------------------------------- | ----- | -------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/video/`                          | 3     | mp4                        | 47,003,250 | `background.mp4` 17.7 MB (unused "mobile" variant), `background_full.mp4` 16.5 MB (hero), `hero_background.mp4` 12.8 MB (**unreferenced**)                                                                                                            |
| `public/en/video/`                       | 3     | mp4                        | 47,003,250 | byte-identical **duplicate** of `public/video/` (exists because the hero `<source>` path is relative, §5)                                                                                                                                             |
| `public/fonts/TARegressoPROEasyRegular/` | 2     | woff2 66,904 / woff 69,296 | 136,200    | serif face                                                                                                                                                                                                                                            |
| `public/images/aircraft/`                | 1     | png                        | 2,493,861  | `aircraft.png` (2.5 MB, used)                                                                                                                                                                                                                         |
| `public/images/atm_jet_group/`           | 10    | 5/5/0/0                    | 1,499,306  | `group1/2.webp`, `yachts.webp` used; `atmjetgroup_atmjet*`, all `.jpg` unused                                                                                                                                                                         |
| `public/images/business_agencies/`       | 11    | 6/5/0/0                    | 483,708    | webp all used (`hero.webp` by `/group_charters`, `insurance2.webp` by `/partners`)                                                                                                                                                                    |
| `public/images/cargo_charter/`           | 12    | 6/6/0/0                    | 930,525    | `contact_us.webp` only in a comment                                                                                                                                                                                                                   |
| `public/images/citizens/`                | 12    | 6/6/0/0                    | 890,895    | `why_us_foreignaircraft.webp` exists; code asks for `why_us_foreignaircraft**s**.webp` (**missing file**)                                                                                                                                             |
| `public/images/empty_legs/`              | 1     | png                        | 1,773,002  | `hero.png` 1.77 MB used                                                                                                                                                                                                                               |
| `public/images/group_charter/`           | 6     | 3/3/0/0                    | 8,665,126  | `card2.webp` **4.2 MB** used; `card3.*` unused                                                                                                                                                                                                        |
| `public/images/home_page/`               | 35    | 16/17/2/0                  | 11,648,453 | `footer.jpg` 1.5 MB used although `footer.webp`/`footer.png` exist; `key_features_shampain.jpg` 1.9 MB (no webp); `2-for-business-agents.webp` 1.59 MB; `For-business-agents-two.*` (1.59 MB) unused; `artem.*` only in a comment; `pattern.png` used |
| `public/images/jets_dep/`                | 18    | 9/9/0/0                    | 2,157,008  | `jetsmarket_page_team_contactus.*` unused                                                                                                                                                                                                             |
| `public/images/medical/`                 | 12    | 6/6/0/0                    | 7,625,862  | `contact-us.webp` 3.7 MB + `.jpg` 3.2 MB **unused**                                                                                                                                                                                                   |
| `public/images/partners/`                | 7     | 4/3/0/0                    | 1,098,053  | `contact_us.webp` only in a comment; `payment.jpg` used (no webp)                                                                                                                                                                                     |
| `public/images/testimonials/`            | 7     | 2/2/3/0                    | 158,726    | all only used by the dead TestimonialsSection                                                                                                                                                                                                         |
| `public/images/tiles/`                   | 16    | 8/8/0/0                    | 657,044    | `slice_0..7.webp` used                                                                                                                                                                                                                                |
| `public/images/yachts/`                  | 31    | 13/13/0/5                  | 3,770,373  | 5 SVG illustrations used by WeInspect; `yacht_page_contactus.*`, `yacht_page_perfectone_*` (4 pairs) unused                                                                                                                                           |

- jpg/webp twins: **81 pairs** (the `.jpg` side is unreferenced in every pair except `footer.jpg`, which is used _instead of_ its webp twin). webp without jpg: `business_agencies/insurance2.webp`, `partners/white-label.webp`, `partners/label.webp`. jpg without webp: `home_page/key_features_shampain.jpg`, `partners/payment.jpg`.
- Files > 1 MB: the 6 videos, `group_charter/card2.{webp,jpg}` (4.2/3.7 MB), `medical/contact-us.{webp,jpg}` (3.7/3.2 MB, unused), `aircraft/aircraft.png` 2.5 MB, `home_page/key_features_shampain.jpg` 1.9 MB, `empty_legs/hero.png` 1.77 MB, `home_page/{2-for-business-agents,For-business-agents-two}.{webp,jpg}` (~1.6 MB each), `home_page/footer.jpg` 1.5 MB.
- Full unreferenced list: `/tmp` script output in this session (99 paths) — every `.jpg` twin, `atm_jet_group/atmjetgroup_*`, `business_agencies/*.jpg`, `cargo_charter/contact_us.*`, `citizens/why_us_foreignaircraft.*`, `group_charter/card3.*`, `home_page/{For-business-agents-two.*, artem.*, footer.png, footer.webp}`, `jets_dep/jetsmarket_page_team_contactus.*`, `medical/contact-us.*`, `partners/contact_us.*`, `testimonials/*` (live code), `yachts/yacht_page_contactus.*`, `yachts/yacht_page_perfectone_*`, `video/hero_background.mp4`, `en/video/hero_background.mp4`.

### 12.2 Public files by consumer

| Component / page                              | Files                                                                                                                                                                                                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HeroSection                                   | `video/background_full.mp4` (relative)                                                                                                                                                                                                                         |
| Home `generateMetadata`                       | `/video/background_full.mp4` (og:video)                                                                                                                                                                                                                        |
| FooterSection                                 | `/images/home_page/footer.jpg`                                                                                                                                                                                                                                 |
| Home / `/business_agents` / `/partners` WhyUs | `/images/home_page/why_us_{years,clients,trusted_by_celeb,same_day_departure,excellence}.webp`                                                                                                                                                                 |
| Home KeyFeatures                              | `/images/home_page/key_features_{tailoredp_references,cuztomized_aircrafts,payment_after_flight,pay_anyway}.webp`, `key_features_shampain.jpg`                                                                                                                 |
| OptionsSection                                | `/images/home_page/For-Business-Agents-one.webp`, `/images/home_page/2-for-business-agents.webp`                                                                                                                                                               |
| PrivilegeContact                              | `/images/home_page/pattern.png`                                                                                                                                                                                                                                |
| YachtsCard (promo)                            | `/images/home_page/yachts.webp`, `/images/atm_jet_group/yachts.webp`                                                                                                                                                                                           |
| TilesSection                                  | `/images/tiles/slice_0..7.webp`                                                                                                                                                                                                                                |
| TransferSection                               | `/images/home_page/transfer.webp`                                                                                                                                                                                                                              |
| `/aircraft`                                   | `/images/aircraft/aircraft.png`                                                                                                                                                                                                                                |
| `/atm_jet_group` GroupCards                   | `/images/atm_jet_group/group1.webp`, `group2.webp`                                                                                                                                                                                                             |
| `/business_agents`                            | `/images/business_agencies/hero2.webp`, `file1.webp`, `file2.webp`; BestPrice `/images/business_agencies/insurance.webp`                                                                                                                                       |
| `/cargo_charter`                              | `/images/cargo_charter/hero.webp`, `why_us_{global,personalized,security,guarantees}.webp`                                                                                                                                                                     |
| `/citizens`                                   | `/images/citizens/hero.webp`, `why_us_{sanctions,techstops,foreignaircrafts(missing),coordination,anypayment}.webp`                                                                                                                                            |
| `/empty_legs`                                 | `/images/empty_legs/hero.png`                                                                                                                                                                                                                                  |
| `/group_charters`                             | `/images/group_charter/hero.webp`, `card2.webp`, `/images/business_agencies/hero.webp`                                                                                                                                                                         |
| `/medical_aviation`                           | `/images/medical/hero.webp`, `slide1..4.webp`                                                                                                                                                                                                                  |
| `/partners`                                   | `/images/partners/hero.webp`, `white-label.webp`, `label.webp`, `payment.jpg`, `/images/business_agencies/insurance2.webp`; PersonalManager `/images/jets_dep/personal_manager.webp`                                                                           |
| `/sales_dept`                                 | HeroSales `/images/jets_dep/jetsmarket_page_firstscreen_mainpic.webp`; `jetsmarket_page_aircrafts_services_{legaldpt,financedpt}.webp`; `jetsmarket_page_team_atmjet.webp`; `jetsmarket_page_specialmanagement_{50flights,experience,yields}.webp`             |
| `/sales_yachts`                               | HeroYachts `/images/yachts/yacht_page_firstscreen_mainpic.webp`; `yacht_page_over20years_{management,plan,database,luxury}.webp` (×2 sections); `yacht_page_over20years_l.webp`; `yacht_page_yachtservices_{legal,finance}.webp`; WeInspect `image_01..05.svg` |
| `/yachts`                                     | HeroYachts image (same)                                                                                                                                                                                                                                        |
| globals.css                                   | `/fonts/TARegressoPROEasyRegular/font.{woff2,woff}`                                                                                                                                                                                                            |
| dead TestimonialsSection                      | `/images/testimonials/{sardar.webp,pele.png,nicole.png,anna_netrebko.png,jamiroquai.webp}`                                                                                                                                                                     |

### 12.3 `src/assets/svg` (17 files) and `src/assets/icons` (6 files) — imported as React components (SVGR)

| File                                  | Bytes | viewBox      | Colour                       | Consumers                                                              |
| ------------------------------------- | ----- | ------------ | ---------------------------- | ---------------------------------------------------------------------- |
| `svg/logo.svg`                        | 5,061 | 0 0 326 64   | currentColor                 | Header, Footer, Preloader, `/citizens` (×2, one with `classname` typo) |
| `svg/arrow-top-right.svg`             | 856   | 0 0 32 32    | currentColor                 | Navbar, Footer, MenuBar, BookingDialog                                 |
| `svg/arrow-tr.svg`                    | 157   | 0 0 26 26    | stroke currentColor          | NewContactUs                                                           |
| `svg/burger-menu.svg`                 | 140   | 0 0 32 32    | stroke currentColor          | Header                                                                 |
| `svg/close.svg`                       | 136   | 0 0 32 32    | stroke currentColor          | Header, AngleBar, BookingDialog                                        |
| `svg/plane.svg`                       | 689   | 0 0 16 16    | currentColor                 | AngleBar                                                               |
| `svg/check.svg`                       | 280   | 0 0 25 25    | currentColor                 | Checkbox                                                               |
| `svg/checkmark.svg`                   | 264   | 0 0 73 54    | currentColor                 | BookingForm confirm view (unreachable)                                 |
| `svg/left-angle.svg`                  | 375   | 0 0 8 14     | currentColor                 | carousel arrows                                                        |
| `svg/forbes-logo.svg`                 | 1,945 | 0 0 126 54   | currentColor                 | `/citizens`                                                            |
| `svg/diamond-gold.svg`                | 897   | 0 0 44 44    | gradient (`url(#a)`), `#fff` | Privilege, `/business_agents`                                          |
| `svg/plane-gold.svg`                  | 1,596 | 0 0 44 44    | gradient                     | Privilege                                                              |
| `svg/exchange.svg`                    | 867   | (no viewBox) | gradient                     | Privilege                                                              |
| `svg/f7_bed-double-fill.svg`          | 1,307 | 0 0 33 32    | gradient                     | sale YachtCard                                                         |
| `svg/healthicons_security-worker.svg` | 2,908 | 0 0 33 32    | gradient                     | sale YachtCard                                                         |
| `svg/ion_people.svg`                  | 2,487 | 0 0 33 32    | gradient                     | sale YachtCard                                                         |
| `svg/car-gold.svg`                    | 2,079 | 0 0 44 44    | gradient, `#000`             | **unreferenced** (commented in Privilege)                              |
| `svg/plane-two.svg`                   | 639   | 0 0 32 32    | currentColor                 | **unreferenced**                                                       |
| `icons/guests.svg`                    | 369   | 0 0 24 24    | stroke currentColor          | aircraft detail, yacht detail, charter YachtCard                       |
| `icons/length.svg`                    | 1,044 | 0 0 25 24    | stroke currentColor          | same three                                                             |
| `icons/tools.svg`                     | 642   | 0 0 25 24    | stroke currentColor          | same three (as "Refit")                                                |
| `icons/cabins.svg`                    | 1,420 | 0 0 24 24    | stroke currentColor          | yacht detail, charter YachtCard                                        |
| `icons/clock.svg`                     | 511   | 0 0 24 24    | stroke currentColor          | yacht detail, charter YachtCard ("Hours")                              |
| `icons/bathrooms.svg`                 | 1,170 | 0 0 25 24    | stroke currentColor          | yacht detail, charter YachtCard                                        |

Gradient icons keep their own fills (Tailwind text colour has no effect); the three gradient icons in `elements/yacht_card.tsx` receive no size class and carry `width="33" height="32"` beside the viewBox, so they render at that size (verified while porting them, issue #109). `exchange.svg` has `width="44" height="44"` and no `viewBox`.

### 12.4 Remote hosts

| Host                                                                                     | What lives there                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atmjet.ams3.cdn.digitaloceanspaces.com` (DigitalOcean Spaces CDN, `next/image` allowed) | 4 PDFs (checklist EN/RU, presentation EN/RU); presumably legacy `vehicles.image/thumb`, `yachts.pictures`, `aircraft_images.url` (**UNVERIFIED**) |
| `atmjet.s3.eu-north-1.amazonaws.com` (S3 bucket `atmjet`, `next/image` allowed)          | `new_yachts.photos` uploaded by the admin under `yachts/<timestamp>-<filename>`                                                                   |
| `api.telegram.org`, `businessjet.kommo.com`                                              | integrations (§9)                                                                                                                                 |

## 13. Known bugs and quirks

Tags: `fix-while-porting` = behaviour-only fix, no pixel change; `parity-decision` = fixing changes the render/content, needs a decision; `keep` = intentional/harmless, reproduce as-is.

**Routing, SEO, framework**

1. `src/app/[locale]/layout.tsx:14-28` — `generateMetadata` computes title/description but returns `undefined`; non-home pages have no `<title>`. `fix-while-porting` (E11.1).
2. `src/app/sitemap.ts` — `/citezens` typo, `/sales_yachts` missing, unprefixed primary URLs, no `x-default`, no sitemap index, `lastModified = now`. `fix-while-porting` (E11.2).
3. `src/app/aircraft/sitemap.ts` — built from `vehicles.tail_number` although detail links use `aircrafts.slug`; yacht details absent. `parity-decision` (E11.2 [D]).
4. `src/app/robots.ts` — hard-coded `https://atmjet.com/sitemap.xml`, `disallow /private/` for a non-existent path. `fix-while-porting`.
5. `src/middleware.ts:24` — default locale taken from the client-controllable `x-default-locale` request header; no-op "rewrite" loop. `fix-while-porting` (E3.6).
6. `src/i18n.ts:5`, `middleware.ts` — `uk` catalog shipped but locale unroutable; switcher link commented. `parity-decision` (E3.7, E10.6).
7. Missing `not-found.tsx`, `error.tsx`, `global-error.tsx`, `/privacy` (linked from the cookie banner), `manifest`. `fix-while-porting` (E3.10; `/privacy` content is E3.11 [D]).
8. Unprefixed internal hrefs (§2.2 list) rely on middleware detection; `navbar.tsx:15` Home link is `/` with `legacyBehavior`. `fix-while-porting` (E6.1/E6.2).
9. `elements/group_card.tsx:24` + `atm_jet_group/page.tsx:27,35` — `/${locale}//aircraft` double slash. `fix-while-porting` (E6.16).
10. `layout.tsx:40` — `headers()` makes every route dynamic; no caching/ISR. `fix-while-porting` (E3.13/E11.9).
11. `layout.tsx:44` — GTM rendered as a child of `<html>` before `<body>`, unconditional, id hard-coded. `fix-while-porting` (E3.9/E11.5).
12. Sitemaps have no dynamic opt-in → likely frozen at build. `parity-decision` (E11.2 [D]).

**Home page and hero** 13. `sections/hero.tsx:7-8,26` — relative `video/background_full.mp4` source (hence the `public/en/video` duplicate), mobile variant defined but unused, no poster, `preload='auto'`. `parity-decision` (E7.1 [D], E11.6 [D]). 14. `sections/hero.tsx:27` — `<track src='/path/to/captions.vtt'>` requests a non-existent file. `fix-while-porting`. 15. Hero images use `loading='lazy'` (`hero_sales.tsx:43`, `hero_yachts.tsx:42`, `hero_subpage.tsx:22`). `fix-while-porting` (E11.7). 16. `duration-600` (Navbar/Footer/MenuBar/BookingDialog) is not a Tailwind class → the per-link fade runs at 150 ms. `keep` (reproduce 150 ms; E3.4). 17. No-op classes: `min-h-[680]` (`hero_yachts.tsx:26`), `aspect-w-1 aspect-h-1` (`tiles.tsx:25`), `md:object-fixed` (`hero_sales.tsx:42`), `btn btn-primary` (`YachtsSection.tsx:105`), `color-gray`, `border-gold`/`focus:border-gold`, `bg-background` (`booking.tsx`), `props` (`empty_leg_card.tsx:21`), `sticky` without `top` (`options_selection.tsx:43`), `repeat-infinite` (`privilege.tsx:75`), all `embla*` names. `keep` (do not carry over; render is unaffected). 18. `tailwind.config.ts:73-77` + no `--radius` → `rounded-lg/md/sm` render **no** radius (buttons `.middle`, chips, select wrappers, arrows, gallery thumbs, badges, inputs, checkbox). `parity-decision` (E3.1/E3.2: "undefined shadcn vars stay undefined" — the visual baseline decides). 19. `globals.css:245-249` body colour/background variables undefined. `keep`. 20. `layout.tsx:12` — Inter latin subset only; Cyrillic renders in the system fallback. `parity-decision` (E3.5 [D]). 21. Home renders two preloaders (static Suspense fallback then the 4-s animated one) on every visit. `keep` (E6.5). 22. `sections/personal_manager.tsx:13-14` — literal `aaa` text and `bg-red-50` placeholder visible. `parity-decision` (E7.14 [D]).

**Aircraft listing / detail** 23. `aircraft_list.tsx:79` — option value `passangers` never equals `'passengers'` → "sort by passengers" sorts by id. `fix-while-porting` (E8.2, settled in #135: the option is spelt the way the query reads it, so the order it names is the order that arrives). 24. `aircraft_list.tsx:13,20` + `actions.ts:15` — `between(passengers_max, 0, 400)` always applied → rows with NULL pax never listed. `fix-while-porting` (E8.2, settled in #135: no range is applied, so an aircraft nobody has counted the seats of is listed — last, whichever way round the order is asked for). 25. `aircraft_list.tsx:28-33` — load-more ignores sort/order/filter and appends id-ordered rows. `fix-while-porting` (E8.2, settled in #135: the order is in the URL and the next batch is a link to it, so it cannot be asked for without one). 26. `aircraft_card.tsx:21-23` — cards without an exterior image render `null` → batches shorter than 15, gaps in offsets. `fix-while-porting` (E8.2, settled in #135: an aircraft with no photograph is left out by the query rather than dropped from the answer, so a batch is the size it says). 27. `aircraft_card.tsx:31-38` — next/image plus a raw `<img>` for the same cover (two images per card). `parity-decision` (E8.2 [D], **settled in #135** by the decision of 2026-09-13: one picture per card. The two shared a box of a fixed height that clipped what would not fit, so the second was never a picture a visitor saw — only the same file fetched twice). 28. Listing is fetched client-side after mount (empty first paint, no loading state). `fix-while-porting` (E8.2, settled in #135: the cards are in the document the server sends, and the page is rendered on demand because its order and its length come from the query). 29. `aircraft/page.tsx:42` — `fixed` class on a `fill` `<Image>` (viewport-fixed background). `keep` (reproduce). 30. `aircraft/[id]/page.tsx:248` — `showBooking=Yachts` for the aircraft request form. `fix-while-porting` (E9.3, settled in #138: the card names the page it stands on, so a lead left on an aircraft no longer arrives saying it came from the yachts; naming the aircraft itself is E9.3's own). 31. `aircraft/[id]/old.tsx:56` — `tailNumber = "${names[0]}-undefined"` when the id has no dash. `fix-while-porting` (E8.5, settled in #138: a slug of one part is read as the registration itself, which is what the listing card writes until the import brings the catalogue's slugs). 32. `aircraft/[id]/page.tsx:218` — `images.reverse()` mutates the fetched array (bottom column is reversed). `keep` (reproduce order without mutation). 33. `aircraft/[id]/page.tsx:36,193`, `yachts/[id]/page.tsx:198` — typos `lenght/width`, `Основые факты`. `parity-decision` (E10.4). 34. `aircraft/[id]/old.tsx:14-51` — dead `generateMetadata`; detail pages have no metadata. `fix-while-porting` (E11.1). 35. `aircraft/[id]/old.tsx:42,96` — `http://` scheme for vehicle images; `vehicle_card.tsx:13` uses `https://`. `fix-while-porting` (E5.12/E11.7). 36. Fragments without keys / duplicate keys (`aircraft/[id]/page.tsx:182-186,198-212`, `old.tsx:115-118`, `hero_sales.tsx:27-30`, `faq.tsx:31-34`, `yachts/[id]/page.tsx:201-213`). `fix-while-porting`. 37. `elements/empty_leg_card.tsx:16` — `async` client component. `fix-while-porting` (E6.17). 38. Detail pages depend on `aircrafts.slug` beginning with `<REG>-<NUM>`; fallback to `vehicles` when the aircraft has no images. `keep` semantics, but slug resolution redesign is E8.5 (settled in #138: `resolveAircraft` tries the slug, then the registration its first two parts name, then the whole slug read as one, so a catalogue slug and a bare tail number both answer and the legacy sitemap's URLs need no redirect entry; the fallback layout for an aircraft with no images is E8.4).

**Yachts** 39. `YachtsSection.tsx:63-67` — `60+` case falls through to `All`. `fix-while-porting` (E8.6, settled in #139: "more than 60 guests" leaves the fleet with the yachts that carry more than 60, where the legacy answered it with all of them). 40. `filter_section.tsx:56,135-140` — field named `lenght`, URL param `length`; `YachtsSection` expects lowercase `all`. `fix-while-porting` (settled in #139: the field is named after the parameter it writes, and the bands are read from the values the form sends, so the length select narrows the fleet at all). 41. `yachts/page.tsx:20-67` — min/max computation throws on an empty table (`[0].customerPrice`). `fix-while-porting` ("crash-proof"). 42. `filter_section.tsx:87-145` — guests/price/length selects are not initialised from the URL (reset to All after Apply); `console.log` on submit; unused `Range`/`DualRange`/state. `fix-while-porting` (settled in #139: each select opens on what the URL asked for, so the card says what the page below it is showing; the dead range sliders and the logging are not ported, and the options keep the order each select offered them in). 43. `YachtsSection.tsx:101-108` — empty state English-only. `parity-decision` (E10.4). 44. `yachts/[id]/page.tsx:76` — `ILIKE '%id%'` substring lookup without ordering. `fix-while-porting` (E8.7 exact slug, settled in #140: the slug is matched whole, so a fragment of one opens nothing rather than whichever row the table hands over first). 45. `yachts/[id]/page.tsx:134-138` — `Gallery selected={1}` crashes with one photo. `fix-while-porting` (E8.7, settled in #140: the page opens on the second photograph as the legacy asked, and the gallery of #101 brings that back to the first where there is no second). 46. `yachts/[id]/page.tsx:162-170` — guests `defaultValue={yacht.minHours || 1}`. `fix-while-porting` (settled in #140: the guests field opens on one guest, which is its own minimum, rather than on the number of hours beside it). 47. `yachts/[id]/page.tsx:144-151,270-281` — disabled `from` input is not submitted → `from` missing from the Telegram message. `fix-while-porting` (E9.3, settled in #140: the berth is read-only rather than disabled, so it is shown, cannot be edited, and arrives with the request). 48. `yachts/[id]/page.tsx:176` — `customerPrice` is a string; `toLocaleString()` adds no separators. `parity-decision` (formatting, settled by the decision of #140: the collection holds the price as a number, so the separators that call asked for and never got are drawn; the listing card has drawn them since #357, and a price is written one way across the site). 49. `yachts/[id]/page.tsx:102` — `${minHours} hours` in RU; `yacht_card.tsx` RU pluralisation only on the card. `parity-decision` (E10.4/E10.7). 50. `yachts/[id]/page.tsx:79-82` — description paragraphs from `.split('.')` (drops trailing fragment, breaks on abbreviations/decimals). `parity-decision` (E4.13 [D]). 51. `elements/yacht_card.tsx` (sale) and `vehicle_card.tsx` — English-only labels. `parity-decision` (E10.4). 52. `sales_yachts/page.tsx:17-21` — sale yachts unordered, unlimited. `keep` (E4.6 decides ordering). 53. `sales_dept/page.tsx:27-37` — `vehicles` carousel has no `source`/type filter (mixed table). `parity-decision` (E5.8 [D]). 99. `yachts/[id]/page.tsx:176` — a yacht nobody has priced is offered at `customerPrice || 1000`, so the card states an hourly rate the yacht does not have. `fix-while-porting` (E8.7, settled in #140: the line is drawn where there is a price and left out where there is none, which is what the listing card already does with the badge).

**Empty legs** 54. `sections/empty_leg.tsx:53` — `href='tg:\\nesolve?domain=@atmjet1'` (literal backslashes; JSX attributes do not unescape). `fix-while-porting` (E7.7). 55. `sections/empty_leg.tsx:13-38,63-75` — N+1 airport lookups with `ILIKE '%ICAO%'`, English-only city/country, no ordering (`order` column ignored), no expiry. `fix-while-porting` for queries; ordering/expiry `parity-decision` (E7.7 [D]). 56. `elements/empty_leg_card.tsx:27,33-35` — `en-US` long date regardless of locale, strike price = ×2.5, constant `-60%` badge, `$` currency. `parity-decision` (E6.17 [D]).

**Forms and integrations** 57. `form/booking.tsx:81` — default country `COUNTRIES[1]` = Åland Islands (`+35818`); placeholder shows it. `parity-decision` (E6.21 [D], E9.10 [D]). 58. `form/booking.tsx:150-154` — auto-detection matches only 1–3-digit codes exactly (never `+35818`, `+1xxx` NANP codes etc.). `fix-while-porting`. 59. `form/booking.tsx:216-220`, `booking_dialog.tsx:58-67`, `request_flight.tsx:68-75` — `?confirm=true` is never set; `close()` runs in `finally`; no success/error UI; inline form is not reset. `fix-while-porting` (E9.8 "reachable confirm state" — the confirm view itself already exists). 60. `sections/new_contact_us.tsx:72` — `host='contact_us'` → Telegram link `https://contact_us/<path>`; `Component` empty for the inline form. `fix-while-porting` (E9.3). 61. `form/booking.tsx:72` — `mdEscape` does not escape `\`. `fix-while-porting` (E9.5). 62. `src/app/telegramBot.ts:31-45` — sequential sends, abort on first failure, no retry, no lead persistence. `fix-while-porting` (E9.4/E9.5). 63. `src/app/telegramBot.ts:6-7` — module-level `throw` when env vars are missing. `fix-while-porting` (E9.11). 64. `form/request_flight.tsx` / `direction.tsx` — zod errors never displayed; invalid submit is silent. `parity-decision` (adding error UI changes the render; E9.1). 65. `form/request_flight.tsx:58-66` — switching to round trip deletes extra legs; switching back does not restore them. `keep` (E9.1 spec) unless decided otherwise. 66. `elements/counter_input.tsx:40,51` — duplicate `id='passengers'`/`htmlFor` per leg. `fix-while-porting`. 67. `form/booking.tsx:102` — `JSON.parse(searchParams.get('direction'))` throws on malformed input (render crash). `fix-while-porting`. 68. `src/app/api/post_data/route.ts` — dead Kommo route; returns the axios response/error objects (leaks `Authorization`), HTTP 200 on error, duplicate field `1077074`, no auth. **Decided (E9.6): not ported.** The route is dead on the legacy site and nothing replaces it; leads go to Telegram and the Leads collection. 69. `src/app/actions.ts` — dead duplicate airport search with `st→saint` hack; `src/utils/getAiport.ts:43` sorts by the **text** column `passengers_per_year` ascending (small airports first). `fix-while-porting` (E9.9 numeric ranking). 70. `form/autocomplete.tsx:50` — renders an empty `<ul>` when only the echo entry exists. `fix-while-porting`.

**Chrome** 71. `sections/cookies_consent.tsx`, `cookies_modal.tsx` — consent gates nothing; banner writes session cookies, modal writes ≈1-year cookies; `/privacy` 404. `fix-while-porting` (E6.4, E11.5; privacy E3.11 [D]). 72. `elements/booking_dialog.tsx:64` — closing drops every query param (except `confirm`). `keep` (E6.6 contract) — decide only if deep-linking needs preserving. 73. `booking_dialog.tsx:99-101` vs `misc.json footer.phone`, `new_contact_us.tsx:85-89` — `tel:` targets +971 58 594 0112 while the visible number is +971 50 458 99 26; `tel:+971(585)940-112` is punctuated. `parity-decision` (E4.2, settled when the site settings shipped in #237: one `phone` field, printed as written and dialled from the same value, so the two can no longer disagree). 74. `elements/localeSwitcher.tsx:17` — always appends `?` to the switched URL; class list contains `false`. `fix-while-porting` (E6.3). 75. `citizens/page.tsx:40` — `<Logo classname='h-12'/>` typo → unstyled logo size. `parity-decision` (E6.22, settled by the decision of #149: the wordmark note applies the `h-12` the prop meant). 76. `citizens/page.tsx:21` — `why_us_foreignaircrafts.webp` missing (file is `…foreignaircraft.webp`). `parity-decision` (E5.12, settled by the decision of #149: the reference is dropped and the third card carries no photograph). 77. `citizens/page.tsx:67-72` — inline RU founder quote. `fix-while-porting` (E10.5; content move, same render). 78. `citizens/page.tsx:26-28` — non-RU locales redirect to `/`. `keep` (E8.16, shipped in #149 as the page-level `availableLocales`, which the route and the sitemap both read). 79. `sections/header.tsx:70,72`, `angle_bar.tsx:26,31` — icons `spin-in` on toggle; header hides on scroll-down, shows on scroll-up/top, 700 ms transition. `keep` (E6.1/E6.7). 80. `sections/transfer.tsx:17` — legacy `layout='fill'` prop. `fix-while-porting` (use `fill`). 81. `sections/faq.tsx:52-62`, `elements/range_slider.tsx`, `components/drizzle-ssr.tsx`, `form/phone-input.tsx`, `ui/*`, `hooks/use-toast.ts`, `elements/arrows.css`, `src/app/actions.ts`, `sections/{testimonials,personal_flight_manager,contact_us,cargo_request,all_aircrafts}.tsx`, `elements/testimonials_card.tsx`, `aircraft/old.tsx`, `yachts/dual_range.tsx` — dead code. `parity-decision` (E6.23, decided 2026-09-13: none of them is ported. The one thing carried over is the look of `aircraft/[id]/old.tsx`, the dead detail page, which becomes the basic aircraft layout of E8.4; reviving any other one is its own issue). 98. `src/app/[locale]/loading.tsx` — the static preloader as the segment's Suspense fallback. Porting it verbatim costs the redirect and 404 statuses: the boundary sits above the page that throws `redirect()` and `notFound()`, so the server streams a 200 shell and all twelve assertions of `tests/e2e/redirects.e2e.spec.ts` fail (308 and 307 → 200, 404 → 200), passing again the moment the file is removed. **Decided (E3.10, #56): not ported.** Real 404s win; a loading fallback with the static preloader comes back only where it cannot hide one. Settled in #134: the home page draws the animated preloader as the legacy page drew it, and no boundary is added around it — the page is prerendered, so there is nothing for a fallback to wait for, and the static variant stays for a boundary that has something to hide. 82. Unused deps `next-sitemap`, `vercel`, `react-phone-input-2` (+ its CSS overrides `globals.css:283-296`), `usehooks-ts`, `@radix-ui/react-label`; `prettier` in runtime deps. `fix-while-porting` (E3.12).

**Assets and content** 83. `sections/footer.tsx:19` — 1.5 MB `footer.jpg` used while `footer.webp` (92 KB) exists; oversized `group_charter/card2.webp` 4.2 MB, `aircraft/aircraft.png` 2.5 MB, `key_features_shampain.jpg` 1.9 MB, `empty_legs/hero.png` 1.77 MB, `2-for-business-agents.webp` 1.59 MB. `fix-while-porting` (E11.7 "without visual change"). 84. `public/video/hero_background.mp4` (12.8 MB) ×2 and `public/en/video/*` duplicates (47 MB) unreferenced. `fix-while-porting` (E5.12 manifest). 85. 99 unreferenced public files (51 MB) incl. all `.jpg` twins and dead-testimonial images. `fix-while-porting` (E5.12). 86. `messages/uk/*` — 10 missing keys, `form.passangers` typo; namespace `we-incpect` typo. `fix-while-porting` (E10.6; key renames are content-only). 87. `messages/*` — 39 unused keys + 10 dead namespaces. `fix-while-porting` (E10.1 tag unused). 88. `README.md` — wrong paths (`src/messages`, `public/en/video`). `fix-while-porting`. 89. `optimize.ps1:2` — leaked TinyPNG API key; `atmjet-admin/.env` tracked with real secrets. Rotate (E0.6). `fix-while-porting`. 90. `sales_yachts/page.tsx:93-96` — `height={1920} width={1080}` swapped for a landscape image (CSS `w-full object-cover` hides it). `keep`. 91. `elements/counter.tsx` — count animation re-runs on every viewport entry; final text is the original string (locale separators of the source, not `toLocaleString`). `keep` (E6.10). 92. `sections/tiles.tsx`, `new_contact_us.tsx` — `useInView` `threshold: 0.5, triggerOnce` (animations may never fire on short viewports where 50 % is never visible). `keep` (E3.4 reproduce; E2.1 baseline "after preloader"/reduced motion). 93. `sections/we_inspect.tsx:9-13` — SVG illustrations through `next/image` (served unoptimised). `keep`. 94. `hero.tsx`, `hero_sales.tsx`, `hero_yachts.tsx` — `©ATM JET` and `ATM JET` overline hard-coded. `fix-while-porting` (E10.4 content, same render). 97. `messages/{ru,uk}/home_page.json` — `home-hero.title` is the English `Flying private made simple` in all three catalogues, so the home page headline is never translated. `fix-while-porting` (E10.6, #111).

**Elements** 95. `elements/gallery.tsx` — the thumbnail dim compares each index against the `selected` prop rather than the state the component keeps, so the highlight stays where the page opened and never follows a click; on the first frame the two agree, which is why a capture looks right. `fix-while-porting` (E6.14, #270). 96. `sections/navbar.tsx`, `elements/empty_leg_card.tsx`, `group_card.tsx`, `file_card.tsx`, `yachts_card.tsx` — a `<button>` inside a link: invalid nesting, two tab stops for one action, an axe `nested-interactive` failure, and the anchor's global `py-2` around the button's own `py-2` drew every such button in a box 16px taller than its pill. `parity-decision` (#262, #281: the link is the button and carries one padding; the pill itself is unchanged).

## 14. Lessons from `atmjet-admin` (for the Payload admin)

Facts (all from `/home/user/atmjet-admin`, Next 14.2.5 + next-auth 4 + Drizzle 0.33 + `@aws-sdk/client-s3`; last commit `11fae0a "⛵ feat: Added yacht update and removal"`):

1. **Plaintext passwords** — `src/lib/auth.ts:33`: `const isValid = credentials.password === user.password` against `atmjet_admin__users.password` (`text`); JWT session carries `id`/`username`; custom sign-in page `/auth/signin`; no rate limiting. → Payload: built-in bcrypt auth, lockouts, roles (E1.7, E4.11).
2. **Unauthenticated routes and actions** — no `middleware.ts`; `getServerSession` is called only in `src/app/form/page.tsx:9-13` and `src/app/form/empty-legs/page.tsx:25-28`. `src/app/form/yachts/page.tsx`, `yachts/add/page.tsx`, `yachts/edit/[id]/page.tsx` and **every server action** (`addYachtAction`, `editYachtAction`, `deleteYachtAction`, `PostEmptyLeg`, `UpdateEmptyLeg`, `DeleteEmptyLeg`) are callable without a session (`form/layout.tsx` is a client layout with no check). → Payload access-control matrix with tests (E4.11).
3. **S3 delete gap** — `edit-yachts.tsx:57-61` drops `photosToDelete` from the DB array but never deletes the objects; `delete-yacht.tsx:18-33` derives the key as `new URL(photoUrl).pathname.substring(1)` (correct only for virtual-hosted URLs of the same bucket; DO/CDN URLs would target wrong keys) and swallows errors. → `@payloadcms/storage-s3` + Media collection owns the object lifecycle (E1.5, E4.3).
4. **Slug rule** — `toSlug = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_')` (`add-yacht.tsx:70-74`, `edit-yachts.tsx:83-87`): ASCII-only (Cyrillic names → empty slug), underscores, recomputed on every edit (URLs change on rename), no uniqueness (`new_yachts.slug` has no unique index) while the site matches with `ILIKE '%id%'`. → Payload slug field: transliterate, unique, stable after creation, admin rule per E4.6.
5. **Revalidation bug** — `empty_legs_actions.ts:9,14,19` call `revalidatePath('page')` (not a path; no effect); yacht actions revalidate only the admin list (`/form/yachts`). The public site is a separate deployment and is never revalidated (it survives only because every route is dynamic). → `afterChange` → `revalidateTag`/`revalidatePath` in the same app (E3.13).
6. **MIME allowlist gap** — `add-yacht.tsx:43-49` allows `image/jpeg, image/jpg, image/png, image/webp` by trusting the client-supplied `file.type`; `edit-yachts.tsx:63-81` has **no** type check; client input uses `accept='image/*'` only; keys are `yachts/${Date.now()}-${file.name}` (unsanitised filenames). → Payload upload `mimeTypes` + server-side sniffing, generated filenames (E4.3).
7. **Hard-coded endpoint** — `src/lib/s3.ts:10` `endpoint: 'https://s3.eu-north-1.amazonaws.com'` while public URLs are built from `AWS_S3_BUCKET_NAME` + `AWS_S3_ENDPOINT` env (`add-yacht.tsx:65`); `region` from env. → single env-driven S3 config (E1.4/E1.5).
8. **Tracked `.env`** — `atmjet-admin/.env` is committed (variables: `POSTGRES_URL`, `NEXTAUTH_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_S3_ENDPOINT`; `.gitignore` only ignores `.env*.local`); `.env.example` lists the same names. Values are not reproduced here. → rotate all (E0.6), never track env files, use Vercel env scopes (E1.4).
9. Other observations: `db = drizzle(sql, { logger: true })` logs every query with parameters; debug `console.log('YACH EDIT', …)`/`console.log(a)` in `edit-yachts.tsx:51,114`; numeric fields validated as non-empty strings (`length`, `customerPrice`, `refit`, `minHours`, `guestsDay/Night`), `cabins`/`bathrooms` are free text, `currency` enum `AED | USD | EUR`, `manufacturer` optional; new photos are appended after kept ones (photo order = kept + new); the `0003` migration is not replayable (§8.8); `next.config.mjs` is empty (no image config). The admin's `emptyLegs`/`users`/`newYachts` Drizzle definitions are identical to the site's.

## 15. Coverage checklist (inventory item → backlog epic / theme)

| Item                                                                                                                               | Inventory anchor                  | Epic(s) / theme                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Routes**                                                                                                                         |                                   |                                                                                                                            |
| `/[locale]` home                                                                                                                   | §4 Route: /[locale]               | E8.1 Home; E7.1/E7.5–E7.13; E6.5 Preloader; E6.7 AngleBar; E11.1 metadata (og:video)                                       |
| `/[locale]/aircraft`                                                                                                               | §4 Route: /[locale]/aircraft      | E8.2 Aircraft listing (server-rendered, URL sort/filter); E7.23 aircraft hero + contact card; E6.9 Select                  |
| `/[locale]/aircraft/[id]` rich + basic                                                                                             | §4 Route: /[locale]/aircraft/[id] | E8.3 rich layout; E8.4 basic (`old.tsx`) layout; E8.5 slug resolution + legacy redirects; E6.14 Gallery; E9.3 inline form  |
| `/[locale]/atm_jet_group`                                                                                                          | §4                                | E8.17; E6.16 GroupCard (`//` href); E7.23 chip hero                                                                        |
| `/[locale]/business_agents`                                                                                                        | §4                                | E8.14; E7.21 Guide + Documents; E6.16 FileCard; E7.15 BestPrice; E1.6 PDFs mirror                                          |
| `/[locale]/cargo_charter`                                                                                                          | §4                                | E8.11; E7.2 Hero subpage; E7.6 WhyUs                                                                                       |
| `/[locale]/citizens`                                                                                                               | §4                                | E8.16 [D] (RU-only redirect, missing image, founder quote); E7.22 Quote cards; E10.5                                       |
| `/[locale]/empty_legs`                                                                                                             | §4                                | E8.10; E7.23 empty-legs hero + descriptor; E7.7                                                                            |
| `/[locale]/group_charters`                                                                                                         | §4                                | E8.12; E6.15 WhyUsCard direct stack                                                                                        |
| `/[locale]/medical_aviation`                                                                                                       | §4                                | E8.13; E7.8 KeyFeatures                                                                                                    |
| `/[locale]/partners`                                                                                                               | §4                                | E8.15; E7.23 partners hero; E7.14 PersonalManager                                                                          |
| `/[locale]/sales_dept`                                                                                                             | §4                                | E8.9; E7.3 Hero sales; E7.17 OptionsSelection; E7.18 Advantages; E6.12 VehiclesCarousel; E5.7/E5.8 vehicles                |
| `/[locale]/sales_yachts`                                                                                                           | §4                                | E8.8; E7.4 Hero yachts; E7.16 WeInspect; E7.23 gold-border descriptor, recent-yachts card, "20 years"; E6.13 YachtCarousel |
| `/[locale]/yachts` (+ filters)                                                                                                     | §4                                | E8.6 server-side filtering (`60+`, `lenght`, empty state, crash-proof); E6.9 Select/DualRange [D]                          |
| `/[locale]/yachts/[id]`                                                                                                            | §4                                | E8.7 (exact slug, 1-photo safety, image slices, inline form); E9.3                                                         |
| `/sitemap.xml`, `/aircraft/sitemap.xml`, `/robots.txt`                                                                             | §2.3                              | E11.2 [D] Sitemaps + robots                                                                                                |
| `next.config` redirects                                                                                                            | §1.3                              | E4.10 `plugin-redirects` + seed; E11.3 [D]; E8.5                                                                           |
| Middleware / i18n routing / `x-default-locale` / `uk`                                                                              | §2.2                              | E3.6 next-intl routing; E3.7 locale flag; E3.8 Payload localization; E10.6/E10.8                                           |
| `loading.tsx`, missing `not-found`/`error`/`privacy`                                                                               | §2.5                              | E3.10 (`loading.tsx` decided in #56: not ported, §13 entry 98); E3.11 [D]                                                  |
| `POST /api/post_data` (Kommo)                                                                                                      | §9.2                              | E9.6 [D] Kommo decision                                                                                                    |
| Dead `aircraft/old.tsx`, `aircraft/[id]/old.tsx`, `app/actions.ts`                                                                 | §2.1, §8.6                        | E6.23 (decided: not ported; the look of the dead detail page is E8.4)                                                      |
| **Chrome**                                                                                                                         |                                   |                                                                                                                            |
| Root layout (GTM, providers, fonts, `<html lang>`)                                                                                 | §3.1                              | E3.9 Frontend root layout; E3.5 [D] fonts; E11.5 GTM consent                                                               |
| HeaderSection + Navbar                                                                                                             | §3.2, §3.3                        | E6.1                                                                                                                       |
| FooterSection                                                                                                                      | §3.4                              | E6.2; E4.2 Footer global                                                                                                   |
| AngleBar + MenuBar                                                                                                                 | §3.5                              | E6.7                                                                                                                       |
| LocaleSwitch                                                                                                                       | §3.6                              | E6.3                                                                                                                       |
| CookiesConsent + CookiesModal                                                                                                      | §3.7                              | E6.4; E11.5                                                                                                                |
| Preloader (animated + static)                                                                                                      | §3.8                              | E6.5; E3.10 loading                                                                                                        |
| BookingDialog                                                                                                                      | §3.9                              | E6.6 (`showBooking`, click-outside, `confirm=true`, socials/phone, host)                                                   |
| Line separator; button variants                                                                                                    | §3.10, §10.1                      | E6.8                                                                                                                       |
| **Sections**                                                                                                                       |                                   |                                                                                                                            |
| HeroSection                                                                                                                        | §5                                | E7.1 [D]                                                                                                                   |
| SubpageHeroSection                                                                                                                 | §5                                | E7.2                                                                                                                       |
| HeroSalesSection                                                                                                                   | §5                                | E7.3                                                                                                                       |
| HeroYachtsSection                                                                                                                  | §5                                | E7.4                                                                                                                       |
| MakeBookingSection, TransferSection                                                                                                | §5                                | E7.5                                                                                                                       |
| WhyUsSection (+ WhyUsCard)                                                                                                         | §5, §6                            | E7.6; E6.15                                                                                                                |
| EmptyLegSection (+ findByICAO, Telegram card)                                                                                      | §5                                | E7.7 [D]; E4.7 EmptyLegs collection; E4.5 Airports                                                                         |
| KeyFeaturesSection (+ card, carousel)                                                                                              | §5, §6                            | E7.8; E6.18; E6.11                                                                                                         |
| OptionsSection                                                                                                                     | §5                                | E7.9                                                                                                                       |
| PrivilegeSection (+ PrivilegeCard, PrivilegeContact)                                                                               | §5                                | E7.10; E6.16                                                                                                               |
| YachtsSection promo (+ YachtsCard)                                                                                                 | §5, §6                            | E7.11; E6.16                                                                                                               |
| TilesSection                                                                                                                       | §5                                | E7.12                                                                                                                      |
| FaqSection (+ Accordion)                                                                                                           | §5, §6                            | E7.13; E6.19                                                                                                               |
| PersonalManagerSection                                                                                                             | §5                                | E7.14 [D]                                                                                                                  |
| BestPriceSection                                                                                                                   | §5                                | E7.15                                                                                                                      |
| WeInspectSection (+ TestimonialsCarousel progress bar)                                                                             | §5, §6                            | E7.16; E6.11                                                                                                               |
| OptionsSelectionSection                                                                                                            | §5                                | E7.17; E4.13 [D] list separators                                                                                           |
| AdvantagesSection                                                                                                                  | §5                                | E7.18                                                                                                                      |
| NewContactUs (+ inline BookingForm, contact card)                                                                                  | §5                                | E7.19; E9.2; E9.3                                                                                                          |
| GroupCard section (atm_jet_group)                                                                                                  | §4, §6                            | E7.20; E6.16                                                                                                               |
| Guide + Documents (business_agents)                                                                                                | §4                                | E7.21; E6.16 FileCard                                                                                                      |
| Quote cards (Forbes + founder)                                                                                                     | §4                                | E7.22; E10.5                                                                                                               |
| Small hero/descriptor blocks                                                                                                       | §4                                | E7.23                                                                                                                      |
| Dead sections (Testimonials, PersonalFlightManager, ContactUs, CargoRequest, AllAircrafts)                                         | §5                                | E6.23 (decided: not ported)                                                                                                |
| **Elements**                                                                                                                       |                                   |                                                                                                                            |
| Form primitives (`form/input`, `form/select`, local Input/Select copies, Checkbox, dark RequestForm inputs, DualRange/RangeSlider) | §6                                | E6.9 [D]                                                                                                                   |
| Counter, CounterInput                                                                                                              | §6                                | E6.10                                                                                                                      |
| Carousel primitives (embla + wheel, arrows, dots, progress bar)                                                                    | §6                                | E6.11; E3.12 deps                                                                                                          |
| VehiclesCarousel + VehicleCard                                                                                                     | §6                                | E6.12                                                                                                                      |
| YachtCarousel + sale YachtCard + ImagesCarousel                                                                                    | §6                                | E6.13                                                                                                                      |
| Gallery                                                                                                                            | §6                                | E6.14                                                                                                                      |
| GroupCard, FileCard, YachtsCard promo, PrivilegeCard                                                                               | §6, §5                            | E6.16                                                                                                                      |
| EmptyLegCard                                                                                                                       | §6                                | E6.17 [D]                                                                                                                  |
| KeyFeatureCard                                                                                                                     | §6                                | E6.18                                                                                                                      |
| Accordion                                                                                                                          | §6                                | E6.19                                                                                                                      |
| AutoComplete / Autocomplete (two implementations)                                                                                  | §6                                | E6.20 (controlled + uncontrolled); E9.9 endpoint                                                                           |
| Phone input with country dropdown (BookingForm) + `countries.ts` + `scripts/number-iso.js`                                         | §7.2, §1.4                        | E6.21 [D]; E9.10 [D]                                                                                                       |
| SVG icon set (17 + 6, `Logo classname` typo)                                                                                       | §12.3                             | E6.22 [D]; E3.12 SVGR vs TSX [D]                                                                                           |
| Dead elements (`ui/*`, `phone-input`, `use-toast`, `drizzle-ssr`, `range_slider`, `arrows.css`, TestimonialsCard)                  | §6                                | E6.23 (decided: not ported)                                                                                                |
| **Forms & integrations**                                                                                                           |                                   |                                                                                                                            |
| RequestForm + Direction (schemas, max 4, round trip, `?direction=`)                                                                | §7.1                              | E9.1                                                                                                                       |
| BookingForm (fields, onBlur, chips, Telegram format, confirm)                                                                      | §7.2, §7.4                        | E9.2; E9.8                                                                                                                 |
| Detail-page inline forms + server actions                                                                                          | §7.3                              | E9.3                                                                                                                       |
| Lead persistence                                                                                                                   | §9.1 (none today)                 | E9.4; E4.9 Leads collection                                                                                                |
| Telegram dispatch (`telegramBot.ts`, mdEscape, sequential sends, env throw)                                                        | §9.1                              | E9.5; E9.11                                                                                                                |
| Kommo                                                                                                                              | §9.2                              | E9.6 [D]                                                                                                                   |
| Spam protection                                                                                                                    | — (none today)                    | E9.7 [D]                                                                                                                   |
| Airport search (`getAiport.ts`)                                                                                                    | §8.5                              | E9.9                                                                                                                       |
| `?showBooking=` table, `?confirm=true`                                                                                             | §7.5, §7.6                        | E6.6; E9.8                                                                                                                 |
| **Data**                                                                                                                           |                                   |                                                                                                                            |
| `airports`, `new_airports`                                                                                                         | §8                                | E4.5 Airports collection; E5.5 import                                                                                      |
| `aircrafts`, `aircraft_images`, `vehicles` (planes)                                                                                | §8                                | E4.4 Aircraft collection; E5.6, E5.7                                                                                       |
| `vehicles` yacht rows / non-aircraft columns                                                                                       | §8.4                              | E5.8 [D]                                                                                                                   |
| `yachts` (sale), `new_yachts` (charter), `contact`                                                                                 | §8, §8.2                          | E4.6 Yachts collection (`listingType`); E4.8 Contacts; E5.9, E5.10                                                         |
| `atmjet_admin__empty_legs`                                                                                                         | §8                                | E4.7; E5.11                                                                                                                |
| `atmjet_admin__users`, `city_list`, `migration_status`                                                                             | §8.7                              | E5.2 legacy schema freeze; E5.15 [D]; E12.4/E12.6                                                                          |
| Admin DDL / corrupt `0003`                                                                                                         | §8.8                              | E5.3 archaeology                                                                                                           |
| Image URL hosts                                                                                                                    | §8.9, §12.4                       | E1.6 mirror DO → S3; E5.12 [D]; E4.3 Media                                                                                 |
| Reconciliation                                                                                                                     | §8 (row counts unknown)           | E5.13; E2.8                                                                                                                |
| **Env vars**                                                                                                                       |                                   |                                                                                                                            |
| `POSTGRES_URL`                                                                                                                     | §9.4                              | E1.1, E1.4 (`DATABASE_URL`)                                                                                                |
| `TELEGRAM_BOT_TOKEN`, `ALLOWED_USERS`                                                                                              | §9.4                              | E1.4 (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`); E9.5                                                                     |
| `CRM_AUTH`                                                                                                                         | §9.4                              | not carried over: the Kommo integration is not ported (E9.6, decided)                                                      |
| `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`                                                                                     | §9.4                              | E1.4 (`NEXT_PUBLIC_SITE_URL`); E3.9 `metadataBase`; E11.2                                                                  |
| GTM id (hard-coded)                                                                                                                | §3.1                              | E1.4 (`NEXT_PUBLIC_GTM_ID`); E4.2 SiteSettings                                                                             |
| Admin `AWS_*`, `NEXTAUTH_SECRET`, `POSTGRES_URL` (tracked)                                                                         | §14.8                             | E0.6 rotate; E1.4/E1.5 (`S3_*`)                                                                                            |
| **Assets**                                                                                                                         |                                   |                                                                                                                            |
| Videos (`public/video`, `public/en/video` duplicate, unused `hero_background.mp4`)                                                 | §12.1                             | E7.1 [D]; E11.6 [D]; E5.12 [D]                                                                                             |
| Images per folder, jpg/webp twins, oversized, unreferenced                                                                         | §12.1, §12.2                      | E5.12 [D] manifest; E11.7; E11.8 budgets                                                                                   |
| Missing `why_us_foreignaircrafts.webp`                                                                                             | §12.1                             | E5.12 [D]; E8.16 [D]                                                                                                       |
| Fonts (`TARegressoPROEasyRegular`, Inter subset)                                                                                   | §3.1, §12.1                       | E3.5 [D]                                                                                                                   |
| `src/assets/svg` + `icons`                                                                                                         | §12.3                             | E6.22 [D]; E3.12 [D]                                                                                                       |
| Remote hosts (DO Spaces, S3, 4 PDFs)                                                                                               | §12.4                             | E1.5, E1.6                                                                                                                 |
| **SEO artifacts**                                                                                                                  |                                   |                                                                                                                            |
| Per-page metadata (incl. never-returned layout strings, og:video, detail pages)                                                    | §2.4                              | E11.1                                                                                                                      |
| Sitemaps + robots                                                                                                                  | §2.3                              | E11.2 [D]                                                                                                                  |
| Redirect map                                                                                                                       | §1.3                              | E4.10; E11.3 [D]                                                                                                           |
| JSON-LD                                                                                                                            | — (none today)                    | E11.4                                                                                                                      |
| hreflang / alternates                                                                                                              | §2.3 (sitemap only)               | E10.8; E11.1                                                                                                               |
| **Styling & motion**                                                                                                               |                                   |                                                                                                                            |
| Tailwind tokens (gray ramp, `gold`, radius vars, fonts, z-index, breakpoints)                                                      | §10.2, §10.3                      | E3.1                                                                                                                       |
| `globals.css` element rules, darkening gradients, undefined vars                                                                   | §10.1                             | E3.2                                                                                                                       |
| `cva`/`cn` conventions                                                                                                             | §6 (`ui/button`, `lib/utils`)     | E3.3                                                                                                                       |
| `tailwindcss-animate` timings, framer-motion variants, `useInView`, Counter/Line                                                   | §10.4, §10.5                      | E3.4; E6.8; E6.10                                                                                                          |
| `bg-fixed` parallax, Safari/iOS                                                                                                    | §10.6                             | E2.9                                                                                                                       |
| **i18n**                                                                                                                           |                                   |                                                                                                                            |
| 13 namespaces × en/ru (384 keys), unused keys                                                                                      | §11.1, §11.4                      | E10.1                                                                                                                      |
| Hard-coded strings by file                                                                                                         | §11.5                             | E10.2, E10.3, E10.4                                                                                                        |
| Founder quote                                                                                                                      | §4 citizens                       | E10.5                                                                                                                      |
| `uk` gaps                                                                                                                          | §11.2                             | E10.6                                                                                                                      |
| Pluralisation (`pluralizeHours`)                                                                                                   | §4 yachts                         | E10.7                                                                                                                      |
| Line-break conventions                                                                                                             | §11.3                             | E4.13 [D]; E10.9                                                                                                           |
| **Testing / governance**                                                                                                           |                                   |                                                                                                                            |
| No tests, no CI, no lockfile, husky/lint-staged                                                                                    | §1.2                              | E2.* (foundation); E0.3, E0.8, E0.10                                                                                       |
| Leaked TinyPNG key (`optimize.ps1`), tracked admin `.env`                                                                          | §1.4, §14.8                       | E0.5, E0.6                                                                                                                 |
| Legacy Neon facts (PG major, size)                                                                                                 | §8 (UNVERIFIED)                   | E0.11; E5.1                                                                                                                |
| Visual baselines (15 routes × en/ru, dialog/menu/cookie states, preloader)                                                         | §3, §4                            | E2.1, E2.2                                                                                                                 |

### 15.1 Facts marked UNVERIFIED in this document

Exact resolved dependency versions (no lockfile); whether sitemaps are static at build on the deployed project; runtime effect of the never-returned layout metadata (empty `<title>` assumed); which host serves `vehicles.image`, `yachts.pictures`, `aircraft_images.url`; production column types/constraints of tables without DDL; the shape of real `aircrafts.slug` values (`<REG>-<NUM>-…`); meaning of `vehicles.source`; contents of `city_list`; whether the module-level Telegram env throw fails the build or the first action call; the rendered size of the unstyled `<Logo classname>` on `/citizens` and of the unsized gradient icons in the sale `YachtCard`; which face renders for the explicit `font-sans` class; the exact console behaviour of the async client `EmptyLegCard`; whether `public/en/video` is ever requested in production (depends on trailing-slash URLs).
