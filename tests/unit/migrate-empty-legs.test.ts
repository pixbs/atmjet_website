import { describe, expect, it } from 'vitest'

import { fromEmptyLeg, type EmptyLegRow } from '../../scripts/migrate/empty-legs'

/**
 * What a legacy empty leg becomes (issue #83), away from a database: the instants in UTC
 * whatever zone they were written in, and both ends resolved by ICAO code.
 */
const row = (fields: Partial<EmptyLegRow> = {}): EmptyLegRow => ({
  id: 3,
  start: new Date('2026-10-01T08:00:00Z'),
  end: new Date('2026-10-01T12:00:00Z'),
  from: 'omdb',
  to: 'LFPB',
  type: 'Gulfstream G650',
  category: null,
  company: 'Rus Jet',
  safety: null,
  price: 9000,
  order: 1,
  ...fields,
})

const context = {
  runId: 'run-4',
  importedAt: '2026-09-25T00:00:00.000Z',
  airports: new Map([
    ['OMDB', 11],
    ['LFPB', 12],
  ]),
}

describe('an empty leg row', () => {
  it('keeps both instants in UTC, from a date or from text with an offset', () => {
    expect(fromEmptyLeg(row(), context).doc.data).toMatchObject({
      departureAt: '2026-10-01T08:00:00.000Z',
      arrivalAt: '2026-10-01T12:00:00.000Z',
    })
    expect(
      fromEmptyLeg(row({ start: '2026-10-03 22:30:00+04' }), context).doc.data.departureAt,
    ).toBe('2026-10-03T18:30:00.000Z')
  })

  it('links both ends to the airports of their codes, and keeps the codes', () => {
    const { doc, unresolved } = fromEmptyLeg(row(), context)

    expect(doc.data).toMatchObject({
      departureIcao: 'OMDB',
      departureAirport: 11,
      arrivalIcao: 'LFPB',
      arrivalAirport: 12,
    })
    expect(unresolved).toEqual([])
  })

  it('keeps a code no airport answers to as text, and lists it', () => {
    const { doc, unresolved } = fromEmptyLeg(row({ to: 'zzzz' }), context)

    expect(doc.data).toMatchObject({ arrivalIcao: 'ZZZZ' })
    expect(doc.data).not.toHaveProperty('arrivalAirport')
    expect(unresolved).toEqual([{ leg: 3, column: 'to', icao: 'ZZZZ' }])
  })

  it('keeps the price, the order and the aircraft text, with where it came from', () => {
    expect(fromEmptyLeg(row(), context).doc.data).toMatchObject({
      price: 9000,
      order: 1,
      aircraft: { type: 'Gulfstream G650', company: 'Rus Jet' },
      provenance: { origin: 'empty-legs-legacy', legacyId: 3, importRunId: 'run-4' },
    })
  })

  it('keeps a price the field refuses outside it rather than refusing the row', () => {
    const { data } = fromEmptyLeg(row({ price: -1 }), context).doc

    expect(data).not.toHaveProperty('price')
    expect(data.legacyAttributes).toEqual({ price: -1 })
  })
})
