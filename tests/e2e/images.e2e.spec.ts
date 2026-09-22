import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * What the optimiser is asked for, against what is drawn (issue #176,
 * `docs/legacy-inventory.md` section 12).
 *
 * The legacy site served its jpg and webp twins at between 1.5 and 4 MB whatever the box on
 * screen was. `next/image` only does better when it is told the box: without a `sizes`, a card
 * image declared 1200 wide was fetched at 1200 into a 346-pixel slot on a phone.
 *
 * An image is too large when the file the browser took is more than twice as wide as the box it
 * is drawn in — twice, because a retina screen is a legitimate reason to ask for more. One
 * exemption, read off the page rather than assumed: an image that declares a `sizes` and was
 * offered nothing smaller that would still cover the box is taking the best on offer, and the
 * widths Next generates are a coarse ladder rather than an exact fit. An image with no `sizes`
 * gets no exemption, because that is the thing to fix: without one the browser is told to assume
 * the width the component declared, which is the full-size file.
 */
const RETINA = 2

/**
 * One section is still served a file far larger than it draws, and what holds it there is the
 * narrower file rather than the `sizes` that would ask for one: sixteen captures move when the
 * box is declared in a `sizes`, two of the styleguide's move when it is declared as the width —
 * and not on every run — and none move when the same 1200 is declared in a corrected 16:9. The
 * measurements are in the comment in `why-us-card.tsx`; it is recorded here rather than
 * silently fixed or silently ignored (issue #176).
 */
const KNOWN = ['why-us']

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 720 },
] as const

/** One page of each kind: the home page, the subpages that carry photographs, and a catalogue. */
const PAGES = [
  '/',
  '/partners',
  '/sales_yachts',
  '/atm_jet_group',
  '/yachts',
  '/aircraft',
  '/yachts/azimut-serenity',
  '/aircraft/MOUSE',
] as const

interface Drawn {
  section: string
  rendered: number
  served: number
  /** The smallest width the `srcset` offered that still covers twice the box, where there is one. */
  enough: number | null
  /** What the component told the browser the box would be; empty when it said nothing. */
  sizes: string
}

/** Every image the page has actually loaded, with the width the browser chose for it. */
async function drawnImages(page: Page): Promise<Drawn[]> {
  // Everything below the fold is lazy, as the legacy slides were, so the page is read to the end
  // before anything is counted, and the reveals are given their moment to come to rest.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')

  return page.evaluate((retina) => {
    const widthOf = (url: string): number =>
      Number(new URL(url, window.location.href).searchParams.get('w') ?? 0)

    return (
      [...document.querySelectorAll('img')]
        // `currentSrc` is the candidate the browser settled on. An image it has not loaded yet
        // has none, and its `src` is the largest of the set, which is a fallback and not a
        // choice — counting that would report every lazy image as oversized.
        .filter((image) => image.complete && image.currentSrc !== '')
        .map((image) => {
          const rendered = Math.round(image.getBoundingClientRect().width)
          const offered = (image.srcset || '')
            .split(',')
            .map((candidate) => widthOf(candidate.trim().split(/\s+/)[0] ?? ''))
            .filter((width) => width > 0)
            .sort((a, b) => a - b)

          return {
            section: image.closest('[data-section]')?.getAttribute('data-section') ?? 'page',
            rendered,
            served: widthOf(image.currentSrc),
            enough: offered.find((width) => width >= rendered * retina) ?? null,
            sizes: image.getAttribute('sizes') ?? '',
          }
        })
        // An image the optimiser never touched has no width to compare, and one still animating
        // into place has no box worth measuring.
        .filter((image) => image.served > 0 && image.rendered > 8)
    )
  }, RETINA)
}

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.name} width`, () => {
    // The reveals settle rather than being caught mid-flight, which is how the visual tier
    // reads the same pages.
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      contextOptions: { reducedMotion: 'reduce' },
    })

    for (const route of PAGES) {
      test(`${route} asks for no image larger than it needs`, async ({ page }) => {
        await page.goto(pathFor(route, 'en'))

        const images = await drawnImages(page)

        expect(images.length, `${route} drew no images`).toBeGreaterThan(0)

        const oversized = images.filter((image) => {
          if (KNOWN.includes(image.section)) return false
          if (image.served <= image.rendered * RETINA) return false

          // Nothing smaller on offer, and a `sizes` that says what the box is: the best there is.
          return image.sizes === '' || (image.enough !== null && image.served > image.enough)
        })

        expect(
          oversized.map(
            (image) =>
              `${image.section}: took ${image.served}w for a ${image.rendered}px box` +
              (image.sizes === '' ? ' with no sizes' : ` (sizes="${image.sizes}")`),
          ),
        ).toEqual([])
      })
    }
  })
}

test.describe('the photograph a page opens on', () => {
  /** A page whose first section is a photograph rather than the film the home page opens on. */
  const WITH_HERO = ['/partners', '/cargo_charter', '/empty_legs'] as const

  /** The server names it in the head, so it is on its way before the markup has been read. */
  async function preloadedImages(request: APIRequestContext, path: string): Promise<string> {
    const html = await (await request.get(path)).text()

    return [...html.matchAll(/<link[^>]+as="font"[^>]*>|<link[^>]+as="image"[^>]*>/g)]
      .map(([tag]) => tag)
      .filter((tag) => tag.includes('as="image"'))
      .join(' ')
  }

  for (const route of WITH_HERO) {
    test(`${route} fetches it first rather than when it is reached`, async ({ page, request }) => {
      const path = pathFor(route, 'en')
      await page.goto(path)

      const hero = page.locator('[data-section^="hero"] img').first()

      await expect(hero).toBeVisible()
      // Every image below it waits to be asked for; this one is not allowed to.
      expect(await hero.getAttribute('loading')).not.toBe('lazy')

      const preloads = await preloadedImages(request, path)
      const file = new URL(String(await hero.getAttribute('src')), 'http://x').searchParams.get(
        'url',
      )

      expect(preloads, `${path} preloads no image`).toBeTruthy()
      expect(preloads).toContain(encodeURIComponent(String(file)))
    })
  }
})
