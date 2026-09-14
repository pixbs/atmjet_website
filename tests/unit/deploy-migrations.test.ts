import type { Payload } from 'payload'
import { describe, expect, it } from 'vitest'

import { migratesOn, pushedByDev } from '../../scripts/db/deploy-migrations'

type CountArgs = { where: { batch: { equals: number } } }

/** A migrations table holding one row per batch number, answering `payload.count` as Postgres would. */
const migrationsTable = (batches: number[]) =>
  ({
    count: async ({ where }: CountArgs) => ({
      totalDocs: batches.filter((batch) => batch === where.batch.equals).length,
    }),
  }) as unknown as Pick<Payload, 'count'>

const failing = (error: Error) =>
  ({
    count: async () => {
      throw error
    },
  }) as unknown as Pick<Payload, 'count'>

describe('the migration step of the Vercel build (issue #307)', () => {
  it('migrates a production build and a build outside Vercel', () => {
    expect(migratesOn('production')).toBe(true)
    expect(migratesOn(undefined)).toBe(true)
  })

  it('leaves the shared database alone on a preview or development build', () => {
    expect(migratesOn('preview')).toBe(false)
    expect(migratesOn('development')).toBe(false)
  })

  it('stops on a database that bun run dev pushed', async () => {
    await expect(pushedByDev(migrationsTable([1, 1, -1]))).resolves.toBe(true)
  })

  it('goes ahead on a database only migrations have touched', async () => {
    await expect(pushedByDev(migrationsTable([1, 1, 2]))).resolves.toBe(false)
  })

  it('goes ahead on a database without a migrations table yet', async () => {
    const undefinedTable = new Error('Failed query', {
      cause: Object.assign(new Error('relation "payload_migrations" does not exist'), {
        code: '42P01',
      }),
    })

    await expect(pushedByDev(failing(undefinedTable))).resolves.toBe(false)
  })

  it('does not swallow any other database error', async () => {
    const refused = new Error('Failed query', {
      cause: Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }),
    })

    await expect(pushedByDev(failing(refused))).rejects.toBe(refused)
  })
})
