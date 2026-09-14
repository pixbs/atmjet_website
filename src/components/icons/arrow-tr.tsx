import type { IconProps } from './icon'
import { svgProps } from './icon'

/** The thin stroked arrow of the contact section. Legacy: `src/assets/svg/arrow-tr.svg` (docs/legacy-inventory.md section 12.3). */
export function ArrowTr(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" {...svgProps(props)}>
      <path d="M1 25 25 1m0 0H1m24 0v24" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
