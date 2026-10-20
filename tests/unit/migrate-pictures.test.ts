import { describe, expect, it } from 'vitest'

import { LEGACY_ASSETS } from '../../scripts/migrate/assets'
import { FOOTER_PICTURE, PLACEMENTS, placeInBlock } from '../../scripts/migrate/pictures'

/**
 * Where each legacy picture goes back (issue #84): only into a slot that still holds the seed's
 * placeholder, and every imported picture somewhere.
 */
const PLACEHOLDER = 1
const EDITORS = 2
const ids: Record<string, number> = { 'a.webp': 10, 'b.webp': 11, 'c.webp': 12 }
const pictureId = (path: string) => ids[path]

describe('putting the legacy pictures back', () => {
  it('fills the placeholders of every row in order, and nothing an editor chose', () => {
    const block = {
      blockType: 'whyUs',
      cards: [{ image: PLACEHOLDER }, { image: EDITORS }, { image: PLACEHOLDER }],
    }

    const swapped = placeInBlock(
      block,
      { field: 'cards.*.image', pictures: ['a.webp', 'b.webp', 'c.webp'] },
      new Set([PLACEHOLDER]),
      pictureId,
    )

    expect(swapped).toBe(2)
    expect(block.cards).toEqual([{ image: 10 }, { image: EDITORS }, { image: 12 }])
  })

  it('leaves a row the legacy drew no picture in, and a slot the seed left empty', () => {
    const block = { cards: [{ image: PLACEHOLDER }, { image: null }] }

    placeInBlock(
      block,
      { field: 'cards.*.image', pictures: [null, 'b.webp'] },
      new Set([PLACEHOLDER]),
      pictureId,
    )

    expect(block.cards).toEqual([{ image: PLACEHOLDER }, { image: null }])
  })

  it('reaches into a group, and reads an upload a deeper read expanded', () => {
    const block = { invitation: { image: { id: PLACEHOLDER, filename: 'seed-gold.png' } } }

    placeInBlock(
      block,
      { field: 'invitation.image', pictures: ['a.webp'] },
      new Set([PLACEHOLDER]),
      pictureId,
    )

    expect(block.invitation.image).toBe(10)
  })

  it('keeps the placeholder while the picture is not in Media yet', () => {
    const block = { image: PLACEHOLDER }

    placeInBlock(block, { field: 'image', pictures: ['missing.webp'] }, new Set([1]), pictureId)

    expect(block.image).toBe(PLACEHOLDER)
  })
})

describe('the placements', () => {
  const placed = new Set([
    ...PLACEMENTS.flatMap((one) => one.pictures).filter((one) => one !== null),
    FOOTER_PICTURE,
  ])

  it('name only pictures the import brings', () => {
    const imported = new Set(LEGACY_ASSETS.map((asset) => asset.path))

    expect([...placed].filter((picture) => !imported.has(picture))).toEqual([])
  })

  it('give every imported picture a place but the one the citizens card never showed', () => {
    expect(LEGACY_ASSETS.map((asset) => asset.path).filter((path) => !placed.has(path))).toEqual([
      'citizens/why_us_foreignaircraft.webp',
    ])
  })
})
