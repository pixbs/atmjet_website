# Visual tests

Two kinds of baselines (ADR-0004, issues #37 and #38):

- **Legacy baselines**: the pixel contract, captured once from the legacy production site by the `legacy baselines` workflow and kept on the `legacy/v1` release. `tests/visual/legacy/manifest.json` lists every capture; `bun run visual:bundle` downloads the images into `tests/visual/legacy/bundle/` (ignored by git). Compare with `expectLegacyParity(page | locator, { id, section? }, { maxDiffPixelRatio, maxHeightDelta, mask })` from `tests/visual/legacy/expect.ts`; ids come from `legacyId(route, locale, viewport, state, param)`. Without the bundle the helper skips the test with a message.
- **Living baselines**: `toHaveScreenshot` snapshots under `__screenshots__`, generated on Linux only (`bun run test:visual:update`, guarded by `scripts/ci/visual-update.sh`) and kept under 30 MB (`scripts/ci/check-visual-budget.sh` in the `ci` workflow). Prefer section clips to full pages.

Failures attach the actual, expected and diff images to the Playwright report; the `e2e` workflow uploads the report and `test-results` as artifacts.
