import type { IconProps } from './icon'
import { svgProps } from './icon'

/** A carousel arrow; the right one is the same shape, flipped. Legacy: `src/assets/svg/left-angle.svg` (docs/legacy-inventory.md section 12.3). */
export function LeftAngle(props: IconProps) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 14" {...svgProps(props)}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.305 7.756a1.056 1.056 0 0 1 0-1.487L6.207.321A1.043 1.043 0 0 1 7.352.078a1.043 1.043 0 0 1 .57.575 1.059 1.059 0 0 1-.24 1.155L2.518 7.013l5.164 5.205a1.056 1.056 0 0 1-.013 1.474 1.039 1.039 0 0 1-1.462.013L.305 7.756Z"
        fill="currentColor"
      />
    </svg>
  )
}
