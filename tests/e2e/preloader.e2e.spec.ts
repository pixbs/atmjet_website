import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The preloader (issue #92, `docs/legacy-inventory.md` section 3.8). The point of it is that it
 * is a curtain and not a loading screen: the page is already there behind it, which is what the
 * server's HTML has to show and what a crawler and a screen reader read instead of it.
 */
const PRELOADER = pathFor('/styleguide/preloader', 'en')

test.describe('the preloader', () => {
  test('has the page behind it in the HTML the server sends', async ({ request }) => {
    const response = await request.get(PRELOADER)

    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('Behind the preloader')
  })

  test('covers the viewport', async ({ page }) => {
    await page.goto(PRELOADER)
    const backdrop = page.getByTestId('preloader-backdrop')
    const viewport = page.viewportSize()

    await expect(backdrop).toBeVisible()

    const box = await backdrop.boundingBox()
    expect(box?.width).toBe(viewport?.width)
    expect(box?.height).toBe(viewport?.height)
  })

  test('stacks the wordmark above its own backdrop, and both above the page', async ({ page }) => {
    await page.goto(PRELOADER)

    // The legacy layers were z-[998] and z-[999] (inventory section 10.3), which are tokens here.
    await expect(page.getByTestId('preloader-backdrop')).toHaveCSS('z-index', '998')
    await expect(page.getByTestId('preloader-logo')).toHaveCSS('z-index', '999')
  })

  test('is a curtain, not content: assistive technology reads the page instead', async ({
    page,
  }) => {
    await page.goto(PRELOADER)

    await expect(
      page.getByRole('heading', { level: 1, name: 'Behind the preloader' }),
    ).toBeVisible()
    await expect(page.locator('[aria-hidden="true"] svg')).toHaveCount(1)
  })
})

/**
 * The intro the curtain plays over the home page (section 13, entry 101): a window opens in it
 * onto the hero, which rises into place behind it. What it may not do is move anything for
 * good, so the hero it leaves is measured against the one drawn without any motion at all.
 */
const HOME = pathFor('/', 'en')
const HERO = '[data-section="hero-video"]'

/** The overline, the heading and the signature, as boxes on the screen. */
async function heroLines(page: Page) {
  const hero = page.locator(HERO)

  return Promise.all([
    hero.locator('p').first().boundingBox(),
    hero.getByRole('heading', { level: 1 }).boundingBox(),
    hero.locator('p').last().boundingBox(),
  ])
}

/** How many things in the hero are still moved, clipped or faded. */
function stillMoving(page: Page) {
  return page.locator(HERO).evaluate(
    (hero) =>
      [...hero.querySelectorAll('span, div')].filter((element) => {
        const style = getComputedStyle(element)
        const moved = style.transform !== 'none' && style.transform !== 'matrix(1, 0, 0, 1, 0, 0)'

        return moved || style.clipPath !== 'none' || style.opacity !== '1'
      }).length,
  )
}

test.describe('the intro on the home page', () => {
  test('opens onto the hero and leaves every line where it is drawn without motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(HOME)
    const drawn = await heroLines(page)

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.reload()
    await expect(page.getByTestId('preloader-backdrop')).toHaveCount(0, { timeout: 15_000 })
    await expect.poll(() => stillMoving(page), { timeout: 5_000 }).toBe(0)

    const rested = await heroLines(page)
    for (const [index, box] of rested.entries()) {
      expect(box?.x).toBeCloseTo(drawn[index]!.x, 0)
      expect(box?.y).toBeCloseTo(drawn[index]!.y, 0)
      expect(box?.width).toBeCloseTo(drawn[index]!.width, 0)
      expect(box?.height).toBeCloseTo(drawn[index]!.height, 0)
    }
    await expect(page.locator(HERO).getByRole('heading', { level: 1 })).toHaveText(
      'Flying private made simple',
    )
    // The chrome arrives after the hero and comes to rest in place too.
    for (const chrome of [
      '[data-section="header"] header',
      '[data-section="angle-bar"] .rounded-full',
    ])
      await expect(page.locator(chrome).first()).toHaveCSS('opacity', '1')
  })

  test('is never drawn for a visitor who asks for less motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(HOME)

    await expect(page.getByTestId('preloader-backdrop')).toBeHidden()
    await expect(page.getByTestId('preloader-logo')).toBeHidden()
    await expect(page.locator(HERO).getByRole('heading', { level: 1 })).toBeVisible()
  })
})
