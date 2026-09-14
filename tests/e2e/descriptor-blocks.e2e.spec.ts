import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The three descriptors (issue #133, `docs/legacy-inventory.md` section 4): the paragraph the
 * empty legs page puts under its hero, the line the yachts page frames in gold, and the heading
 * it closes on over a photograph. All three are words the legacy hard-coded into a page file.
 */
test.describe('the descriptors', () => {
  test('put the plain one on the page that explains itself', async ({ request }) => {
    const html = await (await request.get(pathFor('/empty_legs', 'en'))).text()

    expect(html).toContain('data-section="descriptor"')
    expect(html).toContain('What an empty leg is')
    expect(html).toContain('A flight that has to be made anyway')
  })

  test('frame the yachts line in gold, and draw nothing else in the frame', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))
    const framed = page.locator('[data-section="framed-descriptor"]')

    await expect(framed.getByRole('heading')).toHaveText('Every yacht we list, we have stood on')
    // The legacy frame held the heading and nothing else.
    await expect(framed.locator('p')).toHaveCount(0)
  })

  test('hang the photograph under the words it belongs to', async ({ page }) => {
    await page.goto(pathFor('/sales_yachts', 'en'))
    const section = page.locator('[data-section="photo-descriptor"]')
    const heading = section.getByRole('heading', { name: 'Twenty years on the water' })
    await expect(heading).toBeVisible()

    const words = await heading.boundingBox()
    const photo = await section.locator('img').boundingBox()
    expect(words).not.toBeNull()
    expect(photo).not.toBeNull()
    expect(photo!.y).toBeGreaterThan(words!.y)
  })

  test('speak the language of the page they are on', async ({ request }) => {
    const html = await (await request.get(pathFor('/empty_legs', 'ru'))).text()

    expect(html).toContain('Что такое пустой перелёт')
    expect(html).not.toContain('What an empty leg is')
  })
})
