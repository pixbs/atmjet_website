import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test'
import { pathFor, type Locale } from '../routes'

/** Page object for the parity fixture page (issue #48). */
export class StyleguidePage {
  readonly heading: Locator
  readonly cardHeading: Locator
  readonly middleButton: Locator
  readonly revealedCard: Locator
  readonly counter: Locator

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Heading one' })
    this.cardHeading = page.getByRole('heading', { level: 4, name: 'Card' })
    this.middleButton = page.getByRole('button', { name: 'Middle', exact: true })
    this.revealedCard = page
      .getByRole('heading', { level: 4, name: 'Revealed on scroll' })
      .locator('..')
    this.counter = page.getByText(/^[\d,]+\+$/)
  }

  get path(): string {
    return pathFor('/styleguide', this.locale)
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path)
  }

  /** The fixture page is server-rendered like every other page (ADR-0007). */
  async expectServerRendered(request: APIRequestContext, text: string): Promise<void> {
    const response = await request.get(this.path)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(text)
  }
}
