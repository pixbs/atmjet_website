import { describe, expect, it } from 'vitest'

import { slugify } from '@/lib/slug'

/**
 * The slug rule (issue #65). The legacy admin's version dropped every non-ASCII character before
 * building the slug, so a Cyrillic yacht name produced an empty one
 * (`docs/legacy-inventory.md` section 14 item 4). That is the bug these tests pin shut.
 */

describe('slugify', () => {
  it('gives a Cyrillic name a stable ASCII slug instead of an empty one', () => {
    // The legacy rule returned '' here, which is the whole reason this exists.
    expect(slugify('Жемчужина')).toBe('zhemchuzhina')
    expect(slugify('Морская Звезда')).toBe('morskaya_zvezda')
  })

  it('is stable: the same name always gives the same slug', () => {
    expect(slugify('Морская Звезда')).toBe(slugify('Морская Звезда'))
  })

  it('keeps the legacy shape for an ASCII name, so an imported row lands where it did', () => {
    // name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_')
    expect(slugify('Lady M.')).toBe('lady_m')
    expect(slugify('Sunseeker 76')).toBe('sunseeker_76')
    expect(slugify('M/Y Blue Ice')).toBe('my_blue_ice')
  })

  it('collapses runs of spaces and trims, unlike the legacy rule', () => {
    expect(slugify('  Blue   Ice  ')).toBe('blue_ice')
  })

  it('returns nothing when nothing survives, rather than a slug of punctuation', () => {
    expect(slugify('!!!')).toBe('')
    expect(slugify('海')).toBe('')
    expect(slugify('')).toBe('')
  })

  it('returns nothing for a value that is not text', () => {
    expect(slugify(undefined)).toBe('')
    expect(slugify(null)).toBe('')
    expect(slugify(42)).toBe('')
  })
})
