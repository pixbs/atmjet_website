'use client'

import { m } from 'motion/react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { cn } from '@/lib/cn'
import { busy } from '@/lib/motion'

import { Input, type InputProps } from './input'

/**
 * A field that offers what it finds while you type (issue #107,
 * `docs/legacy-inventory.md` section 6): the legacy From and To airport fields, which existed
 * twice — controlled in the request form and uncontrolled on the aircraft page, with the two
 * copies already drifted apart. This is one component that does both.
 *
 * The searching lives with the caller: the field says what has been typed once the typing has
 * settled and draws whatever it is handed back, so the airport endpoint (E9.9) can arrive
 * behind it without this file changing.
 *
 * Three things the legacy could not do, none of them visible:
 *
 * - It can be operated from the keyboard. The legacy list was a `<ul>` of `<li>` with a click
 *   handler, reachable only with a mouse; this one is a combobox with a listbox, arrow keys and
 *   Enter, which is also what makes the accessibility tier pass.
 * - The click lands without a race. The legacy cleared the list 200 ms after the blur so the
 *   click had time to fire; here the mouse press on an option does not take the focus away.
 * - It asks once the typing stops, and only from two characters, which is where the legacy
 *   search starts returning anything (section 8.5).
 */

/** The legacy debounce, and the shortest term its search would look up. */
const SEARCH_DELAY_MS = 300
const MIN_SEARCH_LENGTH = 2

/** The dropdown, hung under the field. */
const LIST =
  'absolute bottom-0 z-dropdown mt-4 max-h-40 w-80 shrink-0 translate-y-full overflow-y-auto rounded-xl border bg-white shadow-lg'

const OPTION = 'cursor-pointer px-4 py-2 text-graphite-900'

/** The ring on the line of the value, inside the field's right padding so it never covers text. */
const SPINNER =
  'pointer-events-none absolute top-9.5 right-3 size-4 rounded-full border-2 border-graphite-300 border-t-graphite-500'

export interface AutocompleteProps extends Omit<InputProps, 'onChange' | 'value' | 'role'> {
  /** What to offer for what has been typed. Empty keeps the list shut. */
  options: readonly string[]
  /** Told what has been typed, once the typing has settled: where the search happens. */
  onSearch?: (term: string) => void
  /** The caller is still looking for what to offer, which the field shows until it is answered. */
  isSearching?: boolean
  /** Controlled mode, as the request form used it. Left out, the field keeps its own value. */
  value?: string
  onChange?: (value: string) => void
}

export function Autocomplete({
  options,
  onSearch,
  isSearching = false,
  value,
  onChange,
  defaultValue,
  id,
  className,
  ...props
}: AutocompleteProps) {
  const listId = useId()
  const [own, setOwn] = useState(typeof defaultValue === 'string' ? defaultValue : '')
  const [isOpen, setIsOpen] = useState(false)
  const [active, setActive] = useState(-1)
  // What the visitor picked, so picking it does not read as typing and ask for it again.
  const picked = useRef<string | null>(null)

  const term = value ?? own
  const shown = isOpen && options.length > 0
  // A field that was left or shut with Escape is not waiting for anything (section 13, entry 100).
  const isBusy = isOpen && isSearching
  const optionId = (index: number) => `${listId}-${index}`

  const put = (next: string) => {
    setOwn(next)
    onChange?.(next)
  }

  useEffect(() => {
    if (term.length < MIN_SEARCH_LENGTH || term === picked.current) return

    const timer = setTimeout(() => onSearch?.(term), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [term, onSearch])

  const choose = (option: string) => {
    picked.current = option
    put(option)
    setIsOpen(false)
    setActive(-1)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') return setIsOpen(false)
    if (event.key === 'Enter' && shown && active >= 0) {
      event.preventDefault()
      const option = options[active]
      if (option !== undefined) choose(option)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    // The arrows move through the list rather than through the text of the field.
    event.preventDefault()
    if (options.length === 0) return
    setIsOpen(true)
    const step = event.key === 'ArrowDown' ? 1 : -1
    setActive((current) => (current + step + options.length) % options.length)
  }

  return (
    // `wrapperClassName` reaches the panel, as on every field, so a caller that clips the panel to
    // round it leaves this list alone (#441).
    <div className="relative w-full">
      <Input
        {...props}
        aria-activedescendant={shown && active >= 0 ? optionId(active) : undefined}
        aria-autocomplete="list"
        aria-busy={isBusy}
        aria-controls={shown ? listId : undefined}
        aria-expanded={shown}
        autoComplete="off"
        className={className}
        id={id}
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          put(event.target.value)
          setIsOpen(event.target.value.length >= MIN_SEARCH_LENGTH)
          setActive(-1)
        }}
        onKeyDown={onKeyDown}
        role="combobox"
        value={term}
      />
      {isBusy && (
        <m.span
          animate="visible"
          aria-hidden
          className={SPINNER}
          data-testid="autocomplete-busy"
          initial="hidden"
          variants={busy}
        />
      )}
      {shown && (
        <ul className={LIST} id={listId} role="listbox">
          {options.map((option, index) => (
            <li
              key={option}
              aria-selected={index === active}
              className={cn(OPTION, index === active && 'bg-graphite-100')}
              id={optionId(index)}
              // The press must not take the focus, or the field closes the list before the click.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
              role="option"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
