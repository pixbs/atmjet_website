/**
 * `bun run db:reset` (issue #22): the one command that takes a clone from nothing to a site that
 * renders — drop what is there, apply the committed migrations, clear the uploads, seed.
 *
 * It is a development command and says so: it refuses a production environment, because dropping
 * a database is not something to discover you have done.
 *
 *   docker compose up -d && bun run db:reset && bun run dev
 */
import { rm } from 'node:fs/promises'
import path from 'node:path'

import { runSeed } from '../seed'
import { clearableUploads, RESET_OVERRIDE, resetsOn } from './reset-rules'

if (!resetsOn(process.env.NODE_ENV, process.env[RESET_OVERRIDE])) {
  console.error(
    `db:reset: refusing to drop a production database (set ${RESET_OVERRIDE}=1 to override)`,
  )
  process.exit(1)
}

const { getPayload } = await import('payload')
const { default: config } = await import('../../src/payload.config')
const payload = await getPayload({ config })

// Without the prompt: drop every table the migrations own, then run them all.
await payload.db.migrateFresh({ forceAcceptWarning: true })
console.log('db:reset: schema dropped and migrated')

/**
 * The files go with the rows. A reset that leaves them behind is not one: the seed writes its
 * placeholders under the names it looks them up by, and Payload renames a file whose name is
 * already taken, so the second run stores `seed-gold-1.png` and the pages that ask for
 * `seed-gold.png` find nothing.
 *
 * Only where the uploads are this machine's: an environment with S3 configured keeps them there,
 * and this is a local command.
 */
const upload = payload.collections.media?.config?.upload as { staticDir?: string } | undefined
const uploads = clearableUploads(process.cwd(), upload?.staticDir)

if (uploads === null) {
  console.warn('db:reset: leaving the uploads alone, they are outside this project')
} else {
  await rm(uploads, { recursive: true, force: true })
  console.log(`db:reset: cleared ${path.relative(process.cwd(), uploads)}`)
}

const report = await runSeed(payload)
console.log(
  `db:reset: seeded ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged`,
)
process.exit(0)
