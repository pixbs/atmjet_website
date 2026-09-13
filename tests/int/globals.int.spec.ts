import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TypedUser } from 'payload'

import { DEFAULT_LOCALES } from '@/i18n/locales'
import { getEnabledLocales } from '@/lib/data/site-settings'
import { createAdmin, createUser } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

// The globals revalidate on write, which needs a Next request scope this suite has not got; the
// binding swallows that, but mocking keeps the output quiet and lets the tags be asserted.
const revalidateTag = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidateTag }))

/**
 * The chrome globals (issue #61): the navigation, the footer and the values every page links to.
 *
 * What matters here is that a global is one document an editor owns rather than a constant in
 * six components (`docs/legacy-inventory.md` section 9.5), that its labels are per locale, and
 * that only the right people can change it.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

beforeEach(() => revalidateTag.mockClear())

/** A page to point a navigation link at. */
async function aPage() {
  return registry.create('pages', {
    title: `Nav target ${uniqueSuffix()}`,
    slug: `nav-target-${uniqueSuffix()}`,
    layout: [],
  })
}

/**
 * Writes the first navigation list of a global, carrying the second one back unchanged: a global
 * is validated as a whole, so a list left out of the write is validated without its labels and
 * rejected. Passing `{}` makes the call anonymous and `{ user }` makes it that person's.
 */
async function writeNav(
  slug: 'header' | 'footer',
  locale: 'en' | 'ru',
  primaryNav: Array<{ id?: string | null; label: string; page: number }>,
  as: { user?: TypedUser } | { overrideAccess: true } = { overrideAccess: true },
) {
  const existing = await registry.payload.findGlobal({ slug, locale, depth: 0 })

  return registry.payload.updateGlobal({
    slug,
    locale,
    // Ids rather than populated pages, so a write reads back the way the components will query.
    depth: 0,
    data: { primaryNav, secondaryNav: existing.secondaryNav ?? [] },
    overrideAccess: false,
    ...as,
  })
}

describe('site settings', () => {
  it('starts with the legacy contact details, so nothing renders empty', async () => {
    const settings = await registry.payload.findGlobal({ slug: 'site-settings' })

    expect(settings.phone).toBe('+971 (50) 458-99-26')
    expect(settings.email).toBe('info@atmjet.com')
    expect(settings.telegram).toBe('melentev1')
    expect(settings.telegramChannel).toBe('atmjet1')
    expect(settings.instagram).toBe('atmjet')
  })

  it('serves English and Russian out of the box and keeps Ukrainian for the admin', async () => {
    const settings = await registry.payload.findGlobal({ slug: 'site-settings' })

    expect(settings.enabledLocales).toEqual(['en', 'ru'])
  })

  it('is what the site reads to decide which locales it serves', async () => {
    await registry.payload.updateGlobal({
      slug: 'site-settings',
      data: { enabledLocales: ['en', 'ru', 'uk'] },
      overrideAccess: true,
    })

    await expect(getEnabledLocales()).resolves.toEqual(['en', 'ru', 'uk'])

    await registry.payload.updateGlobal({
      slug: 'site-settings',
      data: { enabledLocales: [...DEFAULT_LOCALES] },
      overrideAccess: true,
    })

    // Enabling a language in the admin is all it takes: no deploy, no constant to edit.
    await expect(getEnabledLocales()).resolves.toEqual([...DEFAULT_LOCALES])
  })

  it('keeps English enabled even when it is left out of the selection', async () => {
    const saved = await registry.payload.updateGlobal({
      slug: 'site-settings',
      data: { enabledLocales: ['ru'] },
      overrideAccess: true,
    })

    expect(saved.enabledLocales).toEqual(['en', 'ru'])
  })

  it('is readable by a visitor and writable only by an administrator', async () => {
    const editor = await createUser(registry)
    const owner = await createAdmin(registry)

    await expect(
      registry.payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    ).resolves.toBeTruthy()

    await expect(
      registry.payload.updateGlobal({
        slug: 'site-settings',
        data: { phone: '+1 555 0100' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()

    const updated = await registry.payload.updateGlobal({
      slug: 'site-settings',
      data: { phone: '+971 (50) 458-99-26' },
      overrideAccess: false,
      user: owner,
    })
    expect(updated.phone).toBe('+971 (50) 458-99-26')
  })

  it('drops the cached pages that render it', async () => {
    await registry.payload.updateGlobal({
      slug: 'site-settings',
      data: { instagram: 'atmjet' },
      overrideAccess: true,
    })

    expect(revalidateTag).toHaveBeenCalledWith('site-settings', 'max')
  })
})

describe('navigation', () => {
  for (const slug of ['header', 'footer'] as const) {
    it(`labels the ${slug} links per locale while both point at the same page`, async () => {
      const page = await aPage()

      const english = await writeNav(slug, 'en', [{ label: 'Empty legs', page: page.id }])
      const [item] = english.primaryNav!
      await writeNav(slug, 'ru', [{ id: item.id, label: 'Empty Leg', page: page.id }])

      const russian = await registry.payload.findGlobal({ slug, locale: 'ru', depth: 0 })

      expect(english.primaryNav?.[0]).toMatchObject({ label: 'Empty legs', page: page.id })
      // One link and one target page, two labels: the legacy navbar hard-coded a pair per locale.
      expect(russian.primaryNav?.[0]).toMatchObject({ label: 'Empty Leg', page: page.id })
    })

    it(`lets an editor change the ${slug} but nobody anonymous`, async () => {
      const editor = await createUser(registry)
      const page = await aPage()

      await expect(
        writeNav(slug, 'en', [{ label: 'Injected', page: page.id }], {}),
      ).rejects.toThrow()

      const updated = await writeNav(
        slug,
        'en',
        [{ label: 'Written by an editor', page: page.id }],
        {
          user: editor,
        },
      )

      expect(updated.primaryNav?.[0].label).toBe('Written by an editor')
      expect(revalidateTag).toHaveBeenCalledWith(slug, 'max')
    })
  }

  it('loses the link rather than the page when a page is deleted', async () => {
    const page = await aPage()
    await writeNav('header', 'en', [{ label: 'Doomed', page: page.id }])

    await registry.payload.delete({ collection: 'pages', id: page.id, overrideAccess: true })

    const header = await registry.payload.findGlobal({ slug: 'header', depth: 0 })
    // The link stays in the admin with an empty page, which says which menu needs attention;
    // a required relationship would instead make the delete fail on a not-null column.
    expect(header.primaryNav?.[0]).toMatchObject({ label: 'Doomed', page: null })
  })

  it('records which button a booking request came from', async () => {
    const header = await registry.payload.findGlobal({ slug: 'header' })
    const footer = await registry.payload.findGlobal({ slug: 'footer' })

    expect(header.cta?.source).toBe('Header')
    expect(footer.cta?.source).toBe('Footer')
  })

  it('offers the footer the three social accounts, in the legacy order', async () => {
    const footer = await registry.payload.findGlobal({ slug: 'footer' })

    expect(footer.socials).toEqual(['telegram', 'whatsapp', 'instagram'])
  })
})
