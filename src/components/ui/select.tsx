import type { ReactNode, SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

import { fieldControlVariants, fieldLabelVariants, fieldVariants } from './field'

/**
 * The same box as `Input` around a `<select>` (issue #96, `docs/legacy-inventory.md` section 6):
 * the aircraft list sorts with two of these, and the yachts filter with two more.
 *
 * The options are passed as children, so the page that knows what can be chosen renders them on
 * the server and this only draws the box (ADR-0007).
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  /** Required, because the label points at it. */
  id: string
  /** The `<option>` elements. */
  children: ReactNode
  /** Goes on the panel, so a caller can size or round the whole field. */
  wrapperClassName?: string
}

export function Select({
  label,
  id,
  className,
  wrapperClassName,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn(fieldVariants(), 'overflow-hidden', wrapperClassName)}>
      <label className={fieldLabelVariants()} htmlFor={id}>
        {label}
      </label>
      <select
        className={cn(fieldControlVariants({ isSelect: true }), className)}
        id={id}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
