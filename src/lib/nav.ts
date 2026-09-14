/**
 * Turning a navigation list an editor keeps in Payload into the links the chrome renders
 * (issue #88).
 *
 * The legacy navbar, footer and floating menu each hard-coded the same twelve hrefs
 * (`docs/legacy-inventory.md` sections 3.3 to 3.5), so a renamed page left three dead links
 * behind. Here a link names a page and the page's slug decides the URL, which means a row can
 * point at a page that no longer exists — the rule for that is this file, and it is the same
 * for every menu.
 */

/** A row of `navLinks()` (src/fields/nav.ts), as Payload returns it at depth 0 or 1. */
export interface NavRow {
  label: string
  page?: number | { id: number } | null
}

/** A link in the chrome: the wording an editor wrote, and the path it opens. */
export interface NavLink {
  label: string
  /** Without the locale prefix, which `Link` from `@/i18n/navigation` adds. `/` is the home page. */
  href: string
}

/** Where a page's slug sits in the site, without the locale that `Link` adds. */
export function hrefForSlug(slug: string): string {
  return slug === '' ? '/' : `/${slug}`
}

const idOf = (row: NavRow): number | undefined => {
  if (typeof row.page === 'number') return row.page
  return typeof row.page === 'object' && row.page !== null ? row.page.id : undefined
}

/** The pages a menu points at, in the order it lists them, without the rows that point nowhere. */
export function navPageIds(rows: readonly NavRow[] | null | undefined): number[] {
  return (rows ?? []).flatMap((row) => {
    const id = idOf(row)
    return id === undefined ? [] : [id]
  })
}

/**
 * The links a menu renders. A row whose page has been deleted, or is not one a visitor may
 * read, is dropped rather than rendered as a dead link: the empty field in the admin is what
 * says which menu needs attention (src/fields/nav.ts).
 */
export function navLinks(
  rows: readonly NavRow[] | null | undefined,
  slugs: ReadonlyMap<number, string>,
): NavLink[] {
  return (rows ?? []).flatMap((row) => {
    const id = idOf(row)
    const slug = id === undefined ? undefined : slugs.get(id)
    if (slug === undefined) return []

    return [{ label: row.label, href: hrefForSlug(slug) }]
  })
}
