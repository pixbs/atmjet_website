import { describe, expect, it } from 'vitest'

import {
  PRIVATE_CONTACT_FIELDS,
  PUBLIC_CONTACT_FIELDS,
  publicContact,
  type ContactFields,
} from '@/lib/contacts'

/**
 * The public projection of a contact (issue #67). A contact is personal data that no legacy page
 * ever rendered, so the interesting assertions are about what does *not* come out.
 */
const contact: ContactFields & { id: number } = {
  id: 7,
  name: 'Artem Rumyantsev',
  role: 'Captain',
  phone: '+971 50 458 99 26',
  email: 'captain@example.test',
}

describe('the allowlist', () => {
  it('is empty, because no legacy page showed a contact', () => {
    expect(PUBLIC_CONTACT_FIELDS).toEqual([])
  })

  it('never contains a field that holds personal data', () => {
    for (const field of PRIVATE_CONTACT_FIELDS) {
      expect(PUBLIC_CONTACT_FIELDS).not.toContain(field)
    }
  })
})

describe('publicContact', () => {
  it('returns nothing for a full contact, because nothing is public today', () => {
    expect(publicContact(contact)).toBeUndefined()
  })

  it('carries the fields a caller opts into', () => {
    expect(publicContact(contact, ['name', 'role'])).toEqual({
      name: 'Artem Rumyantsev',
      role: 'Captain',
    })
  })

  it('refuses personal data even when a caller asks for it by name', () => {
    // The point of the private list: widening the allowlist by accident cannot leak a phone
    // number or an e-mail address.
    expect(publicContact(contact, ['name', 'phone', 'email'])).toEqual({
      name: 'Artem Rumyantsev',
    })
  })

  it('never carries the id, so a projected contact is not a lookup key', () => {
    expect(publicContact(contact, ['name'])).not.toHaveProperty('id')
  })

  it('drops a field that is missing, blank or not text', () => {
    expect(publicContact({ name: '', role: null }, ['name', 'role'])).toBeUndefined()
    expect(publicContact({ role: 42 }, ['role'])).toBeUndefined()
    expect(publicContact({ name: 'Kept', role: undefined }, ['name', 'role'])).toEqual({
      name: 'Kept',
    })
  })

  it('projects an unpopulated relationship to nothing rather than to its id', () => {
    expect(publicContact(7, ['name'])).toBeUndefined()
    expect(publicContact('7', ['name'])).toBeUndefined()
    expect(publicContact(null, ['name'])).toBeUndefined()
    expect(publicContact(undefined, ['name'])).toBeUndefined()
  })
})
