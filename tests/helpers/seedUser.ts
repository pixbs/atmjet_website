import { execFileSync } from 'node:child_process'

/**
 * The administrator the admin specs sign in as (issue #70).
 *
 * The seeding runs in a child process: it needs the Payload config, and loading that in the
 * test runner means resolving the extensionless `next/cache` of `@/hooks/revalidate`, which
 * only a loader that guesses extensions can do — bun does, the runner's does not (issue #275).
 * Keeping the browser tiers clear of `src/` is what lets them load at all.
 */
export const testUser = {
  email: 'dev@payloadcms.com',
  // Generated for the run by `admin-user-setup.ts` and inherited by every worker (#422).
  get password(): string {
    return process.env.E2E_ADMIN_PASSWORD ?? ''
  },
  roles: ['admin' as const],
}

const SCRIPT = 'scripts/test/admin-user.ts'

function run(action: 'create' | 'delete'): void {
  execFileSync('bun', ['run', SCRIPT, action], { stdio: 'inherit' })
}

/** A fresh administrator, whatever the last run left behind. */
export function seedTestUser(): void {
  run('create')
}

export function cleanupTestUser(): void {
  run('delete')
}
