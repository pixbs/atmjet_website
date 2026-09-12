/**
 * Pure image comparison for the visual parity harness (issue #38, ADR-0004).
 * Compares two PNG buffers pixel by pixel and reports the mismatch ratio; no browser, no file system.
 */
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

export interface CompareOptions {
  /** pixelmatch colour distance threshold, 0 (strict) to 1 (lenient) */
  threshold?: number
  /** allowed share of differing pixels on the compared area */
  maxDiffPixelRatio?: number
  /** allowed difference in height in pixels (full pages may differ by a few pixels of content) */
  maxHeightDelta?: number
}

export interface CompareResult {
  pass: boolean
  reason?: string
  width: number
  /** compared height (the smaller of the two heights) */
  height: number
  widthDelta: number
  heightDelta: number
  diffPixels: number
  diffRatio: number
  /** PNG with the differing pixels highlighted, present when the sizes allowed a comparison */
  diff?: Buffer
}

export const DEFAULT_COMPARE_OPTIONS: Required<CompareOptions> = {
  threshold: 0.1,
  maxDiffPixelRatio: 0.01,
  maxHeightDelta: 0,
}

export function compareImages(
  actual: Buffer,
  expected: Buffer,
  options: CompareOptions = {},
): CompareResult {
  const settings = { ...DEFAULT_COMPARE_OPTIONS, ...options }
  const a = PNG.sync.read(actual)
  const b = PNG.sync.read(expected)
  const widthDelta = Math.abs(a.width - b.width)
  const heightDelta = Math.abs(a.height - b.height)

  if (widthDelta > 0) {
    return {
      pass: false,
      reason: `width differs: actual ${a.width}px, expected ${b.width}px`,
      width: a.width,
      height: Math.min(a.height, b.height),
      widthDelta,
      heightDelta,
      diffPixels: 0,
      diffRatio: 1,
    }
  }

  const height = Math.min(a.height, b.height)
  const width = a.width
  const diff = new PNG({ width, height })
  const diffPixels = pixelmatch(crop(a, height), crop(b, height), diff.data, width, height, {
    threshold: settings.threshold,
    includeAA: false,
  })
  const diffRatio = width * height === 0 ? 0 : diffPixels / (width * height)
  const reasons: string[] = []
  if (heightDelta > settings.maxHeightDelta) {
    reasons.push(
      `height differs by ${heightDelta}px (actual ${a.height}px, expected ${b.height}px, allowed ${settings.maxHeightDelta}px)`,
    )
  }
  if (diffRatio > settings.maxDiffPixelRatio) {
    reasons.push(
      `${diffPixels} pixels differ (${(diffRatio * 100).toFixed(3)}%, allowed ${(settings.maxDiffPixelRatio * 100).toFixed(3)}%)`,
    )
  }

  return {
    pass: reasons.length === 0,
    reason: reasons.length ? reasons.join('; ') : undefined,
    width,
    height,
    widthDelta,
    heightDelta,
    diffPixels,
    diffRatio,
    diff: PNG.sync.write(diff),
  }
}

function crop(image: PNG, height: number): Uint8Array {
  if (image.height === height) return image.data
  return image.data.subarray(0, image.width * height * 4)
}

/** Builds a solid PNG buffer; used by the tests and the harness self-check. */
export function solidPng(
  width: number,
  height: number,
  rgba: [number, number, number, number],
): Buffer {
  const png = new PNG({ width, height })
  for (let index = 0; index < width * height; index += 1) {
    png.data[index * 4] = rgba[0]
    png.data[index * 4 + 1] = rgba[1]
    png.data[index * 4 + 2] = rgba[2]
    png.data[index * 4 + 3] = rgba[3]
  }
  return PNG.sync.write(png)
}

/** Returns a copy of a PNG buffer with the first `count` pixels painted with `rgba`. */
export function paintPixels(
  source: Buffer,
  count: number,
  rgba: [number, number, number, number],
): Buffer {
  const png = PNG.sync.read(source)
  for (let index = 0; index < Math.min(count, png.width * png.height); index += 1) {
    png.data[index * 4] = rgba[0]
    png.data[index * 4 + 1] = rgba[1]
    png.data[index * 4 + 2] = rgba[2]
    png.data[index * 4 + 3] = rgba[3]
  }
  return PNG.sync.write(png)
}
