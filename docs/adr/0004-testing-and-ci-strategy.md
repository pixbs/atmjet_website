# ADR-0004: Tests first, tiers, coverage ratchet and visual parity

Status: accepted (2026-09-11)

## Context

The legacy repository had no tests and no CI. The rewrite must look exactly like the legacy site, several agents will push many small commits, and testing must not become a bottleneck at the end of the project or on every commit.

## Decision

- **Tests exist before features.** The boilerplate ships Vitest (unit + integration with coverage), Playwright projects `e2e`, `visual` and `a11y`, and Lighthouse CI. The first engineering epic captures the legacy visual baselines from production before any UI is ported.
- **Every change adds tests.** Unit tests for logic (transforms, validation, formatting, i18n helpers), integration tests for collections, hooks and access control, e2e tests for flows, visual tests for every ported section and page, axe for accessibility. Coverage thresholds in `vitest.config.mts` (statements, lines, functions 80 %, branches 70 % on `src/{collections,lib,utils,hooks,access}`) are a **ratchet**: they never go down and are raised in the pull request that adds tests. Automatic threshold updates were rejected because they would jump to 100 % on a small codebase and block the next change.
- **Tiers:** local hooks (format, lint, commitlint, branch name, typecheck); the fast `ci` workflow on every pull request push and on `master` (static checks, generated-file drift, migrations with schema-drift check, `test:int` with coverage, build); the heavy `e2e` workflow against deployed URLs (previews of PRs labelled `run-e2e`, every `master` push, nightly, manual) running e2e, visual, a11y (advisory) and Lighthouse budgets.
- **Per pull request, not per commit.** Workflows run on pull request events with `cancel-in-progress`; commits inside a push are not tested individually. Atomic commits are still verified locally by the hooks and by the author before pushing.
- **Visual parity:** Playwright `toHaveScreenshot` with reduced motion, masks for video and counters, baselines generated on Linux only and reviewed like code. The one-time legacy golden set is published as a Release asset on `legacy/v1`; living baselines are curated in `tests/visual/__screenshots__` with a size budget; Git LFS only if the set grows beyond about 50 MB.
- **Databases in CI:** a Postgres 17 service container for the fast tier; Neon preview branches for deployed previews.

## Consequences

- A pull request without the tests its issue lists is not done (`CONTRIBUTING.md`, PR template).
- Every automated tier drives Chromium, so WebKit and Gecko are covered manually: `docs/runbooks/cross-browser-checklist.md` runs at the end of E6, E7 and E8 and again before the cutover.
- The `e2e` workflow only fires from the default branch; it is verified after the first merge with `workflow_dispatch`.
