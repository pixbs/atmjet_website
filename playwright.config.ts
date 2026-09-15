import { defineConfig, devices } from '@playwright/test'

/** Reads .env for local runs (DATABASE_URL, PAYLOAD_SECRET, PLAYWRIGHT_*). */
import 'dotenv/config'

/**
 * Browser tiers (docs/adr/0004-testing-and-ci-strategy.md):
 *   e2e    - user flows (tests/e2e)
 *   visual - pixel parity against committed baselines (tests/visual), reduced motion
 *   a11y   - axe checks (tests/a11y), advisory in CI
 *
 * Targets: a locally built server by default, or a deployed URL when
 * PLAYWRIGHT_BASE_URL is set (Vercel previews send the protection-bypass header).
 * Baselines are generated on Linux only; regenerate with `bun run test:visual:update`.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const isRemoteTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL)
const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

/**
 * Every tier but the cookie specs runs as a visitor who has already answered the cookie question
 * (issue #91): the banner is fixed to the foot of every page, so a run without an answer is a run
 * with a banner over whatever is being tested. The host comes from `baseURL`, so this works
 * against a preview as well as against a local build.
 */
const answered = {
  cookies: ['cookie-consent=true', 'marketing-consent=false', 'personal-consent=false'].map(
    (cookie) => {
      const [name, value] = cookie.split('=')

      return {
        name,
        value,
        domain: new URL(baseURL).hostname,
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
      }
    },
  ),
  origins: [],
}

const chromium = {
  ...devices['Desktop Chrome'],
  channel: 'chromium',
  launchOptions: {
    /* Optional: reuse a pre-installed Chromium (sandboxed CI images) instead of the managed one. */
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  },
} as const

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  use: {
    baseURL,
    storageState: answered,
    trace: 'on-first-retry',
    extraHTTPHeaders: vercelBypassSecret
      ? { 'x-vercel-protection-bypass': vercelBypassSecret }
      : {},
  },
  projects: [
    { name: 'e2e', testDir: './tests/e2e', use: chromium },
    {
      name: 'visual',
      testDir: './tests/visual',
      use: { ...chromium, contextOptions: { reducedMotion: 'reduce' } },
    },
    { name: 'a11y', testDir: './tests/a11y', use: chromium },
  ],
  webServer: isRemoteTarget
    ? undefined
    : {
        /**
         * A build, not `next dev` (issue #292). The dev server re-evaluates its modules as it
         * serves, which loses the Payload instance `src/lib/data/payload.ts` memoises at module
         * scope; building it again runs a drizzle push, and a request that lands while one is in
         * flight is answered with the error page — a 500 for a server read, and a missing intl
         * context for anything holding a client component. Measured over one dev server: 414
         * pushes in 25 minutes of tier runs, five to seven specs lost per run and a different
         * spec each time. Against a build: none, and the tier runs nine times faster.
         *
         * A server already listening is used as it is (`reuseExistingServer`), so `bun run dev`
         * in another terminal is still how a tier is pointed at the dev server on purpose.
         */
        command: 'bun run build && bun run start',
        /**
         * Readiness is checked against the styleguide, not `/`. The home page is a `pages`
         * document (issue #60), so on a database without `bun run seed` the root answers 404
         * and Playwright would wait the full timeout before failing with a webServer error that
         * says nothing about the real cause. The styleguide is a static route and is always
         * there, so a missing seed now surfaces as a failing test instead.
         */
        url: `${baseURL}/en/styleguide`,
        reuseExistingServer: true,
        // The build happens inside this window; the first one on a cold `.next` is the long one.
        timeout: 600_000,
      },
})
