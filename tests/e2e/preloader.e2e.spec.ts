import { expect, test } from '@playwright/test'

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
    await expect(page.locator('svg').first().locator('..')).toHaveCSS('z-index', '999')
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
