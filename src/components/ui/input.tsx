import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

import { fieldControlVariants, fieldLabelVariants, fieldVariants } from './field'

/**
 * A text field with its label inside the box (issue #96, `docs/legacy-inventory.md` section 6).
 *
 * The legacy label was an absolutely positioned `<label>` with no `htmlFor`, so it named nothing:
 * a screen reader read the field as unlabelled and clicking the label did not focus it. It is
 * tied to the input here, which is why `id` is required and why the accessibility tier passes;
 * nothing about it moves on the page.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Names the field, both to a visitor and to assistive technology. */
  label: string
  /** Required, because the label points at it. */
  id: string
  /** Goes on the panel, so a caller can size or round the whole field. */
  wrapperClassName?: string
}

export function Input({ label, id, className, wrapperClassName, ...props }: InputProps) {
  return (
    <div className={cn(fieldVariants(), wrapperClassName)}>
      <label className={fieldLabelVariants()} htmlFor={id}>
        {label}
      </label>
      <input className={cn(fieldControlVariants(), className)} id={id} {...props} />
    </div>
  )
}
