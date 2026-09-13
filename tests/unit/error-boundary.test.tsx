import { NextIntlClientProvider } from 'next-intl'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import ErrorBoundary from '@/app/(frontend)/[locale]/error'
import messages from '@/messages/en.json'

/**
 * The error boundary of the public site (issue #56). The legacy site had none, so a page that
 * threw — the yachts listing did, on an empty table — showed Next's default error page
 * (`docs/legacy-inventory.md` sections 2.5 and 4.13).
 *
 * It is a client component, so what is worth pinning is that it reads the catalogue rather than
 * carrying its own English: the provider the locale layout mounts is what it renders inside.
 */
function render() {
  return renderToStaticMarkup(
    // A time zone keeps next-intl from warning about environment differences it cannot see here.
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      <ErrorBoundary error={new Error('boom')} reset={() => undefined} />
    </NextIntlClientProvider>,
  )
}

describe('the error boundary', () => {
  it('says what happened in the language of the page', () => {
    const markup = render()

    expect(markup).toContain(messages.errors.unexpected.title)
    expect(markup).toContain(messages.errors.unexpected.description)
  })

  it('offers a retry, because most of these errors are transient', () => {
    expect(render()).toContain(messages.errors.unexpected.retry)
  })

  it('does not leak what the error said to the visitor', () => {
    // The message can carry a query, a path or a stack; it goes to the log, not to the page.
    expect(render()).not.toContain('boom')
  })
})
