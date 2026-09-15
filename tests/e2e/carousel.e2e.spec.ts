import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The carousel (issue #98, `docs/legacy-inventory.md` section 6): the slides move on the arrows,
 * on the dots and on the keyboard, and the controls say where they are.
 *
 * The legacy arrows were two unnamed buttons and the dots were unnamed too, so none of this
 * could be reached without a pointer.
 */
const STYLEGUIDE = pathFor('/styleguide', 'en')
const SECTION = '[data-section="carousel"]'

/** How many slides the fixture renders; the dots page them, so there are fewer of those. */
const SLIDE_COUNT = 5

test.describe('the carousel', () => {
  test('has its slides in the HTML the server sends', async ({ request }) => {
    // The slides are content; only the moving of them is client-side (ADR-0007).
    const html = await (await request.get(STYLEGUIDE)).text()

    expect(html).toContain('data-section="carousel"')
    expect(html).toContain('>Five<')
  })

  test('starts on the first slide, with nowhere back to go', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const section = page.locator(SECTION)

    await expect(section.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    await expect(section.getByRole('button', { name: 'Next slide' })).toBeEnabled()
    await expect(section.getByRole('tab', { name: '1' })).toHaveAttribute('aria-selected', 'true')
  })

  test('moves on the next arrow and comes back on the previous one', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const section = page.locator(SECTION)
    const next = section.getByRole('button', { name: 'Next slide' })

    await next.click()
    await expect(section.getByRole('tab', { name: '2' })).toHaveAttribute('aria-selected', 'true')

    await section.getByRole('button', { name: 'Previous slide' }).click()
    await expect(section.getByRole('tab', { name: '1' })).toHaveAttribute('aria-selected', 'true')
  })

  test('offers one dot per page of slides, not per slide', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const section = page.locator(SECTION)

    // Embla pages by what fits on screen and the legacy dots were drawn from the same list, so
    // five slides several at a time are fewer than five dots. They arrive when embla reports the
    // list, which is why the first one is awaited before they are counted.
    const dots = section.getByRole('tab')
    await expect(dots.first()).toBeVisible()

    const count = await dots.count()
    expect(count).toBeGreaterThan(1)
    expect(count).toBeLessThan(SLIDE_COUNT)
  })

  test('goes where a dot is pressed', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const section = page.locator(SECTION)
    const last = section.getByRole('tab').last()

    await last.click()

    await expect(last).toHaveAttribute('aria-selected', 'true')
    await expect(section.getByRole('tab', { name: '1' })).toHaveAttribute('aria-selected', 'false')
  })

  test('can be driven from the keyboard alone', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const section = page.locator(SECTION)

    // The arrow is disabled until embla has reported where it is, and the reading re-renders it;
    // waiting for it to be enabled is waiting for that, so the press lands on a settled button.
    const next = section.getByRole('button', { name: 'Next slide' })
    await expect(next).toBeEnabled()

    await next.press('Enter')

    await expect(section.getByRole('tab', { name: '2' })).toHaveAttribute('aria-selected', 'true')
  })

  test('fills the progress bar as the slides move, and no further', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const section = page.locator(SECTION)
    const bar = section.locator('[aria-hidden="true"]').last()
    const width = async () => Number((await bar.getAttribute('style'))?.match(/[\d.]+/)?.[0] ?? -1)

    expect(await width()).toBe(0)

    const last = section.getByRole('tab').last()
    await last.click()
    await expect(last).toHaveAttribute('aria-selected', 'true')

    // The end of the track is the end of the bar: the legacy one could be dragged past it. The
    // bar is read until it has caught up, because the slides glide to the snap they were sent to
    // and the selection is reported when that starts rather than when it lands.
    await expect.poll(width).toBeGreaterThan(0)
    expect(await width()).toBeLessThanOrEqual(100)
  })
})
