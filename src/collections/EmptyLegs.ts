import type { CollectionConfig } from 'payload'

import { anyone, editorOrAdmin } from '@/access'
import { provenanceGroup } from '@/fields/provenance'
import { revalidateCollection } from '@/hooks/revalidate'
import { normaliseCode } from '@/lib/airports'

/**
 * Empty legs (issue #66). The legacy table is `atmjet_admin__empty_legs`: `start`, `end`, `from`
 * and `to` as four-character ICAO codes, `type`, `category`, `company`, `safety`, `price` and
 * `order` (`docs/legacy-inventory.md` section 8). The site read four of those — `start`, `price`,
 * `from`, `to` — and looked each code up in `airports` with `ILIKE '%code%' LIMIT 1`, dropping any
 * row whose lookup missed (section 6, EmptyLegSection).
 *
 * Three of those behaviours are corrected, none of them visible as layout:
 *
 * - the route ends are relationships to Airports, resolved once when the leg is saved rather than
 *   with two wildcard queries per row on every render, and a code that has no airport is kept as
 *   text so the row survives instead of disappearing;
 * - the `order` column the legacy admin wrote and the site ignored is what the listing sorts by;
 * - a leg is published or not, rather than every row in the table being live.
 *
 * Whether a past leg disappears on its own is E7.7's decision, so nothing here filters by date.
 */
const revalidation = revalidateCollection('empty-legs')

/** The currencies a leg may be priced in. The legacy card hard-coded a dollar sign. */
const EMPTY_LEG_CURRENCIES = ['USD', 'EUR', 'AED'] as const

/** Where a document came from, per ADR-0002 section 8. */
const EMPTY_LEG_ORIGINS = ['empty-legs-legacy', 'manual'] as const

export const EmptyLegs: CollectionConfig = {
  slug: 'empty-legs',
  labels: { singular: 'Empty leg', plural: 'Empty legs' },
  admin: {
    useAsTitle: 'route',
    defaultColumns: ['route', 'departureAt', 'price', 'order'],
    group: 'Catalogue',
  },
  // The list view opens on the order the listing renders in, so what an editor drags into place
  // is what a visitor sees. The legacy admin wrote this column and the site ignored it.
  defaultSort: ['order', 'departureAt'],
  access: {
    read: anyone,
    create: editorOrAdmin,
    update: editorOrAdmin,
    delete: editorOrAdmin,
  },
  hooks: {
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        // One spelling per code, so a leg whose airport is not in the database still matches the
        // one that is added later.
        if ('departureIcao' in data) data.departureIcao = normaliseCode(data.departureIcao)
        if ('arrivalIcao' in data) data.arrivalIcao = normaliseCode(data.arrivalIcao)

        return data
      },
    ],
  },
  fields: [
    {
      name: 'route',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Filled in by the admin list from the two codes below; it is what the row is called in a list of rows.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            const from = normaliseCode(siblingData?.departureIcao) ?? '????'
            const to = normaliseCode(siblingData?.arrivalIcao) ?? '????'

            return `${from} → ${to}`
          },
        ],
      },
    },
    {
      name: 'departureAirport',
      type: 'relationship',
      relationTo: 'airports',
      index: true,
      admin: { description: 'Resolved from the legacy `from` code during the import of E5.11.' },
    },
    {
      name: 'departureIcao',
      type: 'text',
      index: true,
      admin: {
        description:
          'The four-letter code as the leg was entered. Kept even when the airport above is set, and the only record of the route when no airport matches: the legacy section dropped such a row from the page entirely.',
      },
    },
    {
      name: 'arrivalAirport',
      type: 'relationship',
      relationTo: 'airports',
      index: true,
      admin: { description: 'Resolved from the legacy `to` code during the import of E5.11.' },
    },
    {
      name: 'arrivalIcao',
      type: 'text',
      index: true,
      admin: { description: 'The four-letter code as the leg was entered.' },
    },
    {
      name: 'departureAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'Stored in UTC, as the legacy timestamptz was. The card prints the UTC day in en-US, whatever the page language, which is what the legacy card did.',
      },
    },
    {
      name: 'arrivalAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'The legacy `end` column. Written by the legacy admin and never rendered.',
      },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      index: true,
      admin: { description: 'The legacy price column, an integer that defaulted to 0.' },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'USD',
      options: EMPTY_LEG_CURRENCIES.map((currency) => ({ label: currency, value: currency })),
      admin: {
        position: 'sidebar',
        description: 'No legacy column: the card hard-coded a dollar sign. USD reproduces it.',
      },
    },
    {
      name: 'seats',
      type: 'number',
      min: 0,
      admin: {
        description:
          'No legacy column, and the legacy card showed no seat count. Left empty by the import.',
      },
    },
    {
      name: 'order',
      type: 'number',
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Lowest first. The legacy admin wrote this column and the site ignored it, so rows came back in whatever order the database felt like. A leg with no number sorts last.',
      },
    },
    {
      type: 'group',
      name: 'aircraft',
      label: 'Aircraft',
      admin: {
        description:
          'The legacy columns were free text the admin typed. The relationship is preferred; the text survives for a leg whose aircraft is not in the catalogue.',
      },
      fields: [
        {
          name: 'document',
          type: 'relationship',
          relationTo: 'aircraft',
          index: true,
          admin: { description: 'Resolved from the legacy type and company during E5.11.' },
        },
        { name: 'type', type: 'text', admin: { description: 'The legacy type column.' } },
        { name: 'category', type: 'text', admin: { description: 'The legacy category column.' } },
        { name: 'company', type: 'text', admin: { description: 'The legacy company column.' } },
        { name: 'safety', type: 'text', admin: { description: 'The legacy safety column.' } },
      ],
    },
    {
      name: 'legacyAttributes',
      type: 'json',
      admin: {
        description:
          'Every legacy column with no field of its own, kept verbatim so nothing is lost before E5.13 reconciles.',
      },
    },
    provenanceGroup({
      origins: EMPTY_LEG_ORIGINS,
      legacyFields: [{ name: 'legacyId', type: 'number', index: true }],
    }),
  ],
}
