import type { Block } from 'payload'

/**
 * The hero the home page opens with (issue #111, `docs/legacy-inventory.md` section 5): a line
 * of small capitals over the heading, on a film filling the screen.
 *
 * The films are paths under `public/` rather than Media documents, as the legacy served them
 * (the decision on issue #111; delivery is E11.6, issue #175). The poster is an upload, being a
 * picture like any other: the legacy had none, so the first frame was a black screen.
 */
export const heroVideo: Block = {
  slug: 'heroVideo',
  interfaceName: 'HeroVideoBlock',
  labels: { singular: 'Video hero', plural: 'Video heroes' },
  fields: [
    { name: 'overline', type: 'text', required: true, localized: true },
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'video',
      type: 'text',
      required: true,
      admin: { description: 'Where the film is served from, as `/video/background_full.mp4`.' },
    },
    {
      name: 'videoMobile',
      type: 'text',
      admin: { description: 'Played instead on a narrow screen. Without one the wide film plays.' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Held on the screen until the film has enough of itself to play.' },
    },
  ],
}
