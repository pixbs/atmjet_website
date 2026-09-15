'use client'

import { useCallback, useRef, useState } from 'react'

import { Autocomplete, type AutocompleteProps } from '@/components/ui/autocomplete'
import type { Locale } from '@/i18n/locales'

/**
 * The airport field: the autocomplete of issue #107 with the search of issue #159 behind it.
 *
 * The component holds only what the field needs to be a field — what has been offered — and the
 * ranking, the matching and the wording of an option are the endpoint's (`src/lib/data`), where
 * the legacy site did all three in the browser's own request to the database.
 *
 * A slow answer to an earlier term cannot overwrite a later one: the legacy field showed
 * whichever response arrived last, so typing quickly could leave the list showing another term's
 * airports.
 */
export interface AirportSearchProps extends Omit<AutocompleteProps, 'onSearch' | 'options'> {
  /** The language an airport is named in; the endpoint ranks the same airports in every one. */
  locale: Locale
}

export function AirportSearch({ locale, ...props }: AirportSearchProps) {
  const [options, setOptions] = useState<readonly string[]>([])
  const latest = useRef('')

  const search = useCallback(
    async (term: string) => {
      latest.current = term

      try {
        const query = new URLSearchParams({ q: term, locale })
        const response = await fetch(`/api/airports/search?${query}`)
        if (!response.ok) throw new Error(`the search answered ${response.status}`)

        const { options: found } = (await response.json()) as { options?: string[] }
        if (latest.current === term) setOptions(found ?? [])
      } catch (error) {
        console.warn(
          '[airports] the search could not be reached, so the field offers nothing.',
          error,
        )
        if (latest.current === term) setOptions([])
      }
    },
    [locale],
  )

  return <Autocomplete {...props} onSearch={search} options={options} />
}
