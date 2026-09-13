import type { CollectionConfig, RelationshipField } from 'payload'

import { admin, adminFieldOnly, hasRole } from '@/access'

/**
 * The people behind a yacht (issue #67). The legacy `contact` table is four columns — `id`,
 * `name`, `phone`, `email` — referenced by `new_yachts.contact_id` and `captain_id` with no
 * foreign key, never queried by the site and with no screen in the legacy admin
 * (`docs/legacy-inventory.md` section 8). It is, in other words, a pile of personal data that
 * nothing has ever needed to show.
 *
 * So the rule here is the tightest one that still lets somebody maintain the data: administrators
 * only, on every operation, and the relationships that point at it carry the same rule at field
 * level (`contactRelationship` below). Anonymous callers do not get a contact, do not get a
 * contact's id, and do not learn that a yacht has one. Editors do not either: running the content
 * does not require a broker's mobile number.
 *
 * `role` and `photo` have no legacy column; the issue asks for them, so they are here for editors
 * to fill in and the import of E5.9 leaves them empty. The role a person plays on a particular
 * yacht is not one of them — that is which relationship points at them, `contact` or `captain`.
 *
 * No drafts and no revalidation hooks: nothing public renders a contact, so there is no published
 * state to model and no cached page to drop.
 */
const CONTACTS_SLUG = 'contacts'

/** Where a contact document came from, per ADR-0002 section 8. */
const CONTACT_ORIGINS = ['contact-legacy', 'manual'] as const

/**
 * A relationship to a contact, for the collections that reference one — Yachts (E4.6) carries
 * two, from the legacy `contact_id` and `captain_id`.
 *
 * The field declares its own access rather than relying on the collection's. Collection access
 * alone stops Payload populating the document, but the stored id still comes back on the parent,
 * which is one lookup away from the person. Field access removes the field outright, which is
 * what the acceptance criterion of issue #67 asks for.
 */
export function contactRelationship(field: {
  name: string
  label?: string
  description?: string
}): RelationshipField {
  return {
    name: field.name,
    label: field.label,
    type: 'relationship',
    relationTo: CONTACTS_SLUG,
    index: true,
    access: {
      read: adminFieldOnly,
      create: adminFieldOnly,
      update: adminFieldOnly,
    },
    admin: {
      description:
        field.description ??
        'Personal data: visible to administrators only, and never part of a public response.',
    },
  }
}

export const Contacts: CollectionConfig = {
  slug: CONTACTS_SLUG,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'email'],
    group: 'People',
    description: 'Personal data. Administrators only, and never rendered on the public site.',
    // An editor cannot read the collection, so showing it in their sidebar would only offer
    // them a screen that fails.
    hidden: ({ user }) => !hasRole(user, 'admin'),
  },
  access: {
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'From the legacy contact.name.' },
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description:
          'What this person does, in their own words: captain, broker, owner. No legacy column, so the import leaves it empty.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: { description: 'From the legacy contact.phone. Personal data.' },
    },
    {
      name: 'email',
      type: 'email',
      admin: { description: 'From the legacy contact.email. Personal data.' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'No legacy column, so the import leaves it empty. Media is public: do not upload anything here that the person would not want served from a URL.',
      },
    },
    {
      type: 'group',
      name: 'provenance',
      label: 'Provenance',
      admin: { description: 'Where this document came from (ADR-0002 section 8).' },
      fields: [
        {
          name: 'origin',
          type: 'select',
          required: true,
          defaultValue: 'manual',
          options: CONTACT_ORIGINS.map((origin) => ({ label: origin, value: origin })),
          index: true,
        },
        { name: 'legacyContactId', type: 'number', index: true },
        { name: 'importRunId', type: 'text', index: true },
        { name: 'importedAt', type: 'date' },
      ],
    },
  ],
}
