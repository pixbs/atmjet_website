/**
 * Lighthouse budgets (issue #40, ADR-0004), run by `bun run test:lighthouse` against a local
 * server and by the `lighthouse` job of `.github/workflows/e2e.yml` against a Vercel preview.
 *
 * CommonJS because Lighthouse CI loads the config with `require`, and this package is ESM.
 */
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
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
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
