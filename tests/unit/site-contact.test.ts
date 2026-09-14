import { describe, expect, it, vi } from 'vitest'

import { getSiteContact } from '@/lib/data/site-settings'

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
