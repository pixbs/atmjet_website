import { describe, expect, it } from 'vitest'

import { aircraftRedirects } from '../../scripts/migrate/redirects'

/**
 * The old aircraft URLs one aircraft answers to (issue #172): the legacy `/planes/:id` and
 * `/aircrafts/:id` for every id the legacy detail route resolved it by.
 */
describe('the old addresses of an aircraft', () => {
  it('are its catalogue slug and its tail number under both old prefixes, to its page', () => {
    expect(
      aircraftRedirects({
        slug: 'gulfstream-g650-ra-73025',
        registrationDisplay: 'RA-73025',
        provenance: {
          origin: 'aircrafts-catalog',
          legacySlug: 'gulfstream-g650-ra-73025',
          legacyTailNumber: 'RA-73025',
        },
      }),
    ).toEqual([
      { from: '/planes/gulfstream-g650-ra-73025', to: '/aircraft/gulfstream-g650-ra-73025' },
      { from: '/aircrafts/gulfstream-g650-ra-73025', to: '/aircraft/gulfstream-g650-ra-73025' },
      { from: '/planes/RA-73025', to: '/aircraft/gulfstream-g650-ra-73025' },
      { from: '/aircrafts/RA-73025', to: '/aircraft/gulfstream-g650-ra-73025' },
    ])
  })

  it('are the address it is served at, for an aircraft with no legacy row', () => {
    expect(
      aircraftRedirects({
        slug: null,
        registrationDisplay: 'M-OUSE',
        provenance: { origin: 'manual' },
      }),
    ).toEqual([
      { from: '/planes/MOUSE', to: '/aircraft/MOUSE' },
      { from: '/aircrafts/MOUSE', to: '/aircraft/MOUSE' },
    ])
  })

  it('leave out an id that would be a path of its own', () => {
    expect(
      aircraftRedirects({
        slug: 'zz-1',
        registrationDisplay: 'ZZ-1',
        provenance: { origin: 'vehicles-legacy', legacyTailNumber: 'ZZ/1' },
      }).map((rule) => rule.from),
    ).toEqual(['/planes/zz-1', '/aircrafts/zz-1'])
  })
})
