'use client'

import { m } from 'motion/react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { cn } from '@/lib/cn'
import { fade, sweep } from '@/lib/motion'

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

/** The padding of a row, which an option and the skeleton of one share so the two line up. */
const ROW = 'px-4 py-2'

const OPTION = cn(ROW, 'cursor-pointer text-graphite-900')

/**
 * The skeleton's rows, one width per line, measured from the airport names a search usually
 * returns: most take two lines of the list (section 13, entry 100).
 */
const SKELETON = [
  ['w-5/6', 'w-11/12'],
  ['w-5/6', 'w-3/5'],
  ['w-4/5', 'w-11/12'],
] as const

export interface AutocompleteProps extends Omit<InputProps, 'onChange' | 'value' | 'role'> {
  /** What to offer for what has been typed. Empty keeps the list shut. */
  options: readonly string[]
  /** Told what has been typed, once the typing has settled: where the search happens. */
  onSearch?: (term: string) => void
  /** The caller is still looking for what to offer: the list shows a skeleton until it answers. */
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
  // A field that was left or shut with Escape is not waiting for anything (section 13, entry 100).
  const isBusy = isOpen && isSearching
  // What an earlier term found stays hidden behind the skeleton, out of reach of the keys too.
  const shown = isOpen && !isSearching && options.length > 0
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
    if (options.length === 0 || isSearching) return
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
        <m.ul
          animate="visible"
          aria-hidden
          className={cn(LIST, 'overflow-hidden')}
          data-testid="autocomplete-loading"
          initial="hidden"
          variants={fade}
        >
          {SKELETON.map((lines, row) => (
            <li key={row} className={ROW}>
              {lines.map((width, line) => (
                // A bar half as tall as the line, centred on it, covers what the capitals would.
                <span key={line} className="flex h-lh items-center">
                  <span className={cn('h-1/2 rounded-full bg-graphite-300/40', width)} />
                </span>
              ))}
            </li>
          ))}
          <li className="absolute inset-0">
            <m.span
              animate="visible"
              className="block h-full w-1/2 bg-linear-to-r from-white/0 via-white/80 to-white/0"
              initial="hidden"
              variants={sweep}
            />
          </li>
        </m.ul>
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
