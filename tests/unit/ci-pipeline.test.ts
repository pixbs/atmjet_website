import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * The order the `tests and build` job runs its steps in (issues #252 and #306).
 *
 * One seed, before both readers of the fixture: the integration tier and the build that
 * prerenders the pages. It ran a second time between them until `tests/int/seed.int.spec.ts`
 * stopped registering what the seed creates with the test registry — until then the tier deleted
 * the fixture on its way out, and a build that followed read an empty database and prerendered
 * nothing, quietly, because an empty database is also the legitimate answer for a preview with
 * no content yet (`listPageParams`). The build proves something about the pages only in this
 * order, so it is pinned here.
 */
const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')

const commandAt = (command: string, from = 0): number => {
  const at = workflow.indexOf(`run: bun run ${command}`, from)
  expect(at, `\`bun run ${command}\` is not in the workflow after ${from}`).toBeGreaterThan(-1)

  return at
}

describe('the tests and build job', () => {
  it('seeds the fixture once, before the tier and the build that read it', () => {
    const seed = commandAt('seed')
    const tests = commandAt('test:int')

    expect(seed, 'the fixture must exist before the suites that read it').toBeLessThan(tests)
    expect(seed).toBeLessThan(commandAt('build', tests))
    expect(
      workflow.indexOf('run: bun run seed', seed + 1),
      'one seed is enough: the tier leaves the fixture where it found it (issue #306)',
    ).toBe(-1)
  })

  it('builds after the tests, so a broken page fails the same job', () => {
    expect(commandAt('build', commandAt('test:int'))).toBeGreaterThan(commandAt('test:int'))
  })
})
