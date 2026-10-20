import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { importLegacyAssets } from '../../scripts/migrate/assets'
import { pngFile } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

/**
 * The legacy pictures landing in Media (issue #84): each once, under its own filename, with the
 * words of its section as alt text, however many times the import runs.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('importing the legacy pictures', () => {
  const suffix = uniqueSuffix()
  const assets = [
    { path: `partners-${suffix}/hero.png`, alt: 'Partners' },
    { path: `citizens-${suffix}/hero.png`, alt: 'Flights for citizens' },
  ]
  const read = () => pngFile().data

  it('creates a document for each picture, the two heroes apart', async () => {
    const outcomes = await importLegacyAssets(registry.payload, { read, assets })
    for (const { id } of outcomes) registry.track('media', id as number)

    expect(outcomes.map((one) => [one.filename, one.action])).toEqual([
      [`partners-${suffix}-hero.png`, 'created'],
      [`citizens-${suffix}-hero.png`, 'created'],
    ])

    const hero = await registry.payload.findByID({
      collection: 'media',
      id: outcomes[0].id as number,
      overrideAccess: true,
    })

    expect(hero).toMatchObject({ filename: `partners-${suffix}-hero.png`, alt: 'Partners' })
  })

  it('finds them again rather than adding a second copy', async () => {
    const outcomes = await importLegacyAssets(registry.payload, { read, assets })
    const { totalDocs } = await registry.payload.count({
      collection: 'media',
      where: { filename: { like: suffix } },
      overrideAccess: true,
    })

    expect(outcomes.map((one) => one.action)).toEqual(['unchanged', 'unchanged'])
    expect(totalDocs).toBe(2)
  })

  it('writes nothing on a dry run', async () => {
    const other = [{ path: `medical-${suffix}/hero.png`, alt: 'Medical aviation' }]
    const outcomes = await importLegacyAssets(registry.payload, {
      read,
      assets: other,
      dryRun: true,
    })
    const { totalDocs } = await registry.payload.count({
      collection: 'media',
      where: { filename: { like: `medical-${suffix}` } },
      overrideAccess: true,
    })

    expect(outcomes).toEqual([
      { path: other[0].path, filename: `medical-${suffix}-hero.png`, action: 'created' },
    ])
    expect(totalDocs).toBe(0)
  })
})
