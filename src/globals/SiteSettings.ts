import type { GlobalConfig } from 'payload'

import { admin, anyone } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'
import { ALL_LOCALES, DEFAULT_LOCALE, LOCALE_DEFINITIONS, ROUTED_LOCALES } from '@/i18n/locales'
import type { Locale } from '@/i18n/locales'

/**
 * The contact details, social accounts and documents the whole site links to (issue #61).
 *
 * The legacy site repeated each of these values in up to six components
 * (`docs/legacy-inventory.md` section 9.5), so a new phone number meant a deploy and the copies
 * drifted: two different numbers were in play, one dialled and another displayed. Handles are
 * stored bare and the URLs are built in `src/lib/links.ts`.
 */

/** Keeps the default locale in the list, drops anything unknown and pins the canonical order. */
function withDefaultLocale(value: unknown): Locale[] {
  const requested = Array.isArray(value) ? value : []
  const known = ALL_LOCALES.filter(
    (locale) => locale === DEFAULT_LOCALE || requested.includes(locale),
  )

  return [...known]
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: {
    // Every page renders the phone number and the socials, so reads are public; changing how the
    // site is reached is an administrator's job (docs/access-matrix.md).
    read: anyone,
    update: admin,
  },
  hooks: { afterChange: [revalidateGlobal('site-settings').afterChange] },
  fields: [
    {
      type: 'collapsible',
      label: 'Contact',
      fields: [
        {
          name: 'phone',
          type: 'text',
          required: true,
          defaultValue: '+971 (50) 458-99-26',
          admin: {
            description:
              'Written as it should be read. The dialled number is derived from it, so the two can no longer disagree.',
          },
        },
        { name: 'email', type: 'email', required: true, defaultValue: 'info@atmjet.com' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Social accounts',
      fields: [
        {
          name: 'telegram',
          type: 'text',
          required: true,
          defaultValue: 'melentev1',
          admin: { description: 'Account name without the @. The t.me link is built from it.' },
        },
        {
          name: 'telegramChannel',
          type: 'text',
          required: true,
          defaultValue: 'atmjet1',
          admin: { description: 'Channel name without the @, linked from the empty legs section.' },
        },
        {
          name: 'whatsapp',
          type: 'text',
          required: true,
          defaultValue: '+971 (50) 458-99-26',
          admin: { description: 'The number WhatsApp answers on; it may differ from the phone.' },
        },
        {
          name: 'instagram',
          type: 'text',
          required: true,
          defaultValue: 'atmjet',
          admin: { description: 'Account name without the @.' },
        },
      ],
    },
    {
      name: 'documents',
      type: 'array',
      localized: true,
      labels: { singular: 'Document', plural: 'Documents' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'file', type: 'upload', relationTo: 'media', required: true },
      ],
      admin: {
        description:
          'The PDFs offered for download, per locale: the legacy site served a separate English and Russian file for each one.',
        initCollapsed: true,
      },
    },
    {
      name: 'enabledLocales',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: [...ROUTED_LOCALES],
      options: LOCALE_DEFINITIONS.map(({ code, label }) => ({ value: code, label })),
      hooks: { beforeChange: [({ value }) => withDefaultLocale(value)] },
      admin: {
        description:
          'The languages the public site serves. Content can be entered in every language regardless; English is always served.',
      },
    },
  ],
}
