import type { IconProps } from './icon'
import { svgProps } from './icon'

/** The minimum charter hours. Legacy: `src/assets/icons/clock.svg` (docs/legacy-inventory.md section 12.3). */
export function Clock(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...svgProps(props)}>
      <path
        d="m20 20.83-2.26-2.26M6.26 18.57 4 20.83M8.94 5.61a8 8 0 1 1 6.121 14.781A8 8 0 0 1 8.94 5.611M3.45 5.81l3-2.52M20.56 5.82l-3-2.52"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.75 9.432v4.135L15 15.549"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
