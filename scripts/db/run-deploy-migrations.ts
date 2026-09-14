/**
 * The migration step of the Vercel build, `bun run ci` (issue #307), run by Payload's own loader
 * under Node because Bun 1.3.14 could not evaluate the config there (the Vercel build of 3dd4174).
 *
 *   payload run scripts/db/run-deploy-migrations.ts
 */
import { migratesOn, pushedByDev } from './deploy-migrations'

const vercelEnv = process.env.VERCEL_ENV
if (!migratesOn(vercelEnv)) {
  console.log(`deploy-migrations: skipped on a ${vercelEnv} build (issue #18)`)
  process.exit(0)
}

const { getPayload } = await import('payload')
const { default: config } = await import('../../src/payload.config')
const payload = await getPayload({ config })
if (await pushedByDev(payload)) {
  console.error(
    'deploy-migrations: `bun run dev` pushed this database, so the migrations cannot apply; reset it and deploy again (issue #307)',
  )
  process.exit(1)
}
await payload.db.migrate()
process.exit(0)
