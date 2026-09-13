'use client'

/**
 * The last resort: an error in the root layout itself, which replaces the whole document and
 * therefore has to bring its own `<html>` (Next.js `global-error` convention).
 *
 * Its copy is English only and its styling is inline. Everything the rest of the site relies on
 * for a translation — the locale layout, the message provider, the stylesheet — is above the
 * boundary and is exactly what may have failed, so this page depends on none of it.
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          alignItems: 'center',
          background: '#111314',
          color: '#f4f4f4',
          display: 'flex',
          fontFamily: 'system-ui, sans-serif',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <main>
          <h1>Something went wrong</h1>
          <p>{error.message || 'The site could not be loaded.'}</p>
          <button onClick={reset} type="button">
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
