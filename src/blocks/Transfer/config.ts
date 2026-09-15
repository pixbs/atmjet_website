import type { Block } from 'payload'

/**
 * The transfer invitation (issue #115, `docs/legacy-inventory.md` section 5): the same flight
 * request form, in a card with a photograph across the top of it.
 *
 * The legacy section hard-coded the picture and read its heading from `transfer.title`; both are
 * the editor's here, as in every other ported section.
 */
export const transfer: Block = {
  slug: 'transfer',
  interfaceName: 'TransferBlock',
  labels: { singular: 'Transfer', plural: 'Transfers' },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
  ],
}
