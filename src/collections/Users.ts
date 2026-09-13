import type { CollectionConfig } from 'payload'

import { admin, adminFieldOnly, adminOrSelf, DEFAULT_ROLE, ROLES } from '@/access'

/**
 * The people who run the site (issue #70). The legacy admin had one shared table of usernames
 * and plain-text passwords with no roles and no lockout (`docs/legacy-inventory.md` section 14);
 * every rule here is explicit and covered by `tests/int/access.int.spec.ts`.
 *
 * Payload still lets the very first user be created while the collection is empty, so a fresh
 * environment can be bootstrapped through `/admin` even though `create` is admin-only.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles', 'updatedAt'],
  },
  auth: {
    // A stolen password is worth less if guessing is slow: five tries, then a ten-minute lock.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // No API keys until something needs one; an unused key is only ever a liability.
    useAPIKey: false,
  },
  access: {
    // A person may see and edit themselves; only an admin sees or changes everyone.
    read: adminOrSelf,
    create: admin,
    update: adminOrSelf,
    delete: admin,
    // Who may reach the admin panel at all.
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: [DEFAULT_ROLE],
      options: ROLES.map((role) => ({ label: role, value: role })),
      access: {
        // Without this an editor could add `admin` to their own roles and take over the site.
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      admin: {
        description: 'Editors run the content. Admins also run the people and the settings.',
      },
    },
  ],
}
