import type { ClientUser, TypedUser } from 'payload'

/**
 * Who can do what (docs/access-matrix.md). Two roles are enough for this site: editors run the
 * content, admins also run the people and the settings.
 *
 * The legacy admin had no roles at all, left the yacht routes unauthenticated and stored
 * passwords in plain text (docs/legacy-inventory.md section 14), so every rule here is
 * explicit and every one of them is tested.
 */
export const ROLES = ['admin', 'editor'] as const

export type Role = (typeof ROLES)[number]

export const DEFAULT_ROLE: Role = 'editor'

/**
 * Anything that might carry roles. `req.user` on the server is a full `TypedUser`, but the admin
 * hands components a `ClientUser`, which is the same person with fewer fields; both are read the
 * same way here, and neither is trusted to have the shape it claims.
 */
export type RoleBearer = TypedUser | ClientUser | { roles?: unknown } | null | undefined

/** Narrows whatever is on `req.user` to the roles it actually carries. */
export function rolesOf(user: RoleBearer): Role[] {
  const raw = (user as { roles?: unknown } | null | undefined)?.roles
  if (!Array.isArray(raw)) return []

  return raw.filter((entry): entry is Role => (ROLES as readonly unknown[]).includes(entry))
}

export function hasRole(user: RoleBearer, ...accepted: Role[]): boolean {
  const held = rolesOf(user)
  return accepted.some((role) => held.includes(role))
}
