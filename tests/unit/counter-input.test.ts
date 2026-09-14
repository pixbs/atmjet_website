import { describe, expect, it } from 'vitest'

import { clampCount, countFromInput, COUNT_RANGE } from '@/lib/counter-input'

/**
 * The arithmetic of the passenger stepper (issue #97, `docs/legacy-inventory.md` section 6). The
 * legacy clamped in three places — both buttons and the typed value — and this is the one rule
 * they all go through now.
 */
describe('clampCount', () => {
  it('keeps a count inside the range the legacy allowed', () => {
    expect(COUNT_RANGE).toEqual({ min: 1, max: 25 })
    expect(clampCount(1)).toBe(1)
    expect(clampCount(12)).toBe(12)
    expect(clampCount(25)).toBe(25)
  })

  it('holds at the ends rather than stepping past them', () => {
    expect(clampCount(0)).toBe(1)
    expect(clampCount(-4)).toBe(1)
    expect(clampCount(26)).toBe(25)
  })

  it('counts passengers in whole people', () => {
    expect(clampCount(2.4)).toBe(2)
    expect(clampCount(2.6)).toBe(3)
  })

  it('falls back to the smallest count when handed something that is not a number', () => {
    expect(clampCount(Number.NaN)).toBe(1)
    expect(clampCount(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('takes a range of its own when a caller has one', () => {
    expect(clampCount(9, { min: 2, max: 8 })).toBe(8)
    expect(clampCount(1, { min: 2, max: 8 })).toBe(2)
  })
})

describe('countFromInput', () => {
  it('takes a typed number', () => {
    expect(countFromInput('7', 1)).toBe(7)
  })

  it('clamps a typed number the same way the buttons do', () => {
    expect(countFromInput('99', 1)).toBe(25)
    expect(countFromInput('0', 4)).toBe(1)
  })

  it('keeps what the field had when the entry is not a number yet', () => {
    // Clearing the field to type a new number leaves it empty for a keystroke.
    expect(countFromInput('', 6)).toBe(6)
    expect(countFromInput('two', 6)).toBe(6)
    expect(countFromInput('-', 6)).toBe(6)
    expect(countFromInput('3.5', 6)).toBe(6)
  })
})
