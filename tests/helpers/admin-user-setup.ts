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
  seedTestUser()
}
