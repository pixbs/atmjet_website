# Performance baseline: the legacy site

What the legacy production site scored before the cutover (issue #43), and so what the budgets in
`lighthouserc.cjs` hold the rewrite to: on the same pages, no worse than this.

## How it was measured

- **When and where:** 2026-09-25, `https://atmjet.com` while it still served the legacy site, from
  a GitHub-hosted runner, by the `legacy performance` workflow
  (`.github/workflows/legacy-performance.yml`, run
  [36137785517](https://github.com/pixbs/atmjet_website/actions/runs/36137785517)). Agent sessions
  cannot reach the production host, so the audit runs there.
- **How:** Lighthouse CI, three runs per page and form factor. Mobile is Lighthouse's default
  emulation (the `perf` preset: a mid-range phone on a throttled 4G connection); desktop is the
  `desktop` preset, the one every run of `lighthouserc.cjs` uses. The table shows the median of the
  three runs, as `scripts/ci/lighthouse-summary.ts` computes it.
- **Which pages:** the home page, the aircraft listing, one aircraft detail page and the yachts
  page, in English. The legacy listing renders its cards in the browser, so the detail page is the
  first plane of the aircraft sitemap, `/en/aircraft/UPM-018`: the basic layout, without a gallery
  (`docs/legacy-inventory.md` section 4).

Run the workflow again by hand (`workflow_dispatch`) to repeat the measurement; its summary prints
the same table.

## Results

| Page                   | Form factor | Performance | LCP     | CLS   | TBT     | Total weight | Images     |
| ---------------------- | ----------- | ----------- | ------- | ----- | ------- | ------------ | ---------- |
| `/en`                  | desktop     | 72          | 944 ms  | 0.991 | 33 ms   | 14,297 KiB   | 338 KiB    |
| `/en`                  | mobile      | 27          | 6273 ms | 0.932 | 743 ms  | 16,619 KiB   | 138 KiB    |
| `/en/aircraft`         | desktop     | 68          | 1681 ms | 1.995 | 32 ms   | 19,771 KiB   | 18,843 KiB |
| `/en/aircraft`         | mobile      | 34          | 6241 ms | 1.876 | 692 ms  | 7,847 KiB    | 6,897 KiB  |
| `/en/aircraft/UPM-018` | desktop     | 75          | 674 ms  | 0.991 | 30 ms   | 1,080 KiB    | 160 KiB    |
| `/en/aircraft/UPM-018` | mobile      | 49          | 3311 ms | 0.932 | 648 ms  | 969 KiB      | 49 KiB     |
| `/en/yachts`           | desktop     | 74          | 911 ms  | 0.991 | 72 ms   | 1,805 KiB    | 818 KiB    |
| `/en/yachts`           | mobile      | 16          | 8480 ms | 0.932 | 1416 ms | 2,281 KiB    | 1,330 KiB  |

The home page's weight is its hero video; the listing's is the full-size photograph behind every
card (`docs/legacy-inventory.md` section 12).

## The budgets

`lighthouserc.cjs` asserts two tiers on desktop, the form factor its runs use.

- **No worse than legacy (errors).** For each of the four pages: LCP, TBT, total byte weight and
  image weight may not exceed the desktop row above. TBT stands in for INP, which a lab run cannot
  measure. Each is compared with the best of the three runs the `lighthouse` job makes.
- **CLS (error)** stays at the 0.1 that was already enforced: the legacy shifted by 0.93 and more,
  so its own number would be no budget at all.
- **The target (warnings).** Lighthouse's own "good" thresholds on desktop, on every page: a
  performance score of 90, LCP within 1200 ms, TBT within 150 ms and a total weight within
  2,667 KiB. Where the legacy number is already lower (LCP and TBT on most pages), the legacy
  budget is the one that binds; the target is what the weight and the listing aim for.

Accessibility and SEO keep their error budgets of 90 and best practices its warning, from
issue #40.

The mobile rows are recorded for comparison, not asserted: the job audits desktop only.
