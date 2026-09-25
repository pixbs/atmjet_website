import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { legacyPaths, legacyReferences } from '../../scripts/migrate/urls'
import { getTestPayload } from '../helpers/payload'
import { dropFixture, FIXTURE_SCHEMA, loadFixture } from './fixture'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

/**
 * The URLs `bun run import:legacy urls` asks a deployment (issue #85), read from the legacy
 * tables that published them: every plane's tail number, every catalogue and charter slug.
 */
let payload: Payload

beforeAll(async () => {
  payload = await getTestPayload()
  await loadFixture(payload, ['aircraft.sql', 'vehicles.sql', 'charter.sql'])
})

afterAll(async () => {
  await dropFixture(payload)
})

describe('the URLs the legacy tables published', () => {
  it('are the planes of vehicles, the catalogue slugs and the charter slugs', async () => {
    const paths = legacyPaths(await legacyReferences(payload, FIXTURE_SCHEMA))

    expect(paths).toEqual(
      expect.arrayContaining([
        '/aircraft/zz-001',
        '/en/aircraft/ZZ-777',
        '/ru/aircraft/ZZ888',
        '/en/aircraft/zzjet-zz-001',
        '/en/yachts/zeta_one',
        '/en/yachts/nameless',
      ]),
    )
    // Four plane rows, one of them the same tail number written again, and no URL for the
    // yacht rows, which had no tail number.
    expect(paths.filter((path) => path.startsWith('/aircraft/'))).toHaveLength(3)
  })
})
