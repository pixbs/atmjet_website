import type { IconProps } from './icon'
import { svgProps } from './icon'

/** The refit year. Legacy: `src/assets/icons/tools.svg` (docs/legacy-inventory.md section 12.3). */
export function Tools(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 24" {...svgProps(props)}>
      <path
        clipRule="evenodd"
        d="M6.207 3.293 3.793 5.707a1 1 0 0 0-.293.707V8a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6.914a1 1 0 0 0-.707.293Z"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 9v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9M17.5 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-7M20 18.5h1.5M19.5 14.5h2M20 10.5h1.5M19.5 6.5h2"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
