import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * The order the `tests and build` job runs its steps in (issue #252).
 *
 * `tests/int/seed.int.spec.ts` runs the seed and registers what it creates with the test
 * registry, so it deletes the fixture content on its way out. A build that follows it reads an
 * empty database and prerenders nothing — quietly, because an empty database is also the
 * legitimate answer for a preview with no content yet (`listPageParams`). The build then proves
 * nothing about the pages, which is the one thing it is there for, so the order is pinned here.
 */
const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')

const commandAt = (command: string, from = 0): number => {
  const at = workflow.indexOf(`run: bun run ${command}`, from)
  expect(at, `\`bun run ${command}\` is not in the workflow after ${from}`).toBeGreaterThan(-1)

  return at
}

describe('the tests and build job', () => {
  it('seeds the fixture content again before it builds against it', () => {
    const tests = commandAt('test:int')
    const build = commandAt('build', tests)
    const seed = commandAt('seed', tests)

    expect(seed, 'the seed must run after the tests that delete what it wrote').toBeLessThan(build)
  })

  it('builds after the tests, so a broken page fails the same job', () => {
    expect(commandAt('build', commandAt('test:int'))).toBeGreaterThan(commandAt('test:int'))
  })
})
