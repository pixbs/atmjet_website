import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * How the fleet pages arrive as they scroll into view (`docs/legacy-inventory.md` section 13,
 * entry 101), as the home page does: the browser holds back only what is still below the screen,
 * brings it in once it is seen, and leaves it exactly where the page is drawn without any motion.
 *
 * `MOUSE` is photographed and `GATMB` is not, so between them they draw both aircraft layouts.
 */
const PAGES: Record<string, string[]> = {
  '/aircraft': ['aircraft-filter', 'aircraft-listing'],
  '/yachts': ['listing-filters', 'yachts-listing'],
  '/aircraft/MOUSE': ['aircraft-detail', 'aircraft-specs'],
  '/aircraft/GATMB': ['aircraft-basic', 'aircraft-context'],
  '/yachts/azimut-serenity': ['yacht-detail', 'yacht-specs'],
  '/sales_dept': ['catalogue-aircraft'],
  '/sales_yachts': ['recent-yachts'],
}

/**
 * Every box in the sections that shows, as it rests on the page. The words a heading is split
 * into while it rises are left out, and so is whatever a carousel holds outside its frame, which
 * arrives only when the carousel brings it in.
 */
function boxesOf(page: Page, sections: string[]) {
  return page.evaluate(
    (sections) =>
      sections.flatMap((name) => {
        const section = document.querySelector(`[data-section="${name}"]`)!
        /** Whether any of a box is inside the screen's width and every frame that clips it. */
        const shows = (element: Element, box: DOMRect) => {
          let [left, right] = [Math.max(box.left, 0), Math.min(box.right, window.innerWidth)]
          for (let frame = element.parentElement; frame; frame = frame.parentElement) {
            if (getComputedStyle(frame).overflowX === 'visible') continue
            const clip = frame.getBoundingClientRect()
            ;[left, right] = [Math.max(left, clip.left), Math.min(right, clip.right)]
          }

          return right - left > 1
        }

        return [section, ...section.querySelectorAll('*')]
          .filter((element) => element.tagName !== 'SPAN')
          .flatMap((element) => {
            const box = element.getBoundingClientRect()

            return shows(element, box)
              ? [[box.x, box.y + window.scrollY, box.width, box.height].map(Math.round)]
              : []
          })
      }),
    sections,
  )
}

/** How many things in the sections are faded, moved or clipped. */
function held(page: Page, sections: string[]) {
  return page.evaluate(
    (sections) =>
      sections
        .flatMap((name) => [...document.querySelectorAll(`[data-section="${name}"] *:not(span)`)])
        .filter((element) => {
          const style = getComputedStyle(element)
          const moved = style.transform !== 'none' && style.transform !== 'matrix(1, 0, 0, 1, 0, 0)'

          return moved || style.clipPath !== 'none' || style.opacity === '0'
        }).length,
    sections,
  )
}

/** Down through the sections a screen at a time, so each of them is seen, then back to the top. */
async function scrollThrough(page: Page, sections: string[]) {
  const end = await page
    .locator(`[data-section="${sections.at(-1)}"]`)
    .evaluate((section) => section.getBoundingClientRect().bottom + window.scrollY)

  for (let top = 0; top < end; top += 300) {
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(250)
  }
  // The last arrival has finished: the longest takes under two seconds.
  await page.waitForTimeout(2_500)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  // And the rules on screen, which draw themselves again each time they come back, have drawn.
  await page.waitForTimeout(1_500)
}

test.describe('the fleet pages', () => {
  for (const [route, sections] of Object.entries(PAGES)) {
    test(`draw ${route} at rest for a visitor who asks for less motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(pathFor(route, 'en'))
      // Running, so whatever is below the screen would have been held back by now.
      await page.waitForLoadState('networkidle')

      expect(await held(page, sections)).toBe(0)
    })

    test(`bring ${route} to rest exactly where it is drawn without motion`, async ({ page }) => {
      // The page is scrolled through twice, once without motion and once with it.
      test.slow()
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(pathFor(route, 'en'))
      await scrollThrough(page, sections)
      const drawn = await boxesOf(page, sections)

      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.reload()
      await scrollThrough(page, sections)

      expect(await boxesOf(page, sections)).toEqual(drawn)
    })
  }

  test('hold back the cards below the screen and bring them in as they are seen', async ({
    page,
  }) => {
    await page.goto(pathFor('/aircraft', 'en'))
    const card = page.locator('[data-section="aircraft-listing"] a').first().locator('..')
    const opacityOf = () => card.evaluate((element) => getComputedStyle(element).opacity)

    // The server sends it at rest; the page holds it back once it is running.
    await expect.poll(opacityOf).toBe('0')

    await card.scrollIntoViewIfNeeded()
    await expect.poll(opacityOf).toBe('1')
  })

  test('hold back the figures of a detail page until they are seen', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))
    const figure = page.locator('[data-section="aircraft-specs"] h3').first().locator('../..')
    const opacityOf = () => figure.evaluate((element) => getComputedStyle(element).opacity)

    await expect.poll(opacityOf).toBe('0')

    await figure.scrollIntoViewIfNeeded()
    await expect.poll(opacityOf).toBe('1')
  })

  test('bring in a line at the foot of a card that clips it', async ({ page }) => {
    // On this page and at this width the first key feature's words fit one line, flush with the
    // foot of the card: held any lower, the line would be outside the card and never seen.
    await page.setViewportSize({ width: 667, height: 375 })
    await page.goto(pathFor('/sales_yachts', 'en'))
    const words = page.locator('[data-section="key-features"] [class*="aspect-portrait"] > p')
    const opacityOf = () => words.first().evaluate((line) => getComputedStyle(line).opacity)
    await expect.poll(opacityOf).toBe('0')

    // Scrolled to as a visitor does, until the line is well inside the screen.
    await expect(async () => {
      await page.mouse.wheel(0, 50)
      expect((await words.first().boundingBox())!.y).toBeLessThan(250)
    }).toPass()

    await expect.poll(opacityOf).toBe('1')
  })

  test('bring a yacht in when the carousel does', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))
    const section = page.locator('[data-section="recent-yachts"]')
    const cards = section.locator('.min-w-80').locator('..')
    // Held while still below the screen, once the page is running; what is on screen by then
    // is left at rest.
    await expect
      .poll(() => cards.first().evaluate((card) => getComputedStyle(card).opacity))
      .toBe('0')
    await section.scrollIntoViewIfNeeded()
    // The first yacht past the right edge of the frame, which the next arrow brings in.
    const index = await cards.evaluateAll((all) =>
      all.findIndex(
        (card) =>
          card.getBoundingClientRect().left >=
          card.closest('.overflow-clip')!.getBoundingClientRect().right - 1,
      ),
    )
    const opacityOf = () => cards.nth(index).evaluate((card) => getComputedStyle(card).opacity)

    expect(index).toBeGreaterThan(0)
    await expect.poll(opacityOf).toBe('0')

    await section.getByRole('button', { name: 'Next yacht' }).click()
    await expect.poll(opacityOf, { timeout: 10_000 }).toBe('1')
  })
})
