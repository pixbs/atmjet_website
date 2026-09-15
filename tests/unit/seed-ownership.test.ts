import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Who may run the seed (issue #306).
 *
 * The seed writes shared fixture content keyed by slug, filename and path — not by
 * `uniqueSuffix` like everything else a suite creates. Vitest gives every file its own worker
 * against one database, so two suites that seed, or one that seeds while another deletes what
 * the seed wrote, race each other: the tier failed about one run in three that way, always on an
 * assertion about a seeded document and never in the same spec twice.
 *
 * The rule that replaces the race is that the fixture has one owner
 * (`tests/int/seed.int.spec.ts`, `tests/README.md`), and a rule nothing enforces is a comment.
 * Reading the list the seed keeps is not running it, so importing `SEED_IMAGES` stays allowed:
 * what is counted here is the functions that write.
 */
const SPECS = new URL('../int/', import.meta.url)
const OWNER = 'seed.int.spec.ts'

const IMPORTED_FROM_SEED = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'[^']*scripts\/seed[^']*'/g

/** The seed functions a file imports: `runSeed` and the `seedX` one per part of the fixture. */
function seedFunctionsIn(source: string): string[] {
  return [...source.matchAll(IMPORTED_FROM_SEED)]
    .flatMap((match) => match[1].split(','))
    .map((name) => name.trim().split(/\s+as\s+/)[0])
    .filter((name) => /^(runSeed$|seed[A-Z])/.test(name))
}

describe('the seeded fixture', () => {
  it('is written by one suite, so no two workers seed the same database at once', () => {
    const seeders = readdirSync(SPECS)
      .filter((name) => name.endsWith('.int.spec.ts'))
      .filter((name) => seedFunctionsIn(readFileSync(new URL(name, SPECS), 'utf8')).length > 0)

    expect(seeders).toEqual([OWNER])
  })

  it('counts a suite that writes the fixture, not one that reads the list of it', () => {
    expect(seedFunctionsIn(`import { SEED_IMAGES } from '../../scripts/seed/media'`)).toEqual([])
    expect(seedFunctionsIn(`import { PAGE_SLUGS } from '../../src/collections/Pages'`)).toEqual([])
    expect(seedFunctionsIn(`import { runSeed } from '../../scripts/seed'`)).toEqual(['runSeed'])
    expect(
      seedFunctionsIn(
        `import { LEGACY_REDIRECTS, seedRedirects } from '../../scripts/seed/redirects'`,
      ),
    ).toEqual(['seedRedirects'])
  })
})
