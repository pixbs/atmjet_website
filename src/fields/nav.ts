import type { ArrayField, Field } from 'payload'

/**
 * The shape every navigation list in the chrome shares (issue #61). The legacy navbar, footer
 * and floating menu each hard-coded their own copy of the same twelve links
 * (`docs/legacy-inventory.md` sections 3.3 to 3.5), so adding a page meant editing three files.
 */

/** A link to a page of this site: the label an editor writes, the page it opens. */
const navLinkFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
    localized: true,
    admin: { description: 'The wording shown in this locale.' },
  },
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    // Optional so that deleting a page clears the links to it instead of failing: a required
    // relationship is a NOT NULL column, and the database cannot null it out on delete. A link
    // left without a page is not rendered, and the empty field says which menu needs attention.
    admin: { description: 'The page this link opens. Its slug decides the URL.' },
  },
]

export function navLinks(name: string, description: string): ArrayField {
  return {
    name,
    type: 'array',
    labels: { singular: 'Link', plural: 'Links' },
    fields: navLinkFields,
    admin: { description, initCollapsed: true },
  }
}

/**
 * The booking call to action. `source` is the value the legacy `?showBooking=` query carried
 * (`Header`, `Footer`, `Angle_bar`) and is passed on to Telegram as the lead's origin
 * (`docs/legacy-inventory.md` section 3.9), so it stays editable next to the label it belongs to.
 */
export function bookingCta(source: string): Field {
  return {
    name: 'cta',
    type: 'group',
    fields: [
      { name: 'label', type: 'text', required: true, localized: true },
      {
        name: 'source',
        type: 'text',
        required: true,
        defaultValue: source,
        admin: { description: 'Recorded with the lead so a request can be traced to its button.' },
      },
    ],
  }
}
