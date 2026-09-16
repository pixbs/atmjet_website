'use client'

import type { FormEvent, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from '@/i18n/navigation'
import { listingSearch, parseListing, type ListingContract, type SearchParams } from '@/lib/listing'
import { localeSwitchHref } from '@/lib/urls'

/**
 * The card a listing is narrowed with (issue #139, `docs/legacy-inventory.md` section 4): the
 * selects a page passes in, and the button that applies them.
 *
 * A form rather than a set of controls that navigate on change, because that is what the legacy
 * yachts page drew and because a browser with no JavaScript submits it to the same path. What
 * the enhancement adds is the canonical URL: the form would otherwise carry every default it
 * holds, and a listing would have as many addresses as there are ways of arriving at it.
 */
export interface ListingFiltersProps {
  title: string
  apply: string
  /** The listing's own defaults, so what a visitor left alone is left out of the URL. */
  contract: ListingContract<string>
  /** The selects, rendered by the page that knows what can be chosen (ADR-0007). */
  children: ReactNode
}

export function ListingFilters({ title, apply, contract, children }: ListingFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const entries = new FormData(event.currentTarget).entries()
    const asked = Object.fromEntries(entries) as SearchParams
    // Back to the top of the listing: what was read was read in the order being left behind.
    const query = { ...parseListing(asked, contract), page: 1 }

    router.push(localeSwitchHref(pathname, listingSearch(query, contract)), { scroll: false })
  }

  return (
    <section data-section="listing-filters">
      <div className="container">
        <form
          // `flex flex-col` in full: the parity base layer lays out a `div` that way and a
          // `<form>` is not one, so the gap and the button's place depend on saying it here.
          className="flex flex-col gap-6 rounded-3xl border border-graphite-800 bg-graphite-950 p-6 md:p-10"
          method="get"
          onSubmit={submit}
        >
          <h3>{title}</h3>
          <div className="grid gap-0.5 overflow-hidden rounded-2xl md:grid-cols-3 md:gap-4 md:rounded-none">
            {children}
          </div>
          <Button className="px-24! md:self-end" size="big" type="submit">
            {apply}
          </Button>
        </form>
      </div>
    </section>
  )
}
