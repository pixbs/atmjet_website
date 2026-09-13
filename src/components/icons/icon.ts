import type { SVGProps } from 'react'

/**
 * The API every icon shares (issue #109). The legacy icons were SVG files imported through SVGR
 * and sized with Tailwind classes (`h-8`, `size-9`); these are plain components, converted once
 * (`docs/legacy-inventory.md` section 12.3), so there is no build step between the asset and the
 * markup and an icon can be read like any other component.
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  /**
   * Width and height together. Left out by default, as the legacy icons were: an icon with only
   * a `viewBox` scales to its container, which is what the Tailwind size classes rely on.
   */
  size?: number | string
}

export function svgProps({ size, ...props }: IconProps): SVGProps<SVGSVGElement> {
  return size === undefined ? props : { width: size, height: size, ...props }
}
