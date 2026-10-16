'use client'

import type { CountryCode } from 'libphonenumber-js'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/cn'
import type { Country } from '@/lib/countries'
import { countryName } from '@/lib/country-name'

/**
 * The phone field of the booking form (issue #108, `docs/legacy-inventory.md` section 7.2): a
 * number that formats itself as it is typed, with the country it belongs to shown beside it and
 * a searchable list to change it by hand.
 *
 * Everything it decides — the leading `+`, the grouping, which country a code belongs to, what
 * the search box matches — is in `src/lib/phone.ts`, where it can be read without a browser.
 *
 * Three things the legacy field could not do:
 *
 * - It opens where the visitor is. The legacy opened on `COUNTRIES[1]`, Åland Islands `+35818`,
 *   whose code its own matcher could never recognise (section 13); the caller passes what the
 *   request reported (issue #160).
 * - The longest dial code wins, so `+1268` is Antigua rather than the United States.
 * - The list says what it is and, as the arrow keys walk it, which row they are on; the legacy
 *   `ul` was unnamed, said neither, and could not be scrolled without a mouse.
 */

/** The panel under the field, and the rows in it. */
const PANEL =
  'absolute top-full left-0 z-10 mt-0.5 w-full overflow-hidden rounded-xl border border-graphite-100 bg-white shadow-dropdown'

const OPTION =
  'flex cursor-pointer items-center gap-4 px-4 py-3 text-graphite-800 first:rounded-t-xl last:rounded-b-xl hover:bg-graphite-100'

/** Fetched when the field is first reached, so libphonenumber and the flags load with it (#428). */
const loadTools = () =>
  Promise.all([
    import('@/lib/phone'),
    import('@/lib/countries'),
    import('country-flag-icons/react/3x2'),
  ]).then(([phone, { countries }, Flags]) => ({ ...phone, countries, Flags }))

type Tools = Awaited<ReturnType<typeof loadTools>>

export interface PhoneInputProps {
  id: string
  label: string
  locale: Locale
  /** Where the field opens, resolved from the request on the server (issue #160). */
  defaultCountry: CountryCode
  /** The flag of `defaultCountry`, drawn on the server (`CountryFlag`). */
  flag: ReactNode
  value?: string
  onChange?: (value: string) => void
  /** Told when the field is left, which is when a form built on it judges what is in it. */
  onBlur?: () => void
  /**
   * English-only on the legacy site, so the caller says them (E10.4). `countries` names the list
   * itself, which a screen reader announces when it opens and the legacy `ul` never had.
   */
  labels: { search: string; noResults: string; countries: string }
  /**
   * Drawn in red. Left out, the field says so itself once it has been left with a number that
   * is not one, which is when the legacy form showed its error (`touchedFields && errors`).
   */
  invalid?: boolean
  className?: string
}

