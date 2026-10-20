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

`lighthouserc.cjs` asserts two tiers on desktop, the form factor its runs use, for each of the five
pages. TBT stands in for INP, which a lab run cannot measure.

The `lighthouse` job audits the home page, the aircraft listing, the yachts page and two aircraft
pages, one per layout (issue #428), each checked by the section only that layout renders:

- **Basic layout:** `UPM-018`, the legacy row's own aircraft, or, with a warning, the seed's
  `GATMB` where the deployment has not imported it. No listing card links to the basic layout, because the listing
  needs a photograph. It is held to the `UPM-018` row above.
- **Gallery layout:** `vh-bsm`, or, with a warning, the first listing card that draws a gallery. It
  is pinned because its image weight is that of its photographs (the hero alone weighs 43 to
  268 KiB from one aircraft to the next) and the listing shows the newest aircraft first.

The job fails if either page is missing. A local run audits the seed's `GATMB` and `MOUSE`.

The legacy never measured a gallery page, so that page has a budget of its own. **A page the legacy
never had gets the CI maximum plus 20% for the weight it adds, and the legacy detail page's numbers
where layout does not matter.** For `vh-bsm`, images may weigh 360 KiB (the CI maximum was 301 KiB
over 21 audits from 2026-10-14 to 2026-10-16, 150 of them the footer photograph the runner loads
lazily). Its total weight, LCP and TBT keep the `UPM-018` numbers.

- **Errors: no worse than legacy.** Total byte weight and image weight may not exceed the desktop
  row above. LCP and TBT may not exceed the legacy number or Lighthouse's own "good" (1200 ms and
  150 ms on desktop), whichever is higher. Below that line the timings are noise rather than a
  difference: the legacy's two measurements on the same day moved the yachts page from 672 to
  911 ms and the home page from 858 to 944 ms, more than the gap an exact budget would police.
- **Warnings: the target.** LCP and TBT past the lower of the two numbers, so a page slower than
  the legacy is reported on every run even where it is not blocked; a performance score of 90 and
  a total weight within 2,667 KiB on every page.
- **CLS (error)** stays at the 0.1 that was already enforced: the legacy shifted by 0.93 and more,
  so its own number would be no budget at all.

Each is compared with the best of the three runs the `lighthouse` job makes. Accessibility and SEO
keep their error budgets of 90 and best practices its warning, from issue #40. The mobile rows are
recorded for comparison, not asserted: the job audits desktop only.

## The rewrite on staging

The first run of the four pages against staging (e2e run
[36139603300](https://github.com/pixbs/atmjet_website/actions/runs/36139603300), 2026-09-25, best
of three), with the seed's content and pictures:

| Page                 | LCP     | Legacy LCP | Result                                |
| -------------------- | ------- | ---------- | ------------------------------------- |
| `/en`                | 1058 ms | 944 ms     | within "good", 114 ms over the legacy |
| `/en/aircraft`       | passed  | 1681 ms    | within both                           |
| `/en/aircraft/9HATM` | 927 ms  | 674 ms     | within "good", over the legacy        |
| `/en/yachts`         | 968 ms  | 911 ms     | within "good", 57 ms over the legacy  |

Every weight, TBT, CLS and category budget passed. On each page the largest paint is a heading
that enters with the legacy's own animation once the page has hydrated, so the gap is the time to
hydrate rather than the markup. The staging detail page is a catalogue aircraft with its gallery,
where the legacy row is the basic layout, so that row compared two different pages until each
layout was audited on its own (issue #428).
