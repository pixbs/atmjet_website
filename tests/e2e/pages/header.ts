import { expect, type Locator, type Page } from '@playwright/test'
import { pathFor, type Locale } from '../routes'

/**
 * Page object for the site chrome (issue #88): the bar every page is read under and the menu it
 * opens. Locators describe what a visitor sees, not the markup.
 */

/** The menu's own links. The language switcher brings a nav of its own (issue #90). */
const OWN_LINKS = 'nav a:not(nav nav a)'

export class HeaderPage {
  readonly bar: Locator
  readonly menu: Locator
  readonly toggle: Locator
  readonly logo: Locator

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.bar = page.locator('[data-section="header"]')
    this.menu = page.locator('[data-section="navbar"]')
    this.toggle = this.bar.getByRole('button')
    this.logo = this.bar.getByRole('link')
  }

  /** The chrome is on every page; the styleguide is the one that is there without a seed. */
  async goto(route = '/styleguide'): Promise<void> {
    await this.page.goto(pathFor(route, this.locale))
    await expect(this.bar).toBeVisible()
  }

  async open(): Promise<void> {
    await this.toggle.click()
    await expect(this.menu).toBeVisible()
  }

  /** Everything the menu links to, in the order it lists it. */
  links(): Locator {
    return this.menu.locator(OWN_LINKS)
  }

  /** The pages it lists: not the socials, which leave the site, nor the booking button. */
  pageLinks(): Locator {
    return this.menu.locator(`${OWN_LINKS}[href^="/"]:not([href*="showBooking"])`)
  }

  /** The booking button, which opens the dialog of E6.6 on the page the visitor is reading. */
  booking(): Locator {
    return this.menu.locator(`${OWN_LINKS}[href*="showBooking"]`)
  }
}
