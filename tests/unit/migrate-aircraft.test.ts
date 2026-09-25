import { describe, expect, it } from 'vitest'

import {
  aircraftKey,
  fromCatalogue,
  type AircraftImageRow,
  type AircraftsRow,
} from '../../scripts/migrate/aircraft'

/**
 * What a catalogue row becomes (issue #78), away from a database. The legacy site rendered the
 * `real` columns as Postgres printed them, so they arrive as text and have to stay that number.
 */
const row = (fields: Partial<AircraftsRow> = {}): AircraftsRow => ({
  id: 7,
  slug: 'gulfstream-g650-n650gx',
  registration_number: 'N650GX',
  year_of_production: 2016,
  passengers_max: 14,
  serial_number: null,
  hours_flown: null,
  cycles: null,
  verified_at: null,
  tech_operator: null,
  is_cargo: false,
  is_for_sale: false,
  is_for_lease: false,
  is_for_charter: true,
  pdf_attachment: null,
  pdf_attachment_name: null,
  company_slug: null,
  company_name: null,
  extension_refurbishment: null,
  extension_view_360: null,
  extension_cabin_crew: null,
  extension_divan_seats: null,
  extension_lavatory: null,
  extension_beds: null,
  extension_hot_meal: null,
  extension_wireless_internet: null,
  extension_pets_allowed: null,
  extension_cabin_height: null,
  extension_cabin_length: null,
  extension_cabin_width: null,
  extension_luggage_volume: null,
  extension_shower: null,
  extension_satellite_phone: null,
  extension_sleeping_places: null,
  extension_description: null,
  extension_spec_equipment: null,
  airport_iata: null,
  airport_icao: null,
  airport_name: null,
  aircraft_type_slug: 'gulfstream-g650',
  aircraft_type_name: 'Gulfstream G650',
  aircraft_type_range_maximum: 12964,
  aircraft_type_pax_maximum: 19,
  aircraft_type_aircraft_class_name: 'Heavy jet',
  aircraft_type_speed_typical_text: '904.5',
  aircraft_type_cabin_height_text: '1.85',
  aircraft_type_cabin_length_text: '13.97',
  aircraft_type_cabin_width_text: '2.49',
  ...fields,
})

const context = {
  runId: 'run-1',
  importedAt: '2026-09-25T00:00:00.000Z',
  airports: new Map([['OMDB', 42]]),
}

const image = (id: number, type: AircraftImageRow['type']): AircraftImageRow => ({
  id,
  aircraft_id: 7,
  type,
  url: `https://images.example.test/${id}.jpg`,
})

describe('a catalogue row', () => {
  it('renders the real columns as the legacy site printed them, not as floats', () => {
    // 1.85 read as a float4 is 1.850000023841858; the text Postgres prints is what showed.
    expect(fromCatalogue(row(), [], context).data.specification).toMatchObject({
      cabinHeight: 1.85,
      cabinLength: 13.97,
      cabinWidth: 2.49,
      speedTypical: 904.5,
    })
    expect(
      fromCatalogue(row({ aircraft_type_cabin_height_text: null }), [], context).data.specification,
    ).not.toHaveProperty('cabinHeight')
  })

  it('keeps its slug and registration as written, with the provenance of the run', () => {
    expect(fromCatalogue(row(), [], context).data).toMatchObject({
      registrationDisplay: 'N650GX',
      slug: 'gulfstream-g650-n650gx',
      provenance: {
        origin: 'aircrafts-catalog',
        legacyAircraftId: 7,
        legacySlug: 'gulfstream-g650-n650gx',
        importRunId: 'run-1',
        importedAt: '2026-09-25T00:00:00.000Z',
      },
    })
  })

  it('keeps its slug as the registration when the row has none', () => {
    expect(
      fromCatalogue(row({ registration_number: ' ' }), [], context).data.registrationDisplay,
    ).toBe('gulfstream-g650-n650gx')
  })

  it('lists the offers the four booleans set, in one order', () => {
    expect(
      fromCatalogue(row({ is_cargo: true, is_for_sale: true, is_for_charter: false }), [], context)
        .data.offerings,
    ).toEqual(['sale', 'cargo'])
  })

  it('shows its images in the order of their ids, whatever order they arrive in', () => {
    const images = fromCatalogue(
      row(),
      [image(9, 'cockpit'), image(3, 'exterior'), image(5, 'cabin')],
      context,
    ).data.images

    expect(images?.map((one) => one.type)).toEqual(['exterior', 'cabin', 'cockpit'])
    expect(images?.[0]).toEqual({
      type: 'exterior',
      externalUrl: 'https://images.example.test/3.jpg',
    })
  })

  it('bases it at the airport of its ICAO code, and keeps a code no airport answers to', () => {
    expect(fromCatalogue(row({ airport_icao: 'omdb' }), [], context).data).toMatchObject({
      baseAirport: 42,
    })
    expect(fromCatalogue(row({ airport_icao: 'omdb' }), [], context).data).not.toHaveProperty(
      'legacyAttributes',
    )
    expect(fromCatalogue(row({ airport_icao: 'ZZZZ' }), [], context).data).toMatchObject({
      legacyAttributes: { airport_icao: 'ZZZZ' },
    })
  })

  it('keeps every column with no field of its own in legacyAttributes', () => {
    expect(
      fromCatalogue(
        row({
          verified_at: '2024-05-01',
          extension_cabin_height: '1.9 m',
          airport_iata: 'DXB',
          airport_name: 'Dubai International',
        }),
        [],
        context,
      ).data.legacyAttributes,
    ).toEqual({
      verified_at: '2024-05-01',
      extension_cabin_height: '1.9 m',
      airport_iata: 'DXB',
      airport_name: 'Dubai International',
    })
  })
})

describe('the aircraft a row is', () => {
  it('is its canonical registration, hyphens and case aside', () => {
    expect(
      aircraftKey(fromCatalogue(row({ registration_number: 'ra-73025' }), [], context).data),
    ).toEqual({
      registration: { equals: 'RA73025' },
    })
  })
})
