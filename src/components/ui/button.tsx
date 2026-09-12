import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

/**
 * The legacy button set (docs/adr/0006-styling-and-motion.md, issue #49). The look itself lives
 * in the parity base layer, which styles `button`, `button.big`, `button.middle` and
 * `button.middle.dark`, so the variants emit those class names instead of repeating the
 * declarations: the rendered markup stays identical to the legacy site, and there is one place
 * to change a button.
 *
 * `buttonVariants` is exported for the elements that only look like buttons (a link, or the
 * legacy `.button` span).
 */
export const buttonVariants = cva('', {
  variants: {
    size: {
      /** The pill: `button` on its own. */
      default: '',
      /** The wide call to action (`button.big`). */
      big: 'big',
      /** The mid-size button (`button.middle`), square-cornered like the legacy one. */
      middle: 'middle',
    },
    tone: {
      default: '',
      /** Outlined on a light surface. The legacy site only styled it together with `middle`. */
      dark: '',
      /** The gold gradient. */
      gold: 'bg-gold',
    },
  },
  compoundVariants: [{ size: 'middle', tone: 'dark', class: 'dark' }],
  defaultVariants: { size: 'default', tone: 'default' },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, size, tone, type = 'button', ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ size, tone }), className)} type={type} {...props} />
}
