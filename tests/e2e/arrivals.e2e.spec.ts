import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * How the sections of the home page arrive as they scroll into view (`docs/legacy-inventory.md`
 * section 13, entry 101): the browser holds back only what is still below the screen, brings it
 * in once it is seen, and leaves it exactly where the page is drawn without any motion.
 */
const HOME = pathFor('/', 'en')
const SECTIONS = [
  'make-booking',
  'why-us',
  'empty-legs',
  'key-features',
  'options-tiles',
  'privilege',
  'yachts-promo',
  'tiles',
  'transfer',
  'faq',
  'footer',
]

/**
 * Every box in the sections that can be seen across, as it rests on the page. The words a heading
 * is split into while it rises are left out, and so is anything a frame clips out of sight beside
 * it, such as the slides a carousel keeps past its edge, which arrive only when it brings them in.
 */
function boxesOf(page: Page) {
  return page.evaluate(
    (sections) =>
      sections.flatMap((name) => {
        const section = document.querySelector(`[data-section="${name}"]`)!
        // How much of a box's width is left once every clipping frame around it has cut it.
        const seenAcross = (element: Element, box: DOMRect) => {
          let [left, right] = [Math.max(box.left, 0), Math.min(box.right, window.innerWidth)]
          for (let frame = element.parentElement; frame; frame = frame.parentElement) {
            if (getComputedStyle(frame).overflowX === 'visible') continue
            const edges = frame.getBoundingClientRect()
            ;[left, right] = [Math.max(left, edges.left), Math.min(right, edges.right)]
          }

          return right - left
        }

        return (
          [section, ...section.querySelectorAll('*')]
            .filter((element) => element.tagName !== 'SPAN')
            .map((element) => ({ element, box: element.getBoundingClientRect() }))
            // A whole pixel at least: a slide waiting on a frame's edge can leave a fraction of one.
            .filter(({ element, box }) => seenAcross(element, box) >= 1)
            .map(({ box }) =>
              [box.x, box.y + window.scrollY, box.width, box.height].map(Math.round),
            )
        )
      }),
    SECTIONS,
  )
}

/** How many things in the sections are faded, moved or clipped, the counters' figures aside. */
function held(page: Page) {
  return page.evaluate(
    (sections) =>
      sections
        .flatMap((name) => [...document.querySelectorAll(`[data-section="${name}"] *:not(span)`)])
        .filter((element) => {
          const style = getComputedStyle(element)
          const moved = style.transform !== 'none' && style.transform !== 'matrix(1, 0, 0, 1, 0, 0)'

          return moved || style.clipPath !== 'none' || style.opacity === '0'
        }).length,
    SECTIONS,
  )
}

/** Down through the sections a screen at a time, so each of them is seen, then back to the top. */
async function scrollThrough(page: Page) {
  const end = await page
    .locator(`[data-section="${SECTIONS.at(-1)}"]`)
    .evaluate((section) => section.getBoundingClientRect().bottom + window.scrollY)

  for (let top = 0; top < end; top += 300) {
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(250)
  }
  // The last arrival has finished: the longest takes under two seconds.
  await page.waitForTimeout(2_500)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
}

test.describe('the sections of the home page', () => {
  test('are drawn at rest for a visitor who asks for less motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(HOME)

    expect(await held(page)).toBe(0)
  })

  test('hold back what is below the screen and bring it in as it is seen', async ({ page }) => {
    await page.goto(HOME)
    await expect(page.getByTestId('preloader-backdrop')).toHaveCount(0, { timeout: 20_000 })
    const card = page.locator('[data-cards="why-us"] > div').first()
    const opacityOf = () => card.evaluate((element) => getComputedStyle(element).opacity)

    expect(await opacityOf()).toBe('0')

    await card.scrollIntoViewIfNeeded()
    await expect.poll(opacityOf).toBe('1')
  })

  test('come to rest exactly where they are drawn without motion', async ({ page }) => {
    // The whole page is scrolled through twice, once without motion and once with it.
    test.slow()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(HOME)
    await scrollThrough(page)
    const drawn = await boxesOf(page)

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.reload()
    await expect(page.getByTestId('preloader-backdrop')).toHaveCount(0, { timeout: 20_000 })
    await scrollThrough(page)

    expect(await boxesOf(page)).toEqual(drawn)
  })

  test('bring a slide in when the carousel does', async ({ page }) => {
    await page.goto(HOME)
    await expect(page.getByTestId('preloader-backdrop')).toHaveCount(0, { timeout: 20_000 })
    const section = page.locator('[data-section="key-features"]')
    await section.scrollIntoViewIfNeeded()
    const photos = section.locator('[class*="aspect-portrait"] img')
    // The first photograph past the right edge of the carousel's frame, touching it or beyond:
    // the next arrow brings it in.
    const index = await photos.evaluateAll((images) => {
      const slides = images.map((image) => image.closest('[class*="aspect-portrait"]')!)
      let frame = slides[0]!.parentElement
      while (frame && getComputedStyle(frame).overflowX === 'visible') frame = frame.parentElement
      const edge = frame!.getBoundingClientRect().right

      // The slide's own box: a photograph waiting to arrive is drawn larger than its slide.
      return slides.findIndex((slide) => slide.getBoundingClientRect().left >= edge - 1)
    })
    const photo = photos.nth(index)
    const clipOf = () => photo.evaluate((element) => getComputedStyle(element).clipPath)

    await expect.poll(clipOf).not.toBe('none')

    await section.getByRole('button', { name: 'Next' }).click()
    await expect.poll(clipOf, { timeout: 10_000 }).toBe('none')
  })
})
