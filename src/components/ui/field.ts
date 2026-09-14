import { cva } from 'class-variance-authority'

/**
 * The floating-label box the legacy forms were built out of (issue #96,
 * `docs/legacy-inventory.md` section 6, `form/input.tsx` and `form/select.tsx`): a white panel
 * with the label sitting inside it, above the value, rather than over it.
 *
 * The two controls are the same box around a different element, so the classes live here once
 * and each component wears them. The legacy files were copied three times between the aircraft
 * list, the yachts filter and the yacht detail page, and the copies had already drifted.
 */

/** The panel. `bg-white` is the legacy `bg-gray-900`: its ramp is inverted (ADR-0006). */
export const fieldVariants = cva('relative w-full bg-white text-graphite-900')

/**
 * The label, inside the panel and out of the flow, so the value can sit under it. It takes the
 * click that lands on it, which is what focuses the field it names.
 */
export const fieldLabelVariants = cva(
  'absolute top-4 left-7 text-xs font-semibold text-graphite-500',
)

/**
 * The control itself. The padding is what leaves room for the label above the value.
 * `rounded-md` on the legacy select pointed at an undefined variable and rendered square, so no
 * radius class is ported (ADR-0006).
 */
export const fieldControlVariants = cva('w-full bg-white px-7 pt-9 pb-4 text-graphite-900', {
  variants: {
    /** A select needs its own arrow suppressed and the browser outline off, as the legacy did. */
    isSelect: {
      true: 'appearance-none border-none outline-hidden focus:outline-hidden',
      false: '',
    },
  },
  defaultVariants: { isSelect: false },
})
