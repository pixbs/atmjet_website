import type { Payload } from 'payload'
import type { SeedOutcome } from './report'

/** The local admin account; overridable through the environment, never seeded in production. */
export const SEED_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL ?? 'dev@atmjet.local',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'dev-password-change-me',
  // A local environment needs someone who can create the other accounts (issue #70).
  roles: ['admin' as const],
}

export async function seedUsers(payload: Payload): Promise<SeedOutcome[]> {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: SEED_ADMIN.email } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) {
    return [
      { collection: 'users', key: SEED_ADMIN.email, action: 'unchanged', id: existing.docs[0].id },
    ]
  }
  const created = await payload.create({
    collection: 'users',
    data: SEED_ADMIN,
    overrideAccess: true,
  })
  return [{ collection: 'users', key: SEED_ADMIN.email, action: 'created', id: created.id }]
}
