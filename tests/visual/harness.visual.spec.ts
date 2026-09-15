import { expect, test } from '@playwright/test'
import { pathFor } from '../e2e/routes'
import { bundleAvailable } from './legacy/bundle'
import { compareImages, paintPixels } from './legacy/compare'
import { expectLegacyParity } from './legacy/expect'

/**
 * Self-check of the parity harness (issue #38): a real capture compared with itself passes,
 * a painted copy fails, and the legacy helper skips cleanly while the bundle is absent.
 */
test.describe('visual parity harness', () => {
  test('a page matches its own capture and rejects a painted copy', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    await page.evaluate(() => document.fonts.ready)
    const first = await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' })
    const second = await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' })

    const same = compareImages(second, first)
    expect(same.pass, same.reason).toBe(true)

    // A share of the page rather than a count of pixels: the home page grows as its sections
    // are ported, and a fixed count fell under the harness's own one-per-cent tolerance the
    // moment the footer landed (issue #89).
    const magenta = Math.ceil(same.width * same.height * 0.02)
    const painted = compareImages(paintPixels(first, magenta, [255, 0, 255, 255]), first)
    expect(painted.pass).toBe(false)
    expect(painted.reason).toContain('pixels differ')
    expect(painted.diff).toBeDefined()
  })

  test('the legacy helper skips while the bundle is absent', async ({ page }) => {
    test.skip(bundleAvailable(), 'the bundle is present; page specs cover the comparison')
    await page.goto(pathFor('/', 'en'))
    await expectLegacyParity(page, { id: 'home--en--desktop--default' })
  })
})
