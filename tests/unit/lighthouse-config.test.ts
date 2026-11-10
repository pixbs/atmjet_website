import { createRequire } from 'node:module'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * How Lighthouse reaches a protected preview deployment (issue #246). Without the bypass it
 * follows Vercel's redirect and scores the login page, which is how every budget recorded so far
 * described a page that is not this site. The budgets themselves are asserted by the run, not
 * pinned here.
 */
const require = createRequire(import.meta.url)
const CONFIG = require.resolve('../../lighthouserc.cjs')
const VARIABLES = ['VERCEL_AUTOMATION_BYPASS_SECRET', 'LHCI_PREVIEW'] as const

const original = Object.fromEntries(VARIABLES.map((name) => [name, process.env[name]]))

function setVariable(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}

function collectSettings(
  secret: string | undefined,
  preview?: string,
): Record<string, unknown> & { extraHeaders?: Record<string, unknown>; skipAudits?: string[] } {
  setVariable('VERCEL_AUTOMATION_BYPASS_SECRET', secret)
  setVariable('LHCI_PREVIEW', preview)

  // The config reads the environment as it loads, the way Lighthouse CI requires it.
  delete require.cache[CONFIG]

  return require(CONFIG).ci.collect.settings
}

afterEach(() => {
  for (const name of VARIABLES) setVariable(name, original[name])
})

describe('lighthouse config', () => {
  it('asks the deployment to let it past the protection', () => {
    const { extraHeaders } = collectSettings('a-preview-secret')

    expect(extraHeaders).toMatchObject({ 'x-vercel-protection-bypass': 'a-preview-secret' })
  })

  it('asks a preview to leave out the toolbar the site never ships (issue #478)', () => {
    const toolbar = collectSettings('a-preview-secret').extraHeaders?.['x-vercel-skip-toolbar']

    // LHCI hands settings to Lighthouse as CLI flags, which turn a numeric value into a number
    // that Chrome refuses as a header.
    expect(toolbar).toEqual(expect.any(String))
    expect(Number.isNaN(Number(toolbar))).toBe(true)
  })

  it('sends no header at all when nothing is protected', () => {
    // An empty bypass header is read as a failed one, so a local run against `bun run dev` must
    // send none rather than an empty string.
    expect(collectSettings(undefined)).not.toHaveProperty('extraHeaders')
    expect(collectSettings('')).not.toHaveProperty('extraHeaders')
  })

  it('leaves out on a preview only the audits its protection decides (issue #478)', () => {
    expect(collectSettings('a-preview-secret', 'true').skipAudits).toEqual([
      'is-crawlable',
      'robots-txt',
    ])
    expect(collectSettings('a-preview-secret', 'false').skipAudits).toEqual([])
    expect(collectSettings(undefined).skipAudits).toEqual([])
  })
})
