import type { IconProps } from './icon'
import { svgProps } from './icon'

/** Closes the navigation overlay, the floating menu and the booking dialog. Legacy: `src/assets/svg/close.svg` (docs/legacy-inventory.md section 12.3). */
export function Close(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...svgProps(props)}>
      <path d="M24 8 8 24M8 8l16 16" stroke="currentColor" />
    </svg>
  )
}
