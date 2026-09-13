/**
 * Seeds the fixture content every environment needs to render (issue #41, ADR-0004): the local
 * admin account and placeholder media today, one entry per collection and page as they land.
 * Idempotent: every document is looked up by its natural key and created only when missing.
 *
 *   bun run seed            (refuses to run with NODE_ENV=production unless SEED_ALLOW_PRODUCTION=1)
 */
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config'
import { seedMedia } from './media'
import { seedPages } from './pages'
import { seedRedirects } from './redirects'
import { summarise, type SeedReport } from './report'
import { seedUsers } from './users'

export async function runSeed(payload: Payload): Promise<SeedReport> {
  const outcomes = [
    ...(await seedUsers(payload)),
    ...(await seedMedia(payload)),
    ...(await seedPages(payload)),
    ...(await seedRedirects(payload)),
  ]
  return summarise(outcomes)
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_ALLOW_PRODUCTION !== '1') {
    console.error(
      'seed: refusing to seed a production environment (set SEED_ALLOW_PRODUCTION=1 to override)',
    )
    process.exit(1)
  }
  const payload = await getPayload({ config: await config })
  const report = await runSeed(payload)
  for (const outcome of report.outcomes)
    console.log(`${outcome.action.padEnd(9)} ${outcome.collection}/${outcome.key}`)
  console.log(
    `seed: ${report.created} created, ${report.updated} updated, ${report.unchanged} unchanged`,
  )
  process.exit(0)
}

if (import.meta.main) {
  await main()
}
