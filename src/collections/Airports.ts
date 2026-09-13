import type { CollectionConfig } from 'payload'

import { anyone, editorOrAdmin } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'
import { normaliseCode, normaliseText } from '@/lib/airports'

/**
 * Airports (issue #64). The legacy site held the same facts in two tables: `airports`, with
 * everything typed `varchar(255)`, and `new_airports`, everything `text`
 * (`docs/legacy-inventory.md` section 8). E5.5 merges both into this one.
 *
 * Two legacy behaviours are corrected rather than reproduced, because neither is visible as
 * layout: `passengersPerYear` is a number, so the autocomplete can rank by traffic instead of
 * sorting "9" above "1000000" lexicographically (section 8.5), and the codes are canonical, so
 * a lookup does not need a wildcard `ILIKE` to find an exact match.
 */
const revalidation = revalidateCollection('airports')

export const Airports: CollectionConfig = {
  slug: 'airports',
  admin: {
    useAsTitle: 'icao',
    defaultColumns: ['icao', 'iata', 'name', 'city', 'country'],
    group: 'Reference data',
  },
  access: {
    // Public: the airport search endpoint (E9.9) and the empty legs block read this without a
    // session (docs/access-matrix.md).
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

        // One spelling per code whichever table the row came from, so an exact lookup works.
        if ('icao' in data) data.icao = normaliseCode(data.icao)
        if ('iata' in data) data.iata = normaliseCode(data.iata)
        if ('isoCode' in data) data.isoCode = normaliseCode(data.isoCode)
        if ('name' in data) data.name = normaliseText(data.name)
        if ('city' in data) data.city = normaliseText(data.city)
        if ('country' in data) data.country = normaliseText(data.country)

        // `passengersPerYear` is deliberately not normalised here. Payload coerces a number
        // field before this hook runs, so "49 837 000" would already have become 49 and the
        // truncation would be invisible. The importer of E5.5 parses the legacy text
        // itself before writing.

        return data
      },
    ],
  },
  fields: [
    {
      name: 'icao',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Four-letter ICAO code, upper-cased. The empty legs block looks airports up by it.',
      },
    },
    {
      name: 'iata',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', description: 'Three-letter IATA code, upper-cased.' },
    },
    {
      name: 'name',
      type: 'text',
      localized: true,
      index: true,
      admin: { description: 'The airport name as a traveller would read it in this language.' },
    },
    {
      name: 'city',
      type: 'text',
      localized: true,
      index: true,
    },
    {
      name: 'country',
      type: 'text',
      localized: true,
      index: true,
    },
    {
      name: 'aliases',
      type: 'text',
      localized: true,
      index: true,
      admin: {
        description:
          'Other names the search should match, comma separated. The legacy column is the misspelled `alies_en` / `alies_ru`.',
      },
    },
    {
      name: 'type',
      type: 'text',
      localized: true,
      admin: { description: 'Airport type as the source data describes it. Never rendered today.' },
    },
    {
      name: 'passengersPerYear',
      type: 'number',
      index: true,
      min: 0,
      admin: {
        position: 'sidebar',
        description:
          'Annual passengers, used to rank search results. A number here, unlike the legacy text column; the import parses that text before writing.',
      },
    },
    {
      name: 'isoCode',
      type: 'text',
      admin: { position: 'sidebar', description: 'ISO country code, upper-cased.' },
    },
    {
      name: 'gmtOffset',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Offset as the legacy data records it, kept verbatim rather than parsed.',
      },
    },
    {
      name: 'latitude',
      type: 'number',
      min: -90,
      max: 90,
    },
    {
      name: 'longitude',
      type: 'number',
      min: -180,
      max: 180,
    },
    {
      name: 'wikidata',
      type: 'text',
      admin: { description: 'Wikidata identifier from the legacy `new_airports` table.' },
    },
  ],
}
