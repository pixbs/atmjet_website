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

`tests/unit/**/*.test.ts`. Import the function under test directly; no Payload, no network, no file system beyond fixtures. Fixtures live next to the test or under `tests/fixtures`.

## Integration tests

`tests/int/**/*.int.spec.ts` run against the database in `DATABASE_URL` (`.env`; the `ci` workflow provides Postgres 17 and runs the migrations first). Conventions:

- **One Payload per worker.** `getTestPayload()` (`tests/helpers/payload.ts`) memoises the instance; Vitest runs each file in its own worker, so suites never share one.
- **Unique data, no truncation.** Every document a test creates carries a `uniqueSuffix()` in its natural key, so files running in parallel do not collide. Never delete whole collections: another worker may be using them.
- **A registry per suite.** `const registry = await createRegistry()` in `beforeAll`, `registry.create(collection, data)` (or the factories) for every document, `afterAll(() => registry.cleanup())`. The registry deletes what the suite created, newest first, and tolerates documents already removed by the test.
- **Factories** under `tests/factories` (`createUser`, `createMedia`, ...) produce valid documents with unique keys; every new collection adds one and reuses it in `tests/int/access.int.spec.ts`.
- **Access checks** pass `overrideAccess: false` and, when needed, `user`; the harness creates documents with `overrideAccess: true`.

`tests/int/harness.int.spec.ts` is the self-test of these rules.

## Coverage ratchet

`bun run test:int` reports coverage for `src/collections`, `src/lib`, `src/utils`, `src/hooks` and `src/access` and fails under the thresholds in `vitest.config.mts`. Thresholds only go up: the pull request that raises coverage raises them to the new numbers in the same change; a pull request may not lower them. Reviewers check the thresholds line in the diff.

## Browser tiers

`playwright.config.ts` defines the `e2e`, `visual` and `a11y` projects. They start `bun run dev` themselves, or target a deployment when `PLAYWRIGHT_BASE_URL` is set (with the Vercel bypass header from `VERCEL_AUTOMATION_BYPASS_SECRET`). Chromium comes from `bunx playwright install chromium` or `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