export function PhoneInput({
  id,
  label,
  locale,
  defaultCountry,
  flag,
  value,
  onChange,
  onBlur,
  labels,
  invalid,
  className,
}: PhoneInputProps) {
  const listId = useId()
  const field = useRef<HTMLDivElement>(null)
  const [own, setOwn] = useState('')
  const [country, setCountry] = useState<CountryCode>(defaultCountry)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(0)
  const [isTouched, setIsTouched] = useState(false)
  const list = useRef<HTMLUListElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const isLoading = useRef(false)
  const [tools, setTools] = useState<Tools | null>(null)

  const number = value ?? own
  const all = useMemo(() => tools?.countries(locale) ?? [], [tools, locale])
  const shown = useMemo(
    () => (tools === null ? [] : all.filter((one) => tools.matchesSearch(one, search))),
    [all, search, tools],
  )
  const Flag = country === defaultCountry ? undefined : tools?.Flags[country]
  const isWrong =
    invalid ??
    (isTouched && number !== '' && number !== '+' && tools !== null && !tools.isValidPhone(number))
  const optionId = (index: number) => `${listId}-${index}`

  const put = (next: string) => {
    setOwn(next)
    onChange?.(next)
  }

  const type = (loaded: Tools, typed: string) => {
    const next = loaded.formatPhone(typed)
    put(next)
    setCountry(loaded.countryForNumber(next) ?? country)
  }

  const load = () => {
    if (isLoading.current) return
    isLoading.current = true
    loadTools().then(
      (loaded) => {
        setTools(loaded)
        // What was typed before they arrived is formatted as if they had been there all along.
        const typed = input.current?.value ?? ''
        if (typed !== '') type(loaded, typed)
      },
      () => {
        // Not fetched: the list stays shut and the next focus, press or pointer asks again.
        isLoading.current = false
        setIsOpen(false)
      },
    )
  }

  useEffect(() => {
    if (!isOpen) return

    // The legacy closed on a press outside, which is before a click would land on the field.
    const close = (event: MouseEvent) => {
      if (!field.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [isOpen])

  // The list is longer than the panel, so the row the arrows are on is scrolled to.
  useEffect(() => {
    list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, isOpen])

  const choose = (chosen: Country) => {
    if (tools === null) return
    setCountry(chosen.iso)
    put(tools.numberForCountry(number, chosen.dialCode))
    setIsOpen(false)
    setSearch('')
    setActive(0)
  }

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') return setIsOpen(false)
    if (event.key === 'Enter') {
      event.preventDefault()
      const chosen = shown[active]
      if (chosen) choose(chosen)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    if (shown.length === 0) return
    const step = event.key === 'ArrowDown' ? 1 : -1
    setActive((current) => (current + step + shown.length) % shown.length)
  }

  return (
    <div className={cn('gap-1', className)}>
      <label className="text-sm text-white" htmlFor={id}>
        {label}
      </label>
      <div className="relative" onFocus={load} onPointerEnter={load} ref={field}>
        <input
          aria-invalid={isWrong || undefined}
          className={cn(
            'w-full border-b bg-transparent py-2 pr-4 pl-20 text-sm text-white placeholder-graphite-700 focus:outline-hidden',
            isWrong ? 'border-red-500' : 'border-graphite-400',
          )}
          id={id}
          onChange={(event) => {
            if (tools === null) put(event.target.value)
            else type(tools, event.target.value)
          }}
          onBlur={() => {
            setIsTouched(true)
            onBlur?.()
          }}
          onFocus={() => {
            if (number === '') put('+')
          }}
          onKeyDown={(event) => {
            const eats = event.key === 'Backspace' || event.key === 'Delete'
            if (
              eats &&
              tools?.guardsThePlus(event.currentTarget.value, event.currentTarget.selectionStart)
            )
              event.preventDefault()
          }}
          ref={input}
          type="tel"
          value={number === '+' ? '' : number}
        />
        <button
          aria-controls={isOpen && tools !== null ? listId : undefined}
          aria-expanded={isOpen && tools !== null}
          // What the button shows and what pressing it changes: the country, by its name.
          aria-label={countryName(country, locale)}
          className="absolute inset-y-0 left-0 flex flex-row items-center gap-2 rounded-none bg-transparent pl-4 hover:opacity-100"
          onClick={() => {
            load()
            setIsOpen((open) => !open)
            setSearch('')
            setActive(0)
          }}
          type="button"
        >
          {Flag ? <Flag className="size-4" title={countryName(country, locale)} /> : flag}
          <svg
            aria-hidden="true"
            className="size-3 text-graphite-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isOpen && tools !== null && (
          <div className={PANEL}>
            <input
              aria-activedescendant={shown[active] ? optionId(active) : undefined}
              aria-controls={listId}
              aria-label={labels.search}
              // The list is what the box is for, so it takes the caret when the list opens.
              autoFocus
              className="w-full bg-transparent py-3 pr-4 pl-12 text-sm text-graphite-800 placeholder-graphite-700 focus:outline-hidden"
              onChange={(event) => {
                setSearch(event.target.value)
                setActive(0)
              }}
              onKeyDown={onSearchKeyDown}
              placeholder={labels.search}
              type="search"
              value={search}
            />
            <ul
              aria-label={labels.countries}
              className="max-h-60 overflow-y-auto"
              id={listId}
              ref={list}
              role="listbox"
              // The arrow keys move the row the search box points at; this is the other way in,
              // for scrolling the panel with the keyboard alone (axe `scrollable-region-focusable`).
              tabIndex={0}
            >
              {shown.map((one, index) => {
                const Icon = tools.Flags[one.iso]

                return (
                  <li
                    key={one.iso}
                    aria-selected={index === active}
                    className={cn(OPTION, index === active && 'bg-graphite-300')}
                    id={optionId(index)}
                    onClick={() => choose(one)}
                    onMouseDown={(event) => event.preventDefault()}
                    role="option"
                  >
                    {Icon && <Icon className="size-4" title={one.name} />}
                    <span className="flex-1 text-sm">{one.name}</span>
                    <span className="text-sm font-semibold">{one.dialCode}</span>
                  </li>
                )
              })}
            </ul>
            {shown.length === 0 && (
              // Outside the list, which a screen reader reads as a list of countries.
              <p className="px-4 py-3 text-sm text-graphite-500">{labels.noResults}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
