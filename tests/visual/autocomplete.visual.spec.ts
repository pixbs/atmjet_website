import { expect, test } from '@playwright/test'

import { pathFor } from '../e2e/routes'
import { hideFloatingHeader } from './chrome'

/**
 * The airport field with its list open (issue #107, `docs/legacy-inventory.md` section 6): the
 * white panel with the label inside it and the list hung under it.
 *
 * A capture of the screen rather than of the section, because the list hangs outside the box it
 * belongs to and an element clip would cut it off.
 */
test('the open airport list matches its baseline', async ({ page }) => {
  await page.goto(pathFor('/styleguide', 'en'))
  const section = page.locator('[data-section="autocomplete"]')
  await expect(section).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await hideFloatingHeader(page)

  // The section is the last on the page, so the end of the page is as high as it comes; the
  // scroll is `instant` because the stylesheet scrolls smoothly (the legacy `scroll-smooth`)
  // and a capture would otherwise catch the page still moving.
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
  )
  await section.getByRole('combobox', { name: 'From' }).fill('dub')
  await expect(section.getByRole('listbox')).toBeVisible()
  // The open list hangs below the end of the page, so the page is asked for its end again.
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
  )

  await expect(page).toHaveScreenshot('autocomplete-open.png')
})
