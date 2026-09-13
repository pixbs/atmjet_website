import type { CollectionConfig } from 'payload'

import { editorOrAdmin, publishedOnly } from '@/access'
import { provenanceGroup } from '@/fields/provenance'
import { revalidateCollection } from '@/hooks/revalidate'
import { canonicalRegistration } from '@/lib/aircraft'

/**
 * The aircraft catalogue (issue #63). Three legacy tables feed it: `aircrafts` (the catalogue),
 * `vehicles` (an older mixed table of planes and yachts) and `aircraft_images`
 * (`docs/legacy-inventory.md` section 8). Every column of the three maps either to a field here
 * or to `legacyAttributes`; the mapping table is in the pull request.
 *
 * Two rules keep the merge of E5.7 honest. `registration` is the canonical form the legacy
 * comparison used, `upper(replace(x, '-', ''))`, so it is the natural key; `registrationDisplay`
 * keeps the spelling the source had, because that is what the detail page rendered.
 *
 * The rich and basic detail layouts are chosen from the image count at render time (E8.3) and
 * never stored, matching the legacy fallback.
 */
const revalidation = revalidateCollection('aircraft')

/** Which offers an aircraft is listed under, from the four legacy booleans. */
const AIRCRAFT_OFFERINGS = ['charter', 'sale', 'lease', 'cargo'] as const

/** Where a document came from, per ADR-0002 section 8. */
const AIRCRAFT_ORIGINS = ['aircrafts-catalog', 'vehicles-legacy', 'manual'] as const

/** The image roles the legacy `aircraft_images.type` enum allowed. */
const AIRCRAFT_IMAGE_TYPES = ['exterior', 'cabin', 'cockpit'] as const

export const Aircraft: CollectionConfig = {
  slug: 'aircraft',
  admin: {
    useAsTitle: 'registrationDisplay',
    defaultColumns: ['registrationDisplay', 'model', 'category', 'passengers', '_status'],
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
      ({ data }) => {
        if (!data) return data

        // The natural key is derived, never typed: an editor enters the registration as it is
        // painted on the aircraft and the key follows.
        if ('registrationDisplay' in data) {
          data.registration = canonicalRegistration(data.registrationDisplay)
        }

        return data
      },
    ],
  },
  versions: { drafts: true, maxPerDoc: 25 },
  fields: [
    {
      name: 'registrationDisplay',
      type: 'text',
      required: true,
      admin: {
        description: 'The registration as it is painted on the aircraft, hyphens included.',
      },
    },
    {
      name: 'registration',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Canonical registration, derived from the one above by upper-casing and removing hyphens. The natural key the import merges on.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The legacy slug, kept so /aircraft/<slug> does not move.',
      },
    },
    {
      // Not `status`: drafts are enabled, and Payload's own `_status` generates an enum of the
      // same name, so a `status` field silently inherits draft/published and rejects its own
      // values. `availability` is this aircraft's commercial state, separate from publication.
      name: 'availability',
      type: 'select',
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Unavailable', value: 'unavailable' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'offerings',
      type: 'select',
      hasMany: true,
      options: AIRCRAFT_OFFERINGS.map((offering) => ({ label: offering, value: offering })),
      admin: {
        position: 'sidebar',
        description: 'From the legacy is_for_charter, is_for_sale, is_for_lease and is_cargo.',
      },
    },
    {
      type: 'group',
      name: 'type',
      label: 'Type',
      admin: {
        description: 'The aircraft type, as the legacy aircraft_type_* columns describe it.',
      },
      fields: [
        { name: 'name', type: 'text', index: true },
        { name: 'slug', type: 'text' },
        { name: 'category', type: 'text', index: true },
        { name: 'manufacturer', type: 'text' },
        { name: 'model', type: 'text', index: true },
      ],
    },
    {
      type: 'group',
      name: 'specification',
      label: 'Specification',
      fields: [
        { name: 'passengers', type: 'number', index: true },
        { name: 'typePassengers', type: 'number' },
        { name: 'rangeMaximum', type: 'number', index: true },
        { name: 'speedTypical', type: 'number' },
        { name: 'cabinHeight', type: 'number', index: true },
        { name: 'cabinLength', type: 'number' },
        { name: 'cabinWidth', type: 'number' },
        { name: 'yearOfProduction', type: 'number', index: true },
        { name: 'serialNumber', type: 'text' },
        { name: 'hoursFlown', type: 'number' },
        { name: 'cycles', type: 'number' },
        { name: 'interiorRefit', type: 'text' },
        { name: 'exteriorRefit', type: 'text' },
        { name: 'luggageVolume', type: 'text' },
        { name: 'sleepingPlaces', type: 'number' },
        { name: 'divanSeats', type: 'number' },
        { name: 'beds', type: 'number' },
      ],
    },
    {
      type: 'group',
      name: 'amenities',
      label: 'Amenities',
      admin: { description: 'The legacy extension_* booleans. Stored but not rendered today.' },
      fields: [
        { name: 'cabinCrew', type: 'checkbox' },
        { name: 'lavatory', type: 'checkbox' },
        { name: 'shower', type: 'checkbox' },
        { name: 'hotMeal', type: 'checkbox' },
        { name: 'wirelessInternet', type: 'checkbox' },
        { name: 'satellitePhone', type: 'checkbox' },
        { name: 'petsAllowed', type: 'checkbox' },
        { name: 'refurbishment', type: 'checkbox' },
      ],
    },
    {
      type: 'group',
      name: 'operator',
      label: 'Operator',
      fields: [
        { name: 'companyName', type: 'text' },
        { name: 'companySlug', type: 'text' },
        { name: 'technicalOperator', type: 'text' },
      ],
    },
    {
      name: 'baseAirport',
      type: 'relationship',
      relationTo: 'airports',
      index: true,
      admin: {
        description: 'Resolved from the legacy airport_icao during the import of E5.6.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'From the legacy extension_description. Localized, unlike the source column, which held one language.',
      },
    },
    {
      name: 'specialEquipment',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'view360Url',
      type: 'text',
      admin: { description: 'The legacy extension_view_360 iframe source, when there is one.' },
    },
    {
      type: 'group',
      name: 'brochure',
      label: 'Brochure',
      fields: [
        { name: 'url', type: 'text' },
        { name: 'name', type: 'text' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description:
          'In the order they are shown. The first is the hero; the rich detail layout needs more than one.',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'exterior',
          options: AIRCRAFT_IMAGE_TYPES.map((type) => ({ label: type, value: type })),
        },
        { name: 'media', type: 'upload', relationTo: 'media' },
        {
          name: 'externalUrl',
          type: 'text',
          admin: {
            description: 'Set while the file still lives on a legacy host, as on Media.',
          },
        },
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
      origins: AIRCRAFT_ORIGINS,
      legacyFields: [
        { name: 'legacyAircraftId', type: 'number', index: true },
        { name: 'legacyVehicleId', type: 'number', index: true },
        { name: 'legacyTailNumber', type: 'text' },
        { name: 'legacySlug', type: 'text', index: true },
        {
          name: 'mergedFrom',
          type: 'array',
          admin: { description: 'Every legacy row folded into this document.' },
          fields: [
            { name: 'table', type: 'text', required: true },
            { name: 'id', type: 'number', required: true },
          ],
        },
      ],
      verified: true,
    }),
  ],
}
