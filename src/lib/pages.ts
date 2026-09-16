import type { Locale } from '@/i18n/locales'

/**
 * Which languages a page is served in (issue #149, `docs/legacy-inventory.md` section 4).
 *
 * The legacy citizens page was Russian only, and said so by redirecting every other locale to
 * the site root from inside the component (`citizens/page.tsx:26-28`, section 13 entry 78,
 * `keep`). That is a property of the page rather than of the file that renders it, so it is a
 * field an editor sets; a page that names none is served in every language the site serves,
 * which is what every other page does.
 */
export function servedLocales(
  available: readonly string[] | null | undefined,
  enabled: readonly Locale[],
): Locale[] {
  const named = (available ?? []).filter((locale): locale is Locale =>
    enabled.includes(locale as Locale),
  )

  // In the order the site serves them, so the first is still the canonical one.
  return named.length === 0 ? [...enabled] : enabled.filter((locale) => named.includes(locale))
}
