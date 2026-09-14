import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The home page hero as a block (issue #111, `docs/legacy-inventory.md` section 5): the words
 * come from the document and are in the markup the server sends, and the film behind them plays
 * itself, silently and for as long as the page is open, which is all the legacy section did.
 */
const SECTION = '[data-section="hero-video"]'

test.describe('the video hero', () => {
  test('is in the HTML the server sends, words and film alike', async ({ request }) => {
    const html = await (await request.get(pathFor('/group_charters', 'en'))).text()

    expect(html).toContain('data-section="hero-video"')
    expect(html).toContain('Flying private made simple')
    expect(html).toContain('/video/background_full.mp4')
  })

  test('plays itself, silently and without end', async ({ page }) => {
    await page.goto(pathFor('/group_charters', 'en'))
    const film = page.locator(`${SECTION} video`)

    await expect(film).toHaveJSProperty('autoplay', true)
    await expect(film).toHaveJSProperty('muted', true)
    await expect(film).toHaveJSProperty('loop', true)
    // Without this a telephone takes the film full screen the moment it starts.
    await expect(film).toHaveJSProperty('playsInline', true)
  })

  test('holds a picture on the screen until the film has something to show', async ({ page }) => {
    await page.goto(pathFor('/group_charters', 'en'))

    // The upload an editor chose, where the legacy opened on a black screen (section 13).
    await expect(page.locator(`${SECTION} video`)).toHaveAttribute('poster', /\/api\/media\/file\//)
  })

  test('offers a narrow screen the film cut for it, first', async ({ page }) => {
    await page.goto(pathFor('/group_charters', 'en'))
    const sources = page.locator(`${SECTION} video source`)

    // The legacy defined this second film and then played the wide one everywhere (section 13).
    await expect(sources).toHaveCount(2)
    await expect(sources.first()).toHaveAttribute('media', '(max-width: 767px)')
    await expect(sources.last()).toHaveAttribute('src', '/video/background_full.mp4')
  })

  test('leaves the reading of the screen to the heading', async ({ page }) => {
    await page.goto(pathFor('/group_charters', 'en'))

    // The film says nothing the heading does not, and the legacy `<track>` pointed at a file
    // that was never there (section 13, entry 14), so it is kept out of the reading altogether.
    await expect(page.locator(`${SECTION} video`)).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator(SECTION).getByRole('heading', { level: 1 })).toHaveText(
      'Flying private made simple',
    )
  })

  test('speaks the language of the page it opens', async ({ request }) => {
    const html = await (await request.get(pathFor('/group_charters', 'ru'))).text()

    expect(html).toContain('Частные перелёты — это просто')
    expect(html).not.toContain('Flying private made simple')
  })
})
