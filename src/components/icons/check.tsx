import type { IconProps } from './icon'
import { svgProps } from './icon'

/** The tick inside a checkbox. Legacy: `src/assets/svg/check.svg` (docs/legacy-inventory.md section 12.3). */
export function Check(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" {...svgProps(props)}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M18.82 9.46a1.33 1.33 0 1 0-1.89-1.89l-6.6 6.6-2.83-2.83a1.33 1.33 0 1 0-1.88 1.89l3.67 3.68a1.47 1.47 0 0 0 2.08 0l7.45-7.45Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
