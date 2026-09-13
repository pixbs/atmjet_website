import { describe, expect, it } from 'vitest'

import { deliveryStatus, isSubmittableEmail, isSubmittablePhone } from '@/lib/leads'

/**
 * The rules a lead is held to (issue #68). The field rules reproduce the legacy zod schemas
 * (`docs/legacy-inventory.md` sections 7.1 and 7.2) so a submission that reached Telegram before
 * still does; the delivery rules are new, because the legacy site recorded nothing.
 */
describe('isSubmittablePhone', () => {
  it('accepts what the legacy rule accepted, however it is punctuated', () => {
    expect(isSubmittablePhone('+971 (50) 458-99-26')).toBe(true)
    expect(isSubmittablePhone('+7 495 000 00 00')).toBe(true)
    expect(isSubmittablePhone('12345678')).toBe(true)
    expect(isSubmittablePhone('123456789012345')).toBe(true)
  })

  it('refuses what it refused: fewer than eight digits, or more than fifteen', () => {
    expect(isSubmittablePhone('1234567')).toBe(false)
    expect(isSubmittablePhone('1234567890123456')).toBe(false)
    expect(isSubmittablePhone('+')).toBe(false)
    expect(isSubmittablePhone(undefined)).toBe(false)
  })
})

describe('isSubmittableEmail', () => {
  it('accepts an address and refuses what is not one', () => {
    expect(isSubmittableEmail('someone@example.test')).toBe(true)
    expect(isSubmittableEmail('someone@example')).toBe(false)
    expect(isSubmittableEmail('someone at example.test')).toBe(false)
    expect(isSubmittableEmail('')).toBe(false)
    expect(isSubmittableEmail(42)).toBe(false)
  })
})

describe('deliveryStatus', () => {
  it('is pending for a lead nothing has tried to deliver', () => {
    // Which is the state the legacy site left every lead in, permanently.
    expect(deliveryStatus([])).toBe('pending')
    expect(deliveryStatus(undefined)).toBe('pending')
    expect(deliveryStatus(null)).toBe('pending')
    expect(deliveryStatus('not a list' as never)).toBe('pending')
  })

  it('is sent only when every channel has been', () => {
    expect(deliveryStatus([{ channel: 'telegram', status: 'sent' }])).toBe('sent')
    expect(
      deliveryStatus([
        { channel: 'telegram', status: 'sent' },
        { channel: 'crm', status: 'sent' },
      ]),
    ).toBe('sent')
  })

  it('is pending while one channel is still trying', () => {
    expect(
      deliveryStatus([
        { channel: 'telegram', status: 'sent' },
        { channel: 'crm', status: 'pending' },
      ]),
    ).toBe('pending')
  })

  it('is failed as soon as one channel has failed, even next to a success', () => {
    expect(
      deliveryStatus([
        { channel: 'telegram', status: 'sent' },
        { channel: 'crm', status: 'failed' },
      ]),
    ).toBe('failed')
    expect(
      deliveryStatus([
        { channel: 'telegram', status: 'failed' },
        { channel: 'crm', status: 'pending' },
      ]),
    ).toBe('failed')
  })
})
