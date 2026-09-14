import type { Block } from 'payload'

/**
 * The hero the aircraft listing opens with (issue #133, `docs/legacy-inventory.md` section 4): a
 * heading with a figure counting up inside it and a sentence under it. The legacy read the three
 * parts of the heading from three translation keys so the figure could sit between them.
 */
export const heroAircraft: Block = {
  slug: 'heroAircraft',
  interfaceName: 'HeroAircraftBlock',
  labels: { singular: 'Aircraft hero', plural: 'Aircraft heroes' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'figure',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Counted up when the hero arrives, as `50,000`.' },
    },
    {
      name: 'title2',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The rest of the heading, after the figure.' },
    },
    { name: 'description', type: 'textarea', required: true, localized: true },
  ],
}
