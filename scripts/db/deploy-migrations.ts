/**
 * What the migration step of the Vercel build decides (issue #307): `payload migrate` exits 0
 * without migrating when nobody answers its dev-push prompt, so the build ran on an empty database.
 * `run-deploy-migrations.ts` acts on it; this file stays free of the config so the unit tier loads it alone.
 */
import type { Payload } from 'payload'

/**
 * Every deployment migrates the database it reads: production its own, a preview the Neon branch
 * the Vercel integration creates for it (issue #18). Only `vercel dev` is left alone, since it
 * reads a developer's database that `bun run dev` pushes.
 */
export function migratesOn(vercelEnv: string | undefined): boolean {
  return vercelEnv !== 'development'
}

/** `bun run dev` pushes the schema and records it as a migration in batch -1. */
export async function pushedByDev(payload: Pick<Payload, 'count'>): Promise<boolean> {
  try {
    const { totalDocs } = await payload.count({
      collection: 'payload-migrations',
      where: { batch: { equals: -1 } },
    })
    return totalDocs > 0
  } catch (error) {
    // A database nothing has migrated has no migrations table yet (42P01, undefined_table).
    if ((error as { cause?: { code?: string } }).cause?.code === '42P01') return false
    throw error
  }
}
