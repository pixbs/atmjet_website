# Legacy visual baselines

The legacy site is the pixel contract of the rewrite (AGENTS.md rule 6). Its baselines are captured once from production, while production still serves the legacy site, and kept on the `legacy/v1` release.

## What is captured

`scripts/baselines/matrix.ts` defines the matrix; `scripts/baselines/capture-legacy.ts` runs it with Playwright (Chromium, device scale factor 1, reduced motion, Dubai time zone):

- the 13 static routes of `docs/legacy-inventory.md` section 2.1, for `en` and `ru`, at 390×844 (mobile) and 1440×900 (desktop), as full-page screenshots plus one clip per top-level `<section>`; `/citizens` for `ru` only;
- the first three aircraft detail pages from `/aircraft/sitemap.xml` and the first two yachts linked from `/en/yachts`;
- home page states: cookie banner visible, menu open, the booking dialog for every live `?showBooking=` source (section 7.5), the request form in round-trip mode, the FAQ with the second item open.

Videos are masked, the preloader is waited out, every page is scrolled through before the capture so the reveal animations have run, and the consent cookie is preset except for the banner capture. Every entry of `manifest.json` records dimensions, size, sha256 and status; a failed capture is recorded, never fatal.

## How to run it

Agent sessions cannot reach the production host. Run the `legacy baselines` workflow (Actions → legacy baselines → Run workflow, or `gh workflow run legacy-baselines.yml -f base_url=https://atmjet.com`). It:

1. captures the site on a runner and uploads `legacy-baselines.zip` as a workflow artifact (90 days);
2. with `publish` (default), creates the `legacy/v1` release at the legacy commit `8b8f375` when it does not exist yet and attaches the bundle and the manifest to it (`--clobber` replaces an earlier bundle);
3. commits `tests/visual/legacy/manifest.json` to the branch `test/37-legacy-visual-baselines` as `github-actions[bot]` (the one identity exception to AGENTS.md rule 1) so a pull request can review what was captured.

Locally the script only makes sense against a reachable copy of the legacy site, for example `bun run baselines:legacy -- --base-url http://localhost:3001`. A smoke test against the new site's dev server uses `--no-locale-prefix --routes / --states default,menu-open --no-detail`.

## How the baselines are used

The visual parity harness (issue #38) downloads the bundle in CI (`gh release download legacy/v1 --pattern legacy-baselines.zip`) and compares the rewrite's pages and sections against it with an explicit tolerance. Do not re-capture after the cutover: production then serves the rewrite.
