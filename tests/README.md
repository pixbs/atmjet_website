# Tests

Five tiers (ADR-0004), all run by `bun run test`; every change ships the tiers it touches.

| Directory      | Runner     | Command               | What belongs here                                                            |
| -------------- | ---------- | --------------------- | ---------------------------------------------------------------------------- |
| `tests/unit`   | Vitest     | `bun run test:int`    | pure logic: transforms, validation, formatting, i18n helpers, access helpers |
| `tests/int`    | Vitest     | `bun run test:int`    | collections, hooks and access control through the Payload Local API          |
| `tests/e2e`    | Playwright | `bun run test:e2e`    | user flows in a browser                                                      |
| `tests/visual` | Playwright | `bun run test:visual` | pixel parity against the legacy baselines (`tests/visual/README.md`)         |
| `tests/a11y`   | Playwright | `bun run test:a11y`   | axe checks per page                                                          |

## Unit tests

`tests/unit/**/*.test.ts`. Import the function under test directly; no Payload, no network, no file system beyond fixtures. Fixtures live next to the test or under `tests/fixtures`. Both Vitest tiers run in the node environment; a test that renders a component opts into jsdom with a `/** @vitest-environment jsdom */` docblock.

The motion vocabulary is pinned the same way: `tests/unit/motion.test.ts` asserts the legacy durations, offsets and variants, `tests/unit/count-up.test.ts` the counter's arithmetic, and the styleguide specs cover the primitives in the browser.

The parity base layer has its own suite as well: `tests/unit/parity-base-layer.test.ts` checks every legacy global rule against `tests/fixtures/parity-base-layer.ts`, including the kept quirks and the cascade split (element rules in `@layer base`, class rules unlayered), and `/styleguide` renders them all for `tests/visual/styleguide.visual.spec.ts`.

The design tokens are unit tested too: `tests/helpers/tailwind.ts` compiles `src/app/(frontend)/globals.css` with Tailwind's own compiler, and `tests/unit/theme-tokens.test.ts` checks every token against the legacy values in `tests/fixtures/legacy-tokens.ts` and asserts that the cleared Tailwind defaults generate nothing.

## Integration tests

`tests/int/**/*.int.spec.ts` run against the database in `DATABASE_URL` (`.env`; the `ci` workflow provides Postgres 17 and runs the migrations first). Conventions:

- **One Payload per worker.** `getTestPayload()` (`tests/helpers/payload.ts`) memoises the instance; Vitest runs each file in its own worker, so suites never share one.
- **Unique data, no truncation.** Every document a test creates carries a `uniqueSuffix()` in its natural key, so files running in parallel do not collide. Never delete whole collections: another worker may be using them.
- **A registry per suite.** `const registry = await createRegistry()` in `beforeAll`, `registry.create(collection, data)` (or the factories) for every document, `afterAll(() => registry.cleanup())`. The registry deletes what the suite created, newest first, and tolerates documents already removed by the test.
- **Seed** (`bun run seed`, `scripts/seed`): the fixture content every environment needs to render, idempotent by natural key; the `ci` workflow seeds before the suites run. The Vitest tiers never depend on seeded data except `tests/int/seed.int.spec.ts`; use the factories instead. The browser tiers do depend on it, because the site is content-driven: since issue #60 the home page is the `pages` document with the empty slug, so `/en` is a 404 until the seed has run.
- **Factories** under `tests/factories` (`createUser`, `createMedia`, ...) produce valid documents with unique keys; every new collection adds one and reuses it in `tests/int/access.int.spec.ts`.
- **Access checks** pass `overrideAccess: false` and, when needed, `user`; the harness creates documents with `overrideAccess: true`.

`tests/int/harness.int.spec.ts` is the self-test of these rules.

## Coverage

`bun run test:int` reports coverage for `src/collections`, `src/lib`, `src/utils`, `src/hooks` and `src/access` and fails under the thresholds in `vitest.config.mts`. The thresholds are fixed numbers, not a ratchet (ADR-0008): a pull request changes them only when it says why. Coverage is a signal, not a target: a test asserts a behaviour the issue lists, never a constant, a type or an admin `condition` called directly.

## Browser tiers

`playwright.config.ts` defines the `e2e`, `visual` and `a11y` projects. They build the site and serve it themselves (`bun run build && bun run start`), or target a deployment when `PLAYWRIGHT_BASE_URL` is set (with the Vercel bypass header from `VERCEL_AUTOMATION_BYPASS_SECRET`). Chromium comes from `bunx playwright install chromium` or `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

A tier run against `next dev` loses specs to the server rather than to the site: `next dev` re-evaluates its modules as it serves, which loses the memoised Payload instance, and every rebuild of it runs a drizzle push whose window answers requests with the error page (issue #292). A server that is already listening is used as it is, so `bun run dev` in another terminal is still how a tier is pointed at the dev server on purpose.

Run `bun run migrate && bun run seed` before them on a fresh database, as the `ci` workflow does. Readiness is checked against `/en/styleguide` rather than `/`: the styleguide is a static route, so an unseeded database fails a test that names the missing content instead of timing out after two minutes on a webServer check with nothing to say.

### Accessibility

`tests/a11y` runs axe with the WCAG 2.1 A/AA rules through `expectNoA11yViolations(page, { allow, advisory })` (`tests/a11y/axe.ts`). Every violation blocks, except the advisory rules (`ADVISORY_RULES`, today `color-contrast`, until the design decisions on the gold-on-white contrast of the legacy palette are made), which are attached to the report and printed, and the exemptions a spec passes in `allow` with the axe rule id, an optional selector and the reason with its inventory anchor. Exemptions are listed here when they are added:

| Rule     | Selector | Reason |
| -------- | -------- | ------ |
| none yet |          |        |

One a11y spec per page as pages land, on the e2e fixtures and page objects. The tier is blocking locally and advisory in the `e2e` workflow until the pages are ported.

### End-to-end conventions

- Specs import `test` and `expect` from `tests/e2e/fixtures.ts`. Fixtures: `siteLocale` (an option, default `en`; Playwright's own `locale` is the browser locale), `home` and `admin` page objects; every new page adds a page object under `tests/e2e/pages` whose locators describe what a visitor sees (roles and names), not the markup.
- `forEachLocale(define)` runs a block of specs once per enabled locale (`tests/e2e/routes.ts`); page objects build their paths with `pathFor`, so specs keep working when the locale routing lands.
- Every page spec asserts server rendering through `request` (the content must be in the HTML the server sends, ADR-0007) and the visible content through the page object.
- Admin specs run serially and log in through `AdminPage.login`; the account comes from `tests/helpers/seedUser.ts`.
