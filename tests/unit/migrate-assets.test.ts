import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { LEGACY_ASSETS, manifestTsv, mediaFilename } from '../../scripts/migrate/assets'

/**
 * The pictures the media import brings across (issue #84): exactly the ones
 * `docs/legacy-inventory.md` section 12.2 lists a legacy consumer for, each under a filename of
 * its own.
 */

/** `why_us_{a,b}.webp` and `slice_0..7.webp` as the inventory writes them, spelled out. */
function expand(pattern: string): string[] {
  const braces = pattern.match(/\{([^}]*)\}/)
  if (braces)
    return braces[1]
      .split(',')
      .flatMap((choice) => expand(pattern.replace(braces[0], choice.trim())))

  const range = pattern.match(/(\d+)\.\.(\d+)/)
  if (range) {
    const [whole, from, to] = range
    return Array.from({ length: Number(to) - Number(from) + 1 }, (_, index) =>
      pattern.replace(whole, String(Number(from) + index).padStart(from.length, '0')),
    )
  }

  return [pattern]
}

/** The consumers of 12.2 that are not pictures, or not live code. */
const NOT_PICTURES = ['HeroSection', 'Home `generateMetadata`', 'globals.css', 'dead Testimonials']

/** The decision of 2026-09-13: the file the code misspelled comes across under its own name. */
const RENAMED: Record<string, string> = {
  'citizens/why_us_foreignaircrafts.webp': 'citizens/why_us_foreignaircraft.webp',
}

function inventoryPictures(): string[] {
  const inventory = readFileSync('docs/legacy-inventory.md', 'utf8')
  const section = inventory.slice(
    inventory.indexOf('### 12.2 Public files by consumer'),
    inventory.indexOf('### 12.3'),
  )
  const paths: string[] = []

  for (const line of section.split('\n').filter((row) => row.startsWith('| '))) {
    const [consumer, files] = line
      .split('|')
      .slice(1, 3)
      .map((cell) => cell.trim())
    if (!files?.includes('`') || NOT_PICTURES.some((name) => consumer.startsWith(name))) continue

    // A bare filename sits in the folder of the path before it in the same cell.
    let folder = ''
    for (const [, token] of files.matchAll(/`([^`]+)`/g)) {
      const cleaned = token.replace(/\(missing\)/g, '')
      const relative = cleaned.startsWith('/images/') ? cleaned.slice('/images/'.length) : cleaned
      const full = relative.includes('/') ? relative : `${folder}/${relative}`
      folder = full.slice(0, full.lastIndexOf('/'))
      paths.push(...expand(full).map((one) => RENAMED[one] ?? one))
    }
  }

  return paths
}

describe('the legacy pictures', () => {
  it('are every picture a live legacy page drew, and nothing else', () => {
    const listed = LEGACY_ASSETS.map((asset) => asset.path)

    expect(new Set(listed)).toEqual(new Set(inventoryPictures()))
    expect(listed).toHaveLength(78)
  })

  it('each come across under a filename of its own, the legacy path with hyphens', () => {
    const filenames = LEGACY_ASSETS.map((asset) => mediaFilename(asset.path))

    expect(new Set(filenames).size).toBe(LEGACY_ASSETS.length)
    expect(mediaFilename('citizens/hero.webp')).toBe('citizens-hero.webp')
  })

  it('each say what they show', () => {
    expect(LEGACY_ASSETS.filter((asset) => asset.alt.trim() === '')).toEqual([])
  })
})

describe('the manifest', () => {
  it('reads the legacy address against the document it became', () => {
    expect(
      manifestTsv([
        {
          path: 'home_page/footer.jpg',
          filename: 'home_page-footer.jpg',
          action: 'created',
          id: 7,
        },
      ]),
    ).toBe(
      'legacy path\tmedia filename\tmedia id\n/images/home_page/footer.jpg\thome_page-footer.jpg\t7',
    )
  })
})
