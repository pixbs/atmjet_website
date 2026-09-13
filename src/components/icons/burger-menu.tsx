import type { IconProps } from './icon'
import { svgProps } from './icon'

/** Opens the navigation overlay. Legacy: `src/assets/svg/burger-menu.svg` (docs/legacy-inventory.md section 12.3). */
export function BurgerMenu(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...svgProps(props)}>
      <path d="M8 24h16M8 9h16M8 16.5h8" stroke="currentColor" />
    </svg>
  )
}
