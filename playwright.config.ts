import { defineConfig, devices } from '@playwright/test'

/** Reads .env for local runs (DATABASE_URL, PAYLOAD_SECRET, PLAYWRIGHT_*). */
import 'dotenv/config'

/**
 * Browser tiers (docs/adr/0004-testing-and-ci-strategy.md):
 *   e2e    - user flows (tests/e2e)
 *   visual - pixel parity against committed baselines (tests/visual), reduced motion
 *   a11y   - axe checks (tests/a11y), advisory in CI
 *
 * Targets: the local dev server by default, or a deployed URL when
 * PLAYWRIGHT_BASE_URL is set (Vercel previews send the protection-bypass header).
 * Baselines are generated on Linux only; regenerate with `bun run test:visual:update`.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const isRemoteTarget = Boolean(process.env.PLAYWRIGHT_BASE_URL)
const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

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
        command: 'bun run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
