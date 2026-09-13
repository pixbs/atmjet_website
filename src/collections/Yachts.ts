import { ValidationError, type CollectionConfig } from 'payload'

import { editorOrAdmin, publishedOnly } from '@/access'
import { nextRevalidationHooks } from '@/lib/data/revalidate-next'
import { slugify } from '@/lib/slug'
import { listingProblems, YACHT_CURRENCIES, YACHT_LISTING_TYPES } from '@/lib/yachts'
import { contactRelationship } from './Contacts'

/**
 * Yachts (issue #65). Two legacy tables feed it: `new_yachts`, the charter catalogue the legacy
 * admin managed, and `yachts`, the sale catalogue (`docs/legacy-inventory.md` section 8). They
 * agree on a name, a location, a length and a list of photos and on nothing else, so the shape
 * here is one collection with a `listingType` and a group per type, each group holding the
 * columns of its own table under the names the new site uses.
 *
 * `cabins` and `bathrooms` stay text on the charter side because the legacy column is text and
 * the card prints it verbatim ("3+1", "2 / 2"); the sale side keeps the integers its own table
 * has. Prices are numbers with a currency rather than the legacy `numeric`-as-string.
 *
 * Slugs are the legacy shape with the transliteration the legacy admin was missing, so a Cyrillic
 * name stops producing an empty slug (section 14 item 4), and they are generated once on create
 * rather than recomputed on every edit, so a rename no longer moves the URL. An imported row
 * keeps the slug it arrived with.
 */
const revalidation = nextRevalidationHooks('yachts')

/** Where a document came from, per ADR-0002 section 8. */
const YACHT_ORIGINS = ['new-yachts-charter', 'yachts-sale', 'manual'] as const

