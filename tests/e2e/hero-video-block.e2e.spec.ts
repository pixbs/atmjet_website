import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The home page hero (issue #111, `docs/legacy-inventory.md` section 5): the video that plays
 * itself behind the wordmark, and the darkening that makes the words readable on it.
 */
const SECTION = '[data-section="hero-video"]'

test.describe('the hero video', () => {
  test('is in the HTML the server sends, words and video alike', async ({ request }) => {
    const html = await (await request.get(pathFor('/', 'en'))).text()

    expect(html).toContain('data-section="hero-video"')
    expect(html).toContain('ATM JET')
    expect(html).toContain('Flying private made simple')
    expect(html).toContain('/video/background_full.mp4')
  })

  test('plays itself, quietly, without taking over the screen', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const video = page.locator(`${SECTION} video`)

    // What lets a video play without being asked, on a telephone included.
    await expect(video).toHaveJSProperty('autoplay', true)
    await expect(video).toHaveJSProperty('muted', true)
    await expect(video).toHaveJSProperty('loop', true)
    await expect(video).toHaveJSProperty('playsInline', true)
  })

  test('leaves the reading of the screen to the heading', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))

    // The video says nothing the heading does not, and the legacy `<track>` it would have been
    // read from pointed at a file that was never there (section 13, entry 14).
    await expect(page.locator(`${SECTION} video`)).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator(`${SECTION} track`)).toHaveCount(0)
    await expect(page.locator(SECTION).getByRole('heading', { level: 1 })).toHaveText(
      'Flying private made simple',
    )
  })

  test('plays the one video the legacy played, where it named a second and never used it', async ({
    page,
  }) => {
    await page.goto(pathFor('/', 'en'))
    const sources = page.locator(`${SECTION} video source`)

    // `videoSrcMobile` was declared and never reached the markup (section 13, entry 13); the
    // field is there for an editor, and a page that leaves it empty draws what the legacy drew.
    await expect(sources).toHaveCount(1)
    await expect(sources).toHaveAttribute('src', '/video/background_full.mp4')
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/', 'ru'))).text()

    expect(html).toContain('Частные перелёты — это просто')
    expect(html).not.toContain('Flying private made simple')
  })
})
