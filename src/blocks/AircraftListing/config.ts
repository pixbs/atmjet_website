import type { Block } from 'payload'

/**
 * The aircraft listing (issue #135, `docs/legacy-inventory.md` section 4, `/aircraft` item 4):
 * the filter card and, under it, the catalogue a batch at a time.
 *
 * The aircraft are documents and the sort is in the URL, so the only thing an editor owns here
 * is the heading over the two selects. How many a batch holds is the listing's own contract
 * (`src/lib/aircraft.ts`), because the URL may ask for another size and the page is read before
 * any block is.
 */
export const aircraftListing: Block = {
  slug: 'aircraftListing',
  interfaceName: 'AircraftListingBlock',
  labels: { singular: 'Aircraft listing', plural: 'Aircraft listings' },
  fields: [{ name: 'title', type: 'text', required: true, localized: true }],
}