export const Yachts: CollectionConfig = {
  slug: 'yachts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'listingType', 'location', '_status'],
    group: 'Catalogue',
  },
  access: {
    read: publishedOnly,
    create: editorOrAdmin,
    update: editorOrAdmin,
    delete: editorOrAdmin,
  },
  hooks: {
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data

        // Generated once, from the name, and only when nothing supplied one: an imported row
        // keeps its legacy slug and a rename never moves a URL that is already published.
        if (operation === 'create' && !data.slug) {
          const generated = slugify(data.name)
          if (generated !== '') data.slug = generated
        }

        const problems = listingProblems(data)

        // The slug is checked here rather than with `required`, because the hook above usually
        // supplies it: marking the field required would make every Local API caller, the seed
        // and the import of E5.10 included, pass a value the collection is about to compute.
        const slugMissing = operation === 'create' ? !data.slug : 'slug' in data && !data.slug
        if (slugMissing) {
          problems.push({
            path: 'slug',
            message:
              'A yacht needs a slug: it is the URL of its detail page. The name did not transliterate into one, so type it here.',
          })
        }

        if (problems.length > 0) {
          throw new ValidationError({ collection: 'yachts', errors: problems, req })
        }

        return data
      },
    ],
  },
  versions: { drafts: true, maxPerDoc: 25 },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'The name both legacy cards render, without the manufacturer.' },
    },
    {
      name: 'listingType',
      type: 'select',
      required: true,
      defaultValue: 'charter',
      index: true,
      options: YACHT_LISTING_TYPES.map((type) => ({ label: type, value: type })),
      admin: {
        position: 'sidebar',
        description:
          'Which legacy catalogue this listing belongs to: charter (new_yachts) or sale (yachts).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'The URL of the detail page. Generated from the name when a listing is created, then left alone: changing it moves a published URL. A name in a script this cannot transliterate leaves it empty, and you are asked for one.',
      },
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
      index: true,
      admin: { description: 'Where the yacht is, as both legacy tables record it.' },
    },
    {
      name: 'length',
      type: 'number',
      index: true,
      admin: {
        description:
          'Length in feet, as the legacy numeric column holds it. The card renders the metres itself.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'From the legacy description and description_ru, which were two columns rather than a locale.',
      },
    },
    {
      name: 'photos',
      type: 'array',
      admin: {
        description:
          'In the order they are shown; the first is the card cover. From the legacy photos and pictures arrays, whose order was the order of the array.',
      },
      fields: [
        { name: 'media', type: 'upload', relationTo: 'media' },
        {
          name: 'externalUrl',
          type: 'text',
          admin: {
            description: 'Set while the file still lives on the legacy bucket, as on Media.',
          },
        },
        { name: 'alt', type: 'text', localized: true },
      ],
    },
    {
      type: 'group',
      name: 'charter',
      label: 'Charter',
      admin: {
        condition: (data) => data?.listingType !== 'sale',
        description: 'The columns of the legacy new_yachts table.',
      },
      fields: [
        { name: 'manufacturer', type: 'text', index: true },
        { name: 'owner', type: 'text' },
        {
          name: 'customerPrice',
          type: 'number',
          index: true,
          admin: { description: 'Per hour, as the legacy card renders it.' },
        },
        {
          name: 'businessPrice',
          type: 'number',
          admin: {
            description:
              'The legacy bussines_price, misspelled in the source and never rendered. Kept so nothing is lost.',
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: YACHT_CURRENCIES.map((currency) => ({ label: currency, value: currency })),
          admin: {
            description: 'The legacy column is free text; the import maps it to one of these.',
          },
        },
        { name: 'minHours', type: 'number' },
        { name: 'guestsDay', type: 'number', index: true },
        { name: 'guestsNight', type: 'number' },
        {
          name: 'cabins',
          type: 'text',
          admin: {
            description:
              'Text, not a number: the legacy column is text and the card prints it verbatim.',
          },
        },
        { name: 'bathrooms', type: 'text' },
        { name: 'refit', type: 'number' },
        {
          name: 'included',
          type: 'textarea',
          localized: true,
          admin: { description: 'From the legacy included and included_en.' },
        },
      ],
    },
    {
      type: 'group',
      name: 'sale',
      label: 'Sale',
      admin: {
        condition: (data) => data?.listingType === 'sale',
        description: 'The columns of the legacy yachts table.',
      },
      fields: [
        { name: 'shipyard', type: 'text', index: true, admin: { description: 'The builder.' } },
        { name: 'year', type: 'number', index: true },
        {
          name: 'price',
          type: 'number',
          index: true,
          admin: {
            description:
              'No legacy column: the sale table held no price and the card showed none. Left empty by the import.',
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: YACHT_CURRENCIES.map((currency) => ({ label: currency, value: currency })),
        },
        { name: 'beam', type: 'number' },
        { name: 'draft', type: 'number' },
        {
          name: 'cabins',
          type: 'number',
          admin: { description: 'An integer here, unlike the charter side.' },
        },
        { name: 'guests', type: 'number', index: true },
        { name: 'crew', type: 'number' },
        { name: 'cruisingSpeed', type: 'number' },
        { name: 'maxSpeed', type: 'number' },
      ],
    },
    contactRelationship({
      name: 'contact',
      label: 'Contact',
      description:
        'From the legacy new_yachts.contact_id. Personal data: administrators only, and never part of a public response.',
    }),
    contactRelationship({
      name: 'captain',
      label: 'Captain',
      description:
        'From the legacy new_yachts.captain_id. Personal data: administrators only, and never part of a public response.',
    }),
    {
      name: 'legacyAttributes',
      type: 'json',
      admin: {
        description:
          'Every legacy column with no field of its own, kept verbatim so nothing is lost before E5.13 reconciles.',
      },
    },
    {
      type: 'group',
      name: 'provenance',
      label: 'Provenance',
      admin: { description: 'Where this document came from (ADR-0002 section 8).' },
      fields: [
        {
          name: 'origin',
          type: 'select',
          required: true,
          defaultValue: 'manual',
          options: YACHT_ORIGINS.map((origin) => ({ label: origin, value: origin })),
          index: true,
        },
        { name: 'legacyId', type: 'number', index: true },
        { name: 'legacySlug', type: 'text', index: true },
        { name: 'importRunId', type: 'text', index: true },
        { name: 'importedAt', type: 'date' },
      ],
    },
  ],
}
