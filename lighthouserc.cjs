/**
 * Lighthouse budgets (issues #40 and #43, ADR-0004), run by `bun run test:lighthouse` against a
 * local server and by the `lighthouse` job of `.github/workflows/e2e.yml` against a deployment.
 *
 * CommonJS because Lighthouse CI loads the config with `require`, and this package is ESM.
 */
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const KIB = 1024

/**
 * The legacy site's desktop medians in milliseconds and KiB, the preset every run of this config
 * uses (`docs/performance-baseline.md`, issue #43): no page may do worse. TBT stands in for INP,
 * which a lab run cannot measure. CLS is not here: the legacy shifted by 0.93 and more, and the
 * 0.1 below was already enforced and already held.
 */
/**
 * Lighthouse's own "good" on desktop. A timing is an error past the slower of this and the legacy
 * number and a warning past the faster: under this line two runs of one site differ by more than
 * the gap it would hold (the legacy yachts page measured 672 and 911 ms on the same day).
 */
const GOOD = { lcp: 1200, tbt: 150 }

const LEGACY = [
  { page: '/en/?$', lcp: 944, tbt: 33, bytes: 14297, images: 338 },
  { page: '/en/aircraft/?$', lcp: 1681, tbt: 32, bytes: 19771, images: 18843 },
  { page: '/en/aircraft/[^/]+/?$', lcp: 674, tbt: 30, bytes: 1080, images: 160 },
  { page: '/en/yachts/?$', lcp: 911, tbt: 72, bytes: 1805, images: 818 },
]

module.exports = {
  ci: {
    collect: {
      // The four pages of the budgets; `MOUSE` is the seeded aircraft (`bun run seed`).
      url: ['/en', '/en/aircraft', '/en/aircraft/MOUSE', '/en/yachts'].map(
        (path) => `http://localhost:3000${path}`,
      ),
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless=new',
        // A preview deployment is behind Vercel's protection, and without the bypass Lighthouse
        // follows the redirect and scores the login page instead of the site (issue #246). As a
        // header rather than the query parameter, so the secret stays out of the report the run
        // uploads; a local run sets nothing, and an empty header reads as a failed bypass.
        ...(bypass ? { extraHeaders: { 'x-vercel-protection-bypass': bypass } } : {}),
      },
    },
    assert: {
      assertMatrix: [
        {
          // Every page. The warnings are the target: a score and a weight Lighthouse calls good.
          assertions: {
            'categories:performance': ['warn', { minScore: 0.9 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'categories:best-practices': ['warn', { minScore: 0.9 }],
            'categories:seo': ['error', { minScore: 0.9 }],
            'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
            'total-byte-weight': ['warn', { maxNumericValue: 2667 * KIB }],
          },
        },
        ...LEGACY.flatMap(({ page, lcp, tbt, bytes, images }) => [
          {
            matchingUrlPattern: page,
            assertions: {
              'largest-contentful-paint': ['error', { maxNumericValue: Math.max(lcp, GOOD.lcp) }],
              'total-blocking-time': ['error', { maxNumericValue: Math.max(tbt, GOOD.tbt) }],
              'total-byte-weight': ['error', { maxNumericValue: bytes * KIB }],
              'resource-summary:image:size': ['error', { maxNumericValue: images * KIB }],
            },
          },
          {
            // The target: the faster of the legacy and "good", reported rather than blocking.
            matchingUrlPattern: page,
            assertions: {
              'largest-contentful-paint': ['warn', { maxNumericValue: Math.min(lcp, GOOD.lcp) }],
              'total-blocking-time': ['warn', { maxNumericValue: Math.min(tbt, GOOD.tbt) }],
            },
          },
        ]),
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
