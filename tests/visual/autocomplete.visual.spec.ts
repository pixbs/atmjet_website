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

  // The section goes to the top of the screen, so the list has the room below it that it hangs
  // into; the scroll is `instant` because the stylesheet scrolls smoothly (the legacy
  // `scroll-smooth`) and a capture would otherwise catch the page still moving.
  await section.evaluate((node) => node.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await section.getByRole('combobox', { name: 'From' }).fill('dub')
  const list = section.getByRole('listbox')
  await expect(list).toBeVisible()

  // Clipped to the field and what hangs under it, rather than the whole screen: what follows
  // the section on the page is another section's baseline, not this one's.
  const field = (await section.boundingBox())!
  const open = (await list.boundingBox())!
  const width = page.viewportSize()?.width ?? field.width

  await expect(page).toHaveScreenshot('autocomplete-open.png', {
    clip: {
      x: 0,
      y: field.y,
      width,
      height: Math.max(field.y + field.height, open.y + open.height) - field.y,
    },
  })
})
