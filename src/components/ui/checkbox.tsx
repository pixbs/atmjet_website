import type { InputHTMLAttributes } from 'react'

import { Check } from '@/components/icons'
import { cn } from '@/lib/cn'

/**
 * The tick box of the cookie modal (issue #96, `docs/legacy-inventory.md` section 6): a dark
 * square with a white border, and the tick drawn over it once it is checked.
 *
 * No state and no script: the box is a real checkbox with its own appearance taken away, and the
 * tick is shown by `peer-checked`, which is how the legacy one worked too. `rounded-sm` pointed
 * at an undefined variable there and rendered square, so no radius class is ported (ADR-0006).
 */
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Goes on the box that holds the input and its tick. */
  wrapperClassName?: string
}

export function Checkbox({ className, wrapperClassName, ...props }: CheckboxProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <input
        className={cn(
          'peer relative box-border flex size-6 cursor-pointer appearance-none items-center border-2 border-white bg-graphite-900 p-0',
          className,
        )}
        type="checkbox"
        {...props}
      />
      <Check className="pointer-events-none absolute top-0 right-0 z-10 hidden size-6 text-white peer-checked:block" />
    </div>
  )
}
