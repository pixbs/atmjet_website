'use client'

import { useState, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import { clampCount, countFromInput, COUNT_RANGE, type CountRange } from '@/lib/counter-input'

/**
 * The passenger stepper of the request form (issue #97, `docs/legacy-inventory.md` section 6):
 * a label, a minus, the number and a plus, in one white box.
 *
 * The legacy gave every leg of a multi-leg request the same `id='passengers'`, so a page with
 * four legs had four fields claiming one name and every label pointed at the first of them
 * (section 13, entry 66). `id` is required here, which is what that fix amounts to.
 *
 * The buttons stay clickable at the ends of the range and say so with `aria-disabled` rather
 * than the attribute, exactly as the legacy did: it dimmed them and clamped in the handler, so
 * they never left the tab order.
 */
export interface CounterInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'value' | 'defaultValue' | 'onChange'
> {
  /** Names the field, both to a visitor and to assistive technology. */
  label: string
  /** Required, because the label points at it and every leg needs its own. */
  id: string
  /** Controlled value; leave it out and the field keeps its own. */
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** The legacy range, one to twenty-five, unless a caller needs another. */
  range?: CountRange
  /** Goes on the box that holds all four parts. */
  wrapperClassName?: string
}

const STEP =
  'size-8 rounded-none border border-graphite-300 p-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'

export function CounterInput({
  label,
  id,
  value: controlled,
  defaultValue,
  onValueChange,
  range = COUNT_RANGE,
  className,
  wrapperClassName,
  ...props
}: CounterInputProps) {
  const [own, setOwn] = useState(() => clampCount(defaultValue ?? range.min, range))
  const value = controlled ?? own

  const set = (next: number) => {
    const clamped = clampCount(next, range)
    setOwn(clamped)
    onValueChange?.(clamped)
  }

  return (
    <div
      className={cn(
        'flex-row items-center bg-white px-4 py-2.5 text-sm font-normal text-graphite-900',
        wrapperClassName,
      )}
    >
      <label className="pr-4" htmlFor={id}>
        {label}
      </label>
      <button
        aria-disabled={value <= range.min}
        aria-label={`${label} −`}
        className={STEP}
        onClick={() => set(value - 1)}
        type="button"
      >
        −
      </button>
      <input
        className={cn('w-10 border-none bg-transparent p-0 py-1 text-center', className)}
        id={id}
        onChange={(event) => set(countFromInput(event.target.value, value, range))}
        value={value}
        {...props}
      />
      <button
        aria-disabled={value >= range.max}
        aria-label={`${label} +`}
        className={STEP}
        onClick={() => set(value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  )
}
