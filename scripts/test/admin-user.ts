/**
 * Creates or removes the administrator the admin end-to-end specs sign in as (issue #70).
 *
 * It is a script rather than a function the spec calls, because reaching the Payload config
 * means reaching `next/cache`, which has no extension and no `exports` entry to resolve
 * through: bun finds it, the test runner's loader does not (issue #275). `tests/helpers/
 * seedUser.ts` runs this in a child process.
 *
 * Usage: bun run scripts/test/admin-user.ts create|delete
 */
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

// The password is the run's own (`tests/helpers/admin-user-setup.ts`): this account is created
// in the database a deployment reads, so one written here would open staging to anyone (#422).
const password = process.env.E2E_ADMIN_PASSWORD ?? ''

const TEST_USER = {
  email: 'dev@payloadcms.com',
  password,
  // The specs walk the collection views, which only an administrator may reach.
  roles: ['admin' as const],
}

const action = process.argv[2]
if (action !== 'create' && action !== 'delete') {
  console.error(
    `Usage: bun run scripts/test/admin-user.ts create|delete (got ${action ?? 'nothing'})`,
  )
  process.exit(1)
}

if (action === 'create' && password === '') {
  console.error('admin-user: E2E_ADMIN_PASSWORD is not set, and no administrator gets a known one')
  process.exit(1)
}

const payload = await getPayload({ config })

// Both paths start by removing the user, so `create` is idempotent across re-runs.
await payload.delete({ collection: 'users', where: { email: { equals: TEST_USER.email } } })

if (action === 'create') {
  await payload.create({ collection: 'users', data: TEST_USER })
}

process.exit(0)
