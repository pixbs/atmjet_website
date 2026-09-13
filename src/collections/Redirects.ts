import type { CollectionConfig, Field } from 'payload'
import { ValidationError } from 'payload'

import { anyone, editorOrAdmin } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'
import { ALL_LOCALES } from '@/i18n/locales'
import { normaliseRedirectPath } from '@/lib/redirects'

/**
 * The overrides `@payloadcms/plugin-redirects` is configured with (issue #69).
 *
 * The plugin gives a `from`, a `to` that is either a document reference or a URL, and a status
 * code. Three things are added on top, all of them because the legacy redirects were written as
 * `/:slug/planes/:id` in `next.config.mjs` (`docs/legacy-inventory.md` section 1.3):
 *
 * - `from` and the custom `to` are stored without the locale prefix, and the resolver puts the
 *   visitor's locale back on a relative target. One row covers every language, which is what the
 *   legacy `:slug` parameter did.
 * - `matchSubPaths` carries whatever follows the matched path over to the target, so
 *   `/planes/:id → /aircraft/:id` is a checkbox rather than a pattern language.
 * - `locale` narrows a rule to one language, for a redirect that only makes sense in one.
 *
 * The plugin also leaves `create`, `update` and `delete` to Payload's defaults; the access
 * enumeration test of issue #70 fails on that, so all four are declared here.
 */
const revalidation = revalidateCollection('redirects')

/** The status codes the collection offers, the legacy 308 first. */
export const REDIRECT_TYPES = ['308', '301', '307', '302', '303'] as const

/**
 * Payload's App Router `redirect()` emits 307 and `permanentRedirect()` emits 308; there is no
 * way to emit 301 or 302 from a server component. A rule stored as 301 is therefore served as
 * 308 and one stored as 302 or 303 as 307. Both pairs mean the same thing to a crawler and
 * preserve the request method, which the older pair did not promise, so nothing is lost.
 */
export function servedStatusFor(status: number): 307 | 308 {
  return status === 301 || status === 308 ? 308 : 307
}

/** The extra fields, appended to whatever the plugin generates. */
const extraFields: Field[] = [
  {
    name: 'matchSubPaths',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description:
        'Also catch everything below this path and carry the rest over to the target, so /planes/g650 lands on /aircraft/g650.',
    },
  },
  {
    name: 'locale',
    type: 'select',
    options: ALL_LOCALES.map((locale) => ({ label: locale, value: locale })),
    admin: {
      position: 'sidebar',
      description: 'Leave empty to apply this redirect in every language, as the legacy ones did.',
    },
  },
  {
    name: 'note',
    type: 'text',
    admin: { description: 'Why this redirect exists, for whoever reviews the list in E11.3.' },
  },
]

/**
 * Relaxes the plugin's two `required` flags and normalises the paths.
 *
 * The plugin marks both `to.reference` and `to.url` required, with an admin condition choosing
 * between them; the condition is admin-only, so through the Local API — which is how the seed
 * writes — a custom URL redirect cannot be created at all. The requirement is moved to a
 * collection hook that asks for exactly one of them.
 */
export function redirectFields({ defaultFields }: { defaultFields: Field[] }): Field[] {
  const relaxed: Field[] = defaultFields.map((field): Field => {
    if (field.type === 'text' && field.name === 'from') {
      return {
        ...field,
        admin: {
          ...field.admin,
          description:
            'The path to catch, without the locale: /planes, not /en/planes. One row then covers every language.',
        },
      }
    }

    if (field.type === 'group' && 'name' in field && field.name === 'to') {
      return {
        ...field,
        fields: field.fields.map((child): Field =>
          (child.type === 'relationship' && child.name === 'reference') ||
          (child.type === 'text' && child.name === 'url')
            ? { ...child, required: false }
            : child,
        ),
      }
    }

    return field
  })

  return [...relaxed, ...extraFields]
}

export const redirectsOverrides: Partial<Omit<CollectionConfig, 'fields'>> & {
  fields: typeof redirectFields
} = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to.type', 'type', 'matchSubPaths', 'locale'],
    group: 'Site',
    description:
      'Old URLs that must keep resolving. The final list is decided in E11.3; what is seeded is the legacy next.config.mjs map.',
  },
  access: {
    // Public: a visitor following an old link is not signed in.
    read: anyone,
    create: editorOrAdmin,
    update: editorOrAdmin,
    delete: editorOrAdmin,
  },
  hooks: {
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data

        if ('from' in data) data.from = normaliseRedirectPath(data.from)

        const to = data.to as { type?: string; reference?: unknown; url?: unknown } | undefined
        if (to?.type === 'custom') {
          // A blank URL is nothing, but `/` is the locale root and a perfectly good target -
          // the legacy `/:locale/jets → /` rule is exactly that - so the two are told apart
          // before normalisation turns the first into the second.
          const raw = typeof to.url === 'string' ? to.url.trim() : ''
          to.url = raw === '' ? undefined : normaliseRedirectPath(raw)
        }

        const hasReference = to?.type === 'reference' && Boolean(to.reference)
        const hasUrl = to?.type === 'custom' && typeof to.url === 'string'

        if (!hasReference && !hasUrl) {
          throw new ValidationError({
            collection: 'redirects',
            req,
            errors: [
              {
                path: 'to',
                message:
                  'A redirect needs somewhere to send the visitor: either a page or a path such as /aircraft.',
              },
            ],
          })
        }

        return data
      },
    ],
  },
  fields: redirectFields,
}

/** The status a rule falls back to, re-exported so the seed and the admin agree. */
