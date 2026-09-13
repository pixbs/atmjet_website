import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_LOCALES } from '@/i18n/locales'
import { getEnabledLocales } from '@/lib/data/site-settings'

/**
 * Which languages the public site serves (issue #53). The value is an editor's, so what matters
 * is that the site stays reachable whatever they save and whatever the database does.
 */
describe('getEnabledLocales', () => {
  it('serves what the settings enable', async () => {
    const locales = await getEnabledLocales(async () => ({ enabledLocales: ['en', 'ru', 'uk'] }))

    expect(locales).toEqual(['en', 'ru', 'uk'])
  })

  it('keeps the default locale even when the settings leave it out', async () => {
    // Without it the site would have no home page to redirect an unprefixed request to.
    const locales = await getEnabledLocales(async () => ({ enabledLocales: ['uk'] }))

    expect(locales).toEqual(['en', 'uk'])
  })

  it('ignores a language the content model does not know', async () => {
    const locales = await getEnabledLocales(async () => ({
      enabledLocales: ['ru', 'de'] as never,
    }))

    expect(locales).toEqual(['en', 'ru'])
  })

  it('serves the default locales when the database cannot be reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const locales = await getEnabledLocales(() => Promise.reject(new Error('no database')))

    expect(locales).toEqual([...DEFAULT_LOCALES])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
