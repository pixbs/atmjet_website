import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The two sections the business agents page opens with (issue #131,
 * `docs/legacy-inventory.md` section 4): what working with the company gives an agent, and the
 * documents to take away.
 *
 * The legacy chose between two hard-coded PDF addresses by comparing the locale; the file is a
 * Media document here and the field is localized, so each language points at its own.
 */
const GUIDE = '[data-section="guide"]'
const DOCUMENTS = '[data-section="documents"]'

test.describe('the guide', () => {
  test('is in the HTML the server sends, heading and points', async ({ request }) => {
    const html = await (await request.get(pathFor('/business_agents', 'en'))).text()

    expect(html).toContain('data-section="guide"')
    expect(html).toContain('Personal assistant guides')
    expect(html).toContain('we understand the challenges personal assistants face')
  })

  test('is the heading of the page it opens', async ({ page }) => {
    await page.goto(pathFor('/business_agents', 'en'))

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('For personal assistants')
  })

  test('rules off one point from the next, and not the first', async ({ page }) => {
    await page.goto(pathFor('/business_agents', 'en'))

    // Two points on this page, so one rule between them.
    await expect(page.locator(`${GUIDE} hr`)).toHaveCount(1)
  })
})

test.describe('the documents', () => {
  test('offer every file the block carries', async ({ page }) => {
    await page.goto(pathFor('/business_agents', 'en'))

    await expect(page.locator(DOCUMENTS).getByRole('link')).toHaveCount(2)
  })

  test('open a file that answers, in a tab of its own', async ({ page, request }) => {
    await page.goto(pathFor('/business_agents', 'en'))
    const download = page.locator(DOCUMENTS).getByRole('link', { name: 'Open guide' }).first()

    await expect(download).toHaveAttribute('target', '_blank')
    const href = await download.getAttribute('href')

    expect((await request.get(href ?? '')).status()).toBe(200)
  })

  test('speak the language of the page they are on', async ({ request }) => {
    const html = await (await request.get(pathFor('/business_agents', 'ru'))).text()

    expect(html).toContain('Скачать чек-лист')
    expect(html).not.toContain('Open guide')
  })
})
