import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { File } from 'payload'

import { mediaFilename, type LegacyDocument } from '../../scripts/migrate/assets'
import { placeDocuments, placePictures, type Placement } from '../../scripts/migrate/pictures'
import { createMedia, pngFile } from '../factories'
import { createRegistry, getTestPayload, uniqueSuffix, type TestRegistry } from '../helpers/payload'

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

describe('putting the legacy documents into the business agents page', () => {
  const suffix = uniqueSuffix()
  const slug = `documents-${suffix}`
  const placeholder = `placeholder-${suffix}.png`
  const pdf = (name: string): File => {
    // The least Payload accepts as a PDF: the header, an xref marker and the end-of-file marker.
    const data = Buffer.from('%PDF-1.4\nxref\n0 0\ntrailer<<>>\nstartxref\n9\n%%EOF\n')

    return { data, mimetype: 'application/pdf', name, size: data.length }
  }
  const documents: LegacyDocument[] = (
    [
      [0, 'en'],
      [0, 'ru'],
      [1, 'en'],
      [1, 'ru'],
    ] as const
  ).map(([document, locale]) => ({
    url: `https://atmjet.ams3.cdn.digitaloceanspaces.com/${suffix}-${document}-${locale}.pdf`,
    filename: `document-${suffix}-${document}-${locale}.pdf`,
    alt: `Document ${document} in ${locale}`,
    document,
    locale,
  }))
  const ids: Record<string, number> = {}
  let page: number

  beforeAll(async () => {
    const payload = await getTestPayload()
    ids.placeholder = (await createMedia(registry, { alt: 'Placeholder' }, pngFile(placeholder))).id
    for (const one of documents)
      ids[one.filename] = (await createMedia(registry, { alt: one.alt }, pdf(one.filename))).id

    const rows = (title: string, label: string) =>
      [0, 1].map(() => ({ title, label, image: ids.placeholder, file: ids.placeholder }))
    const created = await registry.create('pages', {
      title: 'Documents',
      slug,
      _status: 'published',
      layout: [{ blockType: 'documents', documents: rows('Checklist', 'Open guide') }],
    })
    page = created.id
    // The seed writes the other languages the same way: each with its own words and the one
    // placeholder, since an upload the block requires cannot be left out.
    const block = (created.layout as unknown as [{ id: string; documents: { id: string }[] }])[0]
    for (const [locale, title, label] of [
      ['ru', 'Чек-лист', 'Скачать'],
      ['uk', 'Чекліст', 'Завантажити'],
    ] as const)
      await payload.update({
        collection: 'pages',
        id: page,
        locale,
        data: {
          title: `Documents (${locale})`,
          layout: [
            {
              id: block.id,
              blockType: 'documents',
              documents: block.documents.map((row) => ({
                id: row.id,
                title,
                label,
                image: ids.placeholder,
                file: ids.placeholder,
              })),
            },
          ],
        },
        overrideAccess: true,
        context: { skipRevalidation: true },
      })
  })

  const files = async (locale: 'en' | 'ru' | 'uk') => {
    const payload = await getTestPayload()
    const read = await payload.findByID({
      collection: 'pages',
      id: page,
      depth: 0,
      locale,
      overrideAccess: true,
    })
    const block = read.layout?.[0] as { documents?: { file?: unknown }[] } | undefined

    return (block?.documents ?? []).map((row) => row.file)
  }

  it('opens each document in the language of the page, and in English where the legacy had none', async () => {
    const payload = await getTestPayload()
    const outcomes = await placeDocuments(payload, {
      documents,
      placeholders: [placeholder],
      page: slug,
    })

    expect(outcomes.map((one) => one.swapped)).toEqual([2, 2, 2])
    const id = (document: number, locale: 'en' | 'ru') =>
      ids[`document-${suffix}-${document}-${locale}.pdf`]
    expect(await files('en')).toEqual([id(0, 'en'), id(1, 'en')])
    expect(await files('ru')).toEqual([id(0, 'ru'), id(1, 'ru')])
    expect(await files('uk')).toEqual([id(0, 'en'), id(1, 'en')])
  })

  it('has nothing left to do the second time', async () => {
    const payload = await getTestPayload()
    const outcomes = await placeDocuments(payload, {
      documents,
      placeholders: [placeholder],
      page: slug,
    })

    expect(outcomes.map((one) => one.swapped)).toEqual([0, 0, 0])
  })
})
