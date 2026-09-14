import type { IconProps } from './icon'
import { svgProps } from './icon'

/** Passengers on an aircraft or a yacht. Legacy: `src/assets/icons/guests.svg` (docs/legacy-inventory.md section 12.3). */
export function Guests(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...svgProps(props)}>
      <path
        d="M3 18a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4M16 4.651a2.5 2.5 0 1 1 0 5M11.405 4.996a3.401 3.401 0 1 1-4.81 4.81 3.401 3.401 0 0 1 4.81-4.81M17 13a4 4 0 0 1 4 4"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
