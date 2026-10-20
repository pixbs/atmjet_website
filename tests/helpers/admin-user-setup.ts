import { randomBytes } from 'node:crypto'

import { seedTestUser } from './seedUser'

/**
 * The administrator the browser tiers sign in as, created once for the whole run (issue #343).
 *
 * It used to be created and deleted by every spec file that needed one, and four of them sign
 * in as the same administrator: with workers running in parallel, one file's teardown deleted
 * the user another was signing in as. It is the run's state rather than any one file's, so
 * Playwright creates it before the run and removes it after.
 */
export default function createAdminUser(): void {
  // A password nobody has read: the account lives, for the length of a run, in the database a
  // deployment reads (#422). Set here, it reaches the workers and the child that creates it.
  process.env.E2E_ADMIN_PASSWORD ||= randomBytes(24).toString('base64url')
  seedTestUser()
}
