import { expect, type Locator, type Page } from '@playwright/test'

/** What a clip of one component has to take care of before the shutter opens. */

/**
 * The header floats over the page, and a card taller than the viewport is captured from its top
 * down, so the bar would otherwise be painted across it. It is `fixed`, so nothing moves.
 */
export async function hideFloatingHeader(page: Page) {
  await page.addStyleTag({ content: '[data-section="header"] { display: none }' })
}

/** The pictures are uploads and load lazily, so a capture can otherwise be of empty boxes. */
export async function waitForPhotos(cards: Locator) {
  const photos = cards.locator('img')
  // A card may carry inline icons rather than photographs, and then there is nothing to wait for.
  if ((await photos.count()) === 0) return

  await expect(photos.first()).toBeVisible()
  for (const photo of await photos.all()) {
    await expect(photo).toHaveJSProperty('complete', true)
  }
}

/**
 * The dev server paints its own indicator over the bottom-left corner, and a section at the
 * foot of a page is captured with that corner in the clip. A preview deployment has no such
 * badge, so a baseline holding one could never match it.
 */
export async function hideDevOverlay(page: Page) {
  await page.addStyleTag({ content: 'nextjs-portal { display: none }' })
}

/**
 * A frame of the hero video is never the same twice, and the file it plays arrives with the
 * assets of E5.12 (issue #111). It is hidden rather than masked because it fills its section:
 * a mask over it would paint over the words drawn on top of it as well.
 */
export async function hideHeroVideo(page: Page) {
  await page.addStyleTag({ content: '[data-section="hero-video"] video { visibility: hidden }' })
}

/**
 * A whole page, ready to be captured: everything below the fold has been asked for, every
 * photograph has arrived, and every reveal is where it comes to rest.
 *
 * A reveal that re-runs (`whileInView` without `once`) puts its section back to `opacity: 0`
 * the moment it leaves the screen, and one that has never been reached has not started, so a
 * full-page capture would otherwise hold whichever sections happened to be on screen when the
 * shutter opened. What each reveal does has its own end-to-end test; a baseline is of where
 * they come to rest.
 *
 * Forced only inside `main`: the chrome above and below it animates on its own terms, and the
 * preloader's resting state is the one where it has gone.
 *
 * One thing a flattened capture cannot hold, whatever is forced: a gradient clipped to the
 * letters of a counter draws nothing past the first screen, because Chromium paints the region
 * below it without the background the viewport was carrying. The figures have baselines of
 * their own where the shot is of the screen rather than the page (`why-us-block`,
 * `why-us-card`); what this one is for is the order and the spacing of the sections.
 */
export async function settlePage(page: Page) {
  await page.evaluate(async () => {
    for (let top = 0; top <= document.body.scrollHeight; top += window.innerHeight / 2) {
      window.scrollTo({ top, behavior: 'instant' })
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })

  await waitForPhotos(page.locator('main'))
  await page.addStyleTag({
    content: 'main [style*="opacity"] { opacity: 1 !important; transform: none !important }',
  })
}
