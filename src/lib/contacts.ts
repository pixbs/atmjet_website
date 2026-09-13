/**
 * Contact projection (issue #67).
 *
 * The legacy `contact` table holds personal data — a name, a phone number and an e-mail address
 * (`docs/legacy-inventory.md` section 8) — and is referenced by `new_yachts.contact_id` and
 * `captain_id`. The site never read either column, so no page ever rendered a contact and the
 * parity answer for "what may the public see" is: nothing.
 *
 * That answer is written down here rather than assumed, so the day somebody decides a yacht page
 * should show a broker's name, the change is one entry in `PUBLIC_CONTACT_FIELDS` and the phone
 * number and e-mail address still cannot follow it out.
 */

/** The shape a contact has once it is populated, as much of it as a projection cares about. */
export interface ContactFields {
  name?: string | null
  role?: string | null
  phone?: string | null
  email?: string | null
}

/**
 * Fields that are personal data. They are never projected, whatever a caller asks for: an
 * allowlist somebody widens by accident is the failure this guards against.
 */
export const PRIVATE_CONTACT_FIELDS = ['phone', 'email'] as const

/**
 * What the public site may render for a contact. Empty, because the legacy pages rendered no
 * part of a contact at all, and visual parity is the rule (`AGENTS.md` section 1.6).
 */
export const PUBLIC_CONTACT_FIELDS: readonly (keyof ContactFields)[] = []

export type PublicContact = Partial<ContactFields>

function isPrivate(field: keyof ContactFields): boolean {
  return (PRIVATE_CONTACT_FIELDS as readonly string[]).includes(field)
}

/**
 * The part of a contact a server component may hand to the browser.
 *
 * Anything that is not a populated document — a bare relationship id, `null`, a string — projects
 * to `undefined`, because there is nothing to show and an id is not worth leaking either. A
 * projection with no surviving field is `undefined` too, so a template renders nothing rather
 * than an empty card.
 */
export function publicContact(
  value: unknown,
  fields: readonly (keyof ContactFields)[] = PUBLIC_CONTACT_FIELDS,
): PublicContact | undefined {
  if (value === null || typeof value !== 'object') return undefined

  const source = value as Record<string, unknown>
  const projected: PublicContact = {}

  for (const field of fields) {
    if (isPrivate(field)) continue

    const raw = source[field]
    if (typeof raw !== 'string' || raw === '') continue

    projected[field] = raw
  }

  return Object.keys(projected).length === 0 ? undefined : projected
}
