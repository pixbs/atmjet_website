import { describe, expect, it } from 'vitest'

import { pageMetadata, type PageMetadata } from '@/lib/metadata'

/**
 * What a page says about itself (issue #170). The legacy layout computed a title and never
 * returned it, twelve of the thirteen routes exported no metadata at all, and no page carried a
 * canonical URL or an `hreflang` link (`docs/legacy-inventory.md` section 2.4).
 */
const base: PageMetadata = {
  locale: 'en',
  locales: ['en', 'ru'],
  slug: 'yachts',
  title: 'Yacht charter',
  description: 'Charter a yacht.',
  siteName: 'ATM JET',
  origin: 'https://atmjet.com',
}

const build = (overrides: Partial<PageMetadata> = {}) => pageMetadata({ ...base, ...overrides })

describe('pageMetadata', () => {
  it('points a crawler at the page it is reading, in the locale it asked for', () => {
    expect(build({ locale: 'ru' }).alternates?.canonical).toBe('https://atmjet.com/ru/yachts')
  })

  it('links the locales to each other, so they stop competing for the same content', () => {
    expect(build().alternates?.languages).toEqual({
      en: 'https://atmjet.com/en/yachts',
      ru: 'https://atmjet.com/ru/yachts',
      'x-default': 'https://atmjet.com/en/yachts',
    })
  })

  it('gives the home page the locale root as its canonical, not /en/home', () => {
    expect(build({ slug: '' }).alternates?.canonical).toBe('https://atmjet.com/en')
  })

  it('shares the title and description a link preview shows', () => {
    const { openGraph, twitter } = build()

    expect(openGraph).toMatchObject({
      title: 'Yacht charter',
      description: 'Charter a yacht.',
      url: 'https://atmjet.com/en/yachts',
      siteName: 'ATM JET',
      type: 'website',
    })
    expect(twitter).toMatchObject({ title: 'Yacht charter', description: 'Charter a yacht.' })
  })

  it('names the language it is written in, and the ones it is also available in', () => {
    const openGraph = build({ locale: 'ru' }).openGraph

    // Open Graph wants a territory where hreflang does not, so `ru` alone would be ignored.
    expect(openGraph).toMatchObject({ locale: 'ru_RU', alternateLocale: ['en_US'] })
  })

  it('asks for a large preview only when it has an image to fill it', () => {
    expect(build({ image: '/media/yacht.jpg' }).twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['/media/yacht.jpg'],
    })
    expect(build().twitter).toMatchObject({ card: 'summary' })
  })

  it('offers no image rather than an empty one', () => {
    const { openGraph, twitter } = build({ image: null })

    expect(openGraph?.images).toBeUndefined()
    expect(twitter && 'images' in twitter ? twitter.images : undefined).toBeUndefined()
  })
})

describe('the video a page opens on', () => {
  it('names the file and the container it is in', () => {
    const { openGraph } = build({ video: 'https://atmjet.com/video/background_full.mp4' })

    expect(openGraph).toMatchObject({
      videos: [{ url: 'https://atmjet.com/video/background_full.mp4', type: 'video/mp4' }],
    })
  })

  it('reads the container off the path rather than assuming the legacy one', () => {
    const { openGraph } = build({ video: 'https://atmjet.com/video/hero.WEBM' })

    expect(openGraph).toMatchObject({ videos: [{ type: 'video/webm' }] })
  })

  it('says nothing about a container it does not know', () => {
    const { openGraph } = build({ video: 'https://atmjet.com/video/hero.mov' })

    expect(openGraph?.videos).toEqual([{ url: 'https://atmjet.com/video/hero.mov' }])
  })

  it('names no video on a page that opens on none', () => {
    expect(build().openGraph?.videos).toBeUndefined()
  })
})
