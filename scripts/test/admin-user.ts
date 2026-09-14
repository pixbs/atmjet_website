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

const TEST_USER = {
  email: 'dev@payloadcms.com',
  password: 'test',
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

const payload = await getPayload({ config })

// Both paths start by removing the user, so `create` is idempotent across re-runs.
await payload.delete({ collection: 'users', where: { email: { equals: TEST_USER.email } } })

if (action === 'create') {
  await payload.create({ collection: 'users', data: TEST_USER })
}

process.exit(0)
