import type { Access, FieldAccess } from 'payload'

import { hasRole } from './roles'

export { DEFAULT_ROLE, hasRole, ROLES, rolesOf, type Role } from './roles'

/** Public. Used for content a visitor must be able to read without signing in. */
export const anyone: Access = () => true

/** Any signed-in user, whatever their role. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** Administrators only: people, roles and anything that changes how the site is run. */
export const admin: Access = ({ req: { user } }) => hasRole(user, 'admin')

/** The people who run the content. Admins can do everything an editor can. */
export const editorOrAdmin: Access = ({ req: { user } }) => hasRole(user, 'editor', 'admin')

/**
 * Public reads see published documents only; the people who run the content see everything, so
 * live preview and the admin list view keep working. Returns a query constraint rather than a
 * boolean, which is how Payload filters a list instead of rejecting it outright.
 */
export const publishedOnly: Access = ({ req: { user } }) => {
  if (hasRole(user, 'editor', 'admin')) return true

  return { _status: { equals: 'published' } }
}

/** An administrator, or the user themselves: used for a profile a person may edit. */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, 'admin')) return true

  return { id: { equals: user.id } }
}

/**
 * Field-level guard for anything that would let someone widen their own access. Without it an
 * editor could add `admin` to their own roles and quietly take over the site.
 */
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')
