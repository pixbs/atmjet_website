import { describe, expect, it } from 'vitest'

import { normaliseCode, normaliseText } from '@/lib/airports'

/**
 * Airport normalisation (issue #64). The legacy data arrives from two tables with different
 * column types and no cleaning, so these are the rules that make one row out of either.
 */
describe('normaliseCode', () => {
  it('upper-cases and strips whitespace', () => {
    expect(normaliseCode(' uudd ')).toBe('UUDD')
    expect(normaliseCode('u u d d')).toBe('UUDD')
    expect(normaliseCode('Svo')).toBe('SVO')
  })

  it('treats an empty or absent code as missing, not as an empty string', () => {
    expect(normaliseCode('')).toBeUndefined()
    expect(normaliseCode('   ')).toBeUndefined()
    expect(normaliseCode(null)).toBeUndefined()
    expect(normaliseCode(undefined)).toBeUndefined()
    expect(normaliseCode(42)).toBeUndefined()
  })
})

describe('normaliseText', () => {
  it('collapses whitespace without touching the words', () => {
    expect(normaliseText('  Sheremetyevo   International  ')).toBe('Sheremetyevo International')
    expect(normaliseText('Москва\tВнуково')).toBe('Москва Внуково')
  })

  it('keeps case, because a name is not a code', () => {
    expect(normaliseText('John F. Kennedy')).toBe('John F. Kennedy')
  })

  it('treats blank as missing', () => {
    expect(normaliseText('   ')).toBeUndefined()
    expect(normaliseText(null)).toBeUndefined()
  })
})
