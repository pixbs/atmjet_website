import { expect, test, type Page } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader } from './chrome'

/**
 * The phone field as the legacy booking form drew it (issue #108,
 * `docs/legacy-inventory.md` section 7.2): the flag and the chevron over the left of a ruled
 * field, and the searchable country list under it.
 */
const SECTION = '[data-section="phone"]'

/** Room for the field and the panel hung under it, which reaches past the end of the section. */
const OPEN_HEIGHT = 520

/**
 * Scrolls the section as near the top as the page allows and answers where it came to rest.
 * `instant` because the parity layer carries the legacy `scroll-smooth` and a capture would
 * otherwise catch the page still moving.
 */
async function scrollToField(page: Page) {
  await page.locator(SECTION).evaluate((section) =>
    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - 40,
      behavior: 'instant',
    }),
  )

  const box = await page.locator(SECTION).boundingBox()
  expect(box).not.toBeNull()
  return box!
}

test('the phone field matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  await expect(section).toHaveScreenshot('phone-input.png')
})

test('the open country list matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator(SECTION)
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  // The list hangs outside the section it belongs to, so this is a clip of the screen; it is
  // taken from the section's own corner, so that what is captured cannot move when a section
  // above it changes (issue #279).
  const box = await scrollToField(page)
  await section.getByRole('button').click()
  await expect(section.getByRole('listbox')).toBeVisible()

  expect(box.y + OPEN_HEIGHT).toBeLessThanOrEqual(page.viewportSize()!.height)
  await expect(page).toHaveScreenshot('phone-input-open.png', {
    clip: { x: box.x, y: box.y, width: box.width, height: OPEN_HEIGHT },
  })
})
