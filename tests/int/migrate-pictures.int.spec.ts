import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { mediaFilename } from '../../scripts/migrate/assets'
import { placePictures, type Placement } from '../../scripts/migrate/pictures'
import { createMedia, pngFile } from '../factories'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

/**
 * The legacy pictures going back into a page's sections (issue #84): into the placeholders, in
 * every locale at once since an upload is not translated, and nowhere an editor has chosen one.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('putting the legacy pictures into a page', () => {
  const suffix = uniqueSuffix()
  const slug = `pictures-${suffix}`
  const pictures = [`one-${suffix}/a.png`, `two-${suffix}/b.png`]
  const placeholder = `placeholder-${suffix}.png`
  let ids: { placeholder: number; chosen: number; pictures: number[] }
  let page: number

  beforeAll(async () => {
    const make = (name: string) => createMedia(registry, { alt: name }, pngFile(name))
    ids = {
      placeholder: (await make(placeholder)).id,
      chosen: (await make(`chosen-${suffix}.png`)).id,
      pictures: [
        (await make(mediaFilename(pictures[0]))).id,
        (await make(mediaFilename(pictures[1]))).id,
      ],
    }
    const created = await registry.create('pages', {
      title: 'Pictures',
      slug,
      _status: 'published',
      layout: [
        {
          blockType: 'heroSubpage',
          title: 'Hero',
          image: ids.placeholder,
        },
        {
          blockType: 'whyUs',
          variant: 'bare',
          cards: [
            { title: 'First', description: 'One', image: ids.placeholder },
            { title: 'Second', description: 'Two', image: ids.chosen },
          ],
        },
      ],
    })
    page = created.id
    const [hero, whyUs] = created.layout as unknown as [
      { id: string },
      { id: string; cards: { id: string }[] },
    ]
    await registry.payload.update({
      collection: 'pages',
      id: page,
      locale: 'ru',
      data: {
        title: 'Картинки',
        layout: [
          { id: hero.id, blockType: 'heroSubpage', title: 'Герой', image: ids.placeholder },
          {
            id: whyUs.id,
            blockType: 'whyUs',
            variant: 'bare',
            cards: [
              {
                id: whyUs.cards[0].id,
                title: 'Первая',
                description: 'Одна',
                image: ids.placeholder,
              },
              { id: whyUs.cards[1].id, title: 'Вторая', description: 'Две', image: ids.chosen },
            ],
          },
        ],
      },
      overrideAccess: true,
    })
  })

  const placements: Placement[] = [
    { page: slug, block: 'heroSubpage', field: 'image', pictures: [pictures[0]] },
    { page: slug, block: 'whyUs', field: 'cards.*.image', pictures },
  ]

  it('replaces the placeholders and keeps what an editor chose', async () => {
    const outcomes = await placePictures(registry.payload, {
      placements,
      placeholders: [placeholder],
    })
    const read = await registry.payload.findByID({
      collection: 'pages',
      id: page,
      depth: 0,
      overrideAccess: true,
    })
    const [hero, whyUs] = read.layout ?? []

    expect(outcomes[0]).toEqual({ target: slug, swapped: 2 })
    expect(hero).toMatchObject({ image: ids.pictures[0] })
    expect(whyUs).toMatchObject({
      cards: [{ image: ids.pictures[0] }, { image: ids.chosen }],
    })
  })

  it('leaves the other locales their words', async () => {
    const ru = await registry.payload.findByID({
      collection: 'pages',
      id: page,
      locale: 'ru',
      depth: 0,
      overrideAccess: true,
    })

    expect(ru.title).toBe('Картинки')
    expect(ru.layout?.[0]).toMatchObject({ title: 'Герой', image: ids.pictures[0] })
    expect(ru.layout?.[1]).toMatchObject({
      cards: [{ description: 'Одна', image: ids.pictures[0] }, { description: 'Две' }],
    })
  })

  it('has nothing left to do the second time', async () => {
    const outcomes = await placePictures(registry.payload, {
      placements,
      placeholders: [placeholder],
    })

    expect(outcomes[0]).toEqual({ target: slug, swapped: 0 })
  })
})
