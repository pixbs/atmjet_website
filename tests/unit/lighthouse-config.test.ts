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
const VARIABLE = 'VERCEL_AUTOMATION_BYPASS_SECRET'

const original = process.env[VARIABLE]

function collectSettings(secret: string | undefined): Record<string, unknown> {
  if (secret === undefined) delete process.env[VARIABLE]
  else process.env[VARIABLE] = secret

  // The config reads the environment as it loads, the way Lighthouse CI requires it.
  delete require.cache[CONFIG]

  return require(CONFIG).ci.collect.settings
}

afterEach(() => {
  if (original === undefined) delete process.env[VARIABLE]
  else process.env[VARIABLE] = original
})

describe('lighthouse config', () => {
  it('asks the deployment to let it past the protection', () => {
    const { extraHeaders } = collectSettings('a-preview-secret')

    expect(extraHeaders).toEqual({ 'x-vercel-protection-bypass': 'a-preview-secret' })
  })

  it('sends no header at all when nothing is protected', () => {
    // An empty bypass header is read as a failed one, so a local run against `bun run dev` must
    // send none rather than an empty string.
    expect(collectSettings(undefined)).not.toHaveProperty('extraHeaders')
    expect(collectSettings('')).not.toHaveProperty('extraHeaders')
  })
})
