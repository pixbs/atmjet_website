import { describe, expect, it } from 'vitest'

import {
  deliveryStatus,
  isSubmittableEmail,
  isSubmittablePhone,
  LEAD_DELIVERY_CHANNELS,
  LEAD_FORM_TYPES,
  LEAD_NAME_MAX_LENGTH,
  phoneDigitCount,
  undeliveredChannels,
} from '@/lib/leads'

/**
 * The rules a lead is held to (issue #68). The field rules reproduce the legacy zod schemas
 * (`docs/legacy-inventory.md` sections 7.1 and 7.2) so a submission that reached Telegram before
 * still does; the delivery rules are new, because the legacy site recorded nothing.
 */
describe('the vocabulary', () => {
  it('names the forms and the channels', () => {
    expect(LEAD_FORM_TYPES).toEqual([
      'booking-dialog',
      'contact-us-inline',
      'flight-request',
      'aircraft-detail',
      'yacht-detail',
    ])
    expect(LEAD_DELIVERY_CHANNELS).toEqual(['telegram', 'crm'])
    expect(LEAD_NAME_MAX_LENGTH).toBe(32)
  })
})

describe('phoneDigitCount', () => {
  it('counts digits and ignores everything else', () => {
    expect(phoneDigitCount('+971 (50) 458-99-26')).toBe(12)
    expect(phoneDigitCount('')).toBe(0)
    expect(phoneDigitCount(undefined)).toBe(0)
    expect(phoneDigitCount(971_504_589_926)).toBe(0)
  })
})

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

describe('undeliveredChannels', () => {
  it('lists every channel for a lead nothing has reached', () => {
    expect(undeliveredChannels([])).toEqual(['telegram', 'crm'])
    expect(undeliveredChannels(undefined)).toEqual(['telegram', 'crm'])
  })

  it('leaves out the ones that already arrived, so a retry does not resend', () => {
    expect(undeliveredChannels([{ channel: 'telegram', status: 'sent' }])).toEqual(['crm'])
  })

  it('keeps a channel that failed, because failing is not arriving', () => {
    expect(
      undeliveredChannels([
        { channel: 'telegram', status: 'failed' },
        { channel: 'crm', status: 'sent' },
      ]),
    ).toEqual(['telegram'])
  })
})
