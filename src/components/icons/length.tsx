import type { IconProps } from './icon'
import { svgProps } from './icon'

/** The length of a yacht. Legacy: `src/assets/icons/length.svg` (docs/legacy-inventory.md section 12.3). */
export function Length(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 24" {...svgProps(props)}>
      <path
        d="M18.946 13.886c.457-.328.888-.691 1.29-1.086M4.765 12.8c.401.396.832.76 1.29 1.089M11 5.366v-1.87a1.5 1.5 0 0 1 1.5-1.5v0a1.5 1.5 0 0 1 1.5 1.5v1.871"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12.5"
        cy="7.998"
        r="3.001"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m13.411 10.864 5.07 10.14h2.022v-4.002L15.395 6.787a3.237 3.237 0 0 0-2.895-1.79v0a3.237 3.237 0 0 0-2.895 1.79L4.497 17.002v4.002h2l5.07-10.14"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.734 15.51c-2.113.65-4.374.647-6.486-.009M12.45 7.998a.05.05 0 1 0 .1 0 .05.05 0 0 0-.1 0"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
