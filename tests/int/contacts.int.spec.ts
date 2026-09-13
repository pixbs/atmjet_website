import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Field, SanitizedConfig } from 'payload'

import { CONTACT_ORIGINS, contactRelationship } from '@/collections/Contacts'
import { createAdmin, createContact, createUser, contactData } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * Contacts (issue #67). The legacy `contact` table is personal data that the site never read and
 * the legacy admin never showed (`docs/legacy-inventory.md` section 8), so what is pinned here is
 * that it stays that way: administrators only, and nothing about a contact — not even the fact
 * that a document points at one — reaches an anonymous response.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

/** Every relationship in the config that points at a contact, however deeply it is nested. */
function contactRelationshipFields(config: SanitizedConfig): Field[] {
  const found: Field[] = []

  const walk = (fields: Field[]) => {
    for (const field of fields) {
      if ('relationTo' in field) {
        const targets = Array.isArray(field.relationTo) ? field.relationTo : [field.relationTo]
        if (targets.includes('contacts')) found.push(field)
      }

      if ('fields' in field && Array.isArray(field.fields)) walk(field.fields)
      if ('tabs' in field) for (const tab of field.tabs) walk(tab.fields)
      if ('blocks' in field) for (const block of field.blocks) walk(block.fields)
    }
  }

  // Payload's own bookkeeping collections carry a polymorphic relationship to every slug in
  // the config (`payload-locked-documents.document`, for one). They are internal, never public,
  // and not something this project declares field access on.
  for (const collection of config.collections) {
    if (collection.slug.startsWith('payload-')) continue
    walk(collection.fields)
  }
  for (const global of config.globals) walk(global.fields)

  return found
}

describe('access', () => {
  it('is not readable anonymously, however the caller asks', async () => {
    const contact = await createContact(registry)

    await expect(
      registry.payload.find({ collection: 'contacts', overrideAccess: false }),
    ).rejects.toThrow()

    await expect(
      registry.payload.findByID({ collection: 'contacts', id: contact.id, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('is not readable by an editor either: running the content needs no phone numbers', async () => {
    const editor = await createUser(registry)
    await createContact(registry)

    await expect(
      registry.payload.find({ collection: 'contacts', overrideAccess: false, user: editor }),
    ).rejects.toThrow()
  })

  it('is readable by an admin', async () => {
    const owner = await createAdmin(registry)
    const contact = await createContact(registry)

    const found = await registry.payload.findByID({
      collection: 'contacts',
      id: contact.id,
      overrideAccess: false,
      user: owner,
    })

    expect(found.id).toBe(contact.id)
    expect(found.email).toBe(contact.email)
  })

  it('cannot be written anonymously or by an editor', async () => {
    const editor = await createUser(registry)
    const existing = await createContact(registry)

    await expect(
      registry.payload.create({
        collection: 'contacts',
        data: contactData(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      registry.payload.create({
        collection: 'contacts',
        data: contactData(),
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()

    await expect(
      registry.payload.update({
        collection: 'contacts',
        id: existing.id,
        data: { phone: '+000' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()

    await expect(
      registry.payload.delete({
        collection: 'contacts',
        id: existing.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('can be written and removed by an admin', async () => {
    const owner = await createAdmin(registry)

    const created = await registry.payload.create({
      collection: 'contacts',
      data: contactData(),
      overrideAccess: false,
      user: owner,
    })
    registry.track('contacts', created.id)

    const updated = await registry.payload.update({
      collection: 'contacts',
      id: created.id,
      data: { role: 'Broker' },
      overrideAccess: false,
      user: owner,
    })
    expect(updated.role).toBe('Broker')

    await expect(
      registry.payload.delete({
        collection: 'contacts',
        id: created.id,
        overrideAccess: false,
        user: owner,
      }),
    ).resolves.toBeTruthy()
  })
})

describe('relationships that point at a contact', () => {
  it('hide the field from everyone but an admin, so not even the id leaks', async () => {
    const config = await registry.payload.config

    // The factory is included so this asserts something today: Yachts (E4.6, issue #65) is the
    // first collection to carry one, and when it does, its two fields are checked here too.
    const fields = [
      ...contactRelationshipFields(config),
      contactRelationship({ name: 'contact' }),
      contactRelationship({ name: 'captain', label: 'Captain', description: 'The captain.' }),
    ]

    for (const field of fields) {
      const read = 'access' in field ? field.access?.read : undefined
      expect(typeof read).toBe('function')

      expect(await read!({ req: { user: null } } as never)).toBe(false)
      expect(await read!({ req: { user: { id: 1, roles: ['editor'] } } } as never)).toBe(false)
      expect(await read!({ req: { user: { id: 1, roles: ['admin'] } } } as never)).toBe(true)
    }
  })

  it('are indexed and carry an explanation an editor can read', () => {
    const field = contactRelationship({ name: 'contact' })

    expect(field).toMatchObject({ type: 'relationship', relationTo: 'contacts', index: true })
    expect(field.admin?.description).toMatch(/administrators only/i)
    expect(
      contactRelationship({ name: 'captain', description: 'Who sails it.' }).admin?.description,
    ).toBe('Who sails it.')
  })
})

describe('the document', () => {
  it('keeps the four legacy columns and records where it came from', async () => {
    const owner = await createAdmin(registry)
    const created = await registry.payload.create({
      collection: 'contacts',
      data: contactData({
        name: 'Legacy Person',
        phone: '+7 495 000 00 00',
        email: 'legacy@example.test',
        provenance: { origin: 'contact-legacy', legacyContactId: 42, importRunId: 'run-1' },
      }),
      overrideAccess: false,
      user: owner,
    })
    registry.track('contacts', created.id)

    expect(created.name).toBe('Legacy Person')
    expect(created.phone).toBe('+7 495 000 00 00')
    expect(created.email).toBe('legacy@example.test')
    expect(created.provenance?.origin).toBe('contact-legacy')
    expect(created.provenance?.legacyContactId).toBe(42)
    expect(CONTACT_ORIGINS).toEqual(['contact-legacy', 'manual'])
  })

  it('requires a name, because a contact with none is not a contact', async () => {
    await expect(registry.create('contacts', contactData({ name: undefined }))).rejects.toThrow()
  })

  it("stays out of an editor's sidebar, because they cannot open it", async () => {
    const config = await registry.payload.config
    const contacts = config.collections.find((collection) => collection.slug === 'contacts')
    const hidden = contacts?.admin.hidden

    expect(typeof hidden).toBe('function')
    const isHidden = hidden as (args: unknown) => boolean
    expect(isHidden({ user: { id: 1, roles: ['editor'] } })).toBe(true)
    expect(isHidden({ user: { id: 1, roles: ['admin'] } })).toBe(false)
  })

  it('has no publication state to confuse a reader with', async () => {
    const created = await createContact(registry)

    expect(created).not.toHaveProperty('_status')
  })
})
