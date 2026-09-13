import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { ALL_LOCALES, DEFAULT_LOCALE } from '@/i18n/locales'
import { createMedia, pngFile } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

/**
 * Payload localisation aligned with the routing (issue #54, ADR-0003). `Media.alt` is the one
 * localised field in the config today, so it stands in for every localised field: what it does
 * here is what a Pages or Aircraft field will do in E4.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('localisation config', () => {
  it('offers exactly the shared locale list to editors', async () => {
    const config = await registry.payload.config

    expect(config.localization).toBeTruthy()
    const codes = (config.localization as { locales: Array<{ code: string }> }).locales.map(
      ({ code }) => code,
    )

    expect(codes).toEqual([...ALL_LOCALES])
  })

  it('falls back to the default locale', async () => {
    const config = await registry.payload.config
    const localization = config.localization as { defaultLocale: string; fallback: boolean }

    expect(localization.defaultLocale).toBe(DEFAULT_LOCALE)
    expect(localization.fallback).toBe(true)
  })

  it('speaks every content locale in the admin interface', async () => {
    const config = await registry.payload.config

    expect(Object.keys(config.i18n.supportedLanguages ?? {}).sort()).toEqual(
      [...ALL_LOCALES].sort(),
    )
  })
})

describe('localised fields', () => {
  it('keeps a separate value per locale', async () => {
    const suffix = uniqueSuffix()
    const media = await createMedia(registry, { alt: `Hangar ${suffix}` })

    await registry.payload.update({
      collection: 'media',
      id: media.id,
      data: { alt: `Ангар ${suffix}` },
      locale: 'ru',
      overrideAccess: true,
    })

    const english = await registry.payload.findByID({ collection: 'media', id: media.id })
    const russian = await registry.payload.findByID({
      collection: 'media',
      id: media.id,
      locale: 'ru',
    })

    expect(english.alt).toBe(`Hangar ${suffix}`)
    expect(russian.alt).toBe(`Ангар ${suffix}`)
  })

  it('returns the default locale value when a translation is missing', async () => {
    const suffix = uniqueSuffix()
    const media = await createMedia(registry, { alt: `Untranslated ${suffix}` })

    // Nothing was ever written in ru or uk, so both read through to English.
    for (const locale of ['ru', 'uk'] as const) {
      const doc = await registry.payload.findByID({ collection: 'media', id: media.id, locale })
      expect(doc.alt, `${locale} should fall back`).toBe(`Untranslated ${suffix}`)
    }
  })

  it('does not copy the fallback into the document', async () => {
    const suffix = uniqueSuffix()
    const media = await registry.create(
      'media',
      { alt: `Original ${suffix}` },
      { file: pngFile(), locale: 'en' },
    )

    // Read through the fallback first; that read must not persist anything.
    await registry.payload.findByID({ collection: 'media', id: media.id, locale: 'ru' })

    await registry.payload.update({
      collection: 'media',
      id: media.id,
      data: { alt: `Перевод ${suffix}` },
      locale: 'ru',
      overrideAccess: true,
    })

    const english = await registry.payload.findByID({ collection: 'media', id: media.id })

    expect(english.alt).toBe(`Original ${suffix}`)
  })

  it('exposes every translation at once with locale: all', async () => {
    const suffix = uniqueSuffix()
    const media = await createMedia(registry, { alt: `All ${suffix}` })

    await registry.payload.update({
      collection: 'media',
      id: media.id,
      data: { alt: `Все ${suffix}` },
      locale: 'ru',
      overrideAccess: true,
    })

    const doc = await registry.payload.findByID({
      collection: 'media',
      id: media.id,
      locale: 'all',
    })

    // The generated type says `string`; `locale: 'all'` widens it at runtime only, which is why
    // the migration scripts narrow it themselves (docs/conventions/localization.md).
    const alt = doc.alt as unknown as Record<string, string>

    expect(alt.en).toBe(`All ${suffix}`)
    expect(alt.ru).toBe(`Все ${suffix}`)
    expect(alt.uk).toBeFalsy()
  })
})
