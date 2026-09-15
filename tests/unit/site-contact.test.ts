import { describe, expect, it, vi } from 'vitest'

import { getSiteContact, getTelegramChannel } from '@/lib/data/site-settings'

/**
 * The contact details the structured data names (issue #173). They are an editor's, and what
 * matters is that a database the site cannot reach leaves the company undescribed rather than
 * described wrongly.
 */
const STORED = {
  phone: '+971 (50) 458-99-26',
  email: 'info@atmjet.com',
  telegram: 'melentev1',
  telegramChannel: 'atmjet1',
  whatsapp: '+971 (50) 458-99-26',
  instagram: 'atmjet',
}

describe('getSiteContact', () => {
  it('reads what an editor saved, so the markup cannot disagree with the chrome', async () => {
    const contact = await getSiteContact(async () => STORED)

    expect(contact).toEqual({
      phone: '+971 (50) 458-99-26',
      email: 'info@atmjet.com',
      telegram: 'melentev1',
      instagram: 'atmjet',
    })
  })

  it('describes no organisation at all when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    try {
      await expect(
        getSiteContact(() => Promise.reject(new Error('no database'))),
      ).resolves.toBeNull()
      expect(warn).toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })
})

/**
 * The channel the empty legs section links to (issue #117). It is a different account from the
 * one the chrome messages, and the legacy site wrote both by hand: `tg:\\nesolve?domain=@atmjet1`
 * was the result (`docs/legacy-inventory.md` section 13, entry 54).
 */
describe('getTelegramChannel', () => {
  it('builds the link from the handle an editor keeps, not from a scheme they typed', async () => {
    await expect(getTelegramChannel(async () => STORED)).resolves.toBe('https://t.me/atmjet1')
  })

  it('has no link to give when the channel has not been named', async () => {
    await expect(getTelegramChannel(async () => ({ telegramChannel: '  ' }))).resolves.toBe('')
  })

  it('leaves the button out rather than the page down when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    try {
      await expect(
        getTelegramChannel(() => Promise.reject(new Error('no database'))),
      ).resolves.toBe('')
      expect(warn).toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })
})
