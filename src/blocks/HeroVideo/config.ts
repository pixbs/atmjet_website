import type { Block } from 'payload'

/**
 * The home page hero (issue #111, `docs/legacy-inventory.md` section 5): a video behind the
 * wordmark and the promise, darkened enough to read them on.
 *
 * The videos are paths under `public/`, not uploads, which is the decision on issue #175: the
 * legacy site served them from the app and there is no bucket in front of them yet.
 */
export const heroVideo: Block = {
  slug: 'heroVideo',
  interfaceName: 'HeroVideoBlock',
  labels: { singular: 'Hero video', plural: 'Hero videos' },
  fields: [
    { name: 'overline', type: 'text', required: true, localized: true },
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'video',
      type: 'text',
      required: true,
      admin: {
        description:
          'Path under `public`, as the legacy markup wrote it — `/video/background_full.mp4`. The legacy path had no leading slash, so it resolved against the page and needed a second copy of the file (section 13, entry 13).',
      },
    },
    {
      name: 'videoMobile',
      type: 'text',
      admin: {
        description:
          'Shown instead on a narrow screen. The legacy site named one and never used it, so leaving this empty is what it drew.',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The still shown until the video plays. The legacy hero had none, so leaving this empty is what it drew.',
      },
    },
  ],
}
