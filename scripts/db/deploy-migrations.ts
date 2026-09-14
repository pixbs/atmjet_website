/**
 * The migration step of the Vercel build, `bun run ci` (issue #307): `payload migrate` exits 0 without
 * migrating when nobody answers its dev-push prompt, so the build ran on an empty database.
 *
 *   bun run scripts/db/deploy-migrations.ts
 */
import type { Payload } from 'payload'

/** Previews share the production database until they get branches of their own (issue #18). */
export function migratesOn(vercelEnv: string | undefined): boolean {
  return vercelEnv === undefined || vercelEnv === 'production'
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

async function main(): Promise<void> {
  const vercelEnv = process.env.VERCEL_ENV
  if (!migratesOn(vercelEnv)) {
    console.log(`deploy-migrations: skipped on a ${vercelEnv} build (issue #18)`)
    process.exit(0)
  }
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../../src/payload.config'),
  ])
  const payload = await getPayload({ config })
  if (await pushedByDev(payload)) {
    console.error(
      'deploy-migrations: `bun run dev` pushed this database, so the migrations cannot apply; reset it and deploy again (issue #307)',
    )
    process.exit(1)
  }
  await payload.db.migrate()
  process.exit(0)
}

if (import.meta.main) {
  await main()
}
