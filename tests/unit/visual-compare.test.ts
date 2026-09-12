import { describe, expect, it } from 'vitest'
import { compareImages, paintPixels, solidPng } from '../visual/legacy/compare'

const red: [number, number, number, number] = [220, 30, 30, 255]
const blue: [number, number, number, number] = [30, 30, 220, 255]

describe('compareImages', () => {
  it('passes identical images with a zero ratio and a diff image', () => {
    const image = solidPng(20, 20, red)
    const result = compareImages(image, image)
    expect(result.pass).toBe(true)
    expect(result.diffPixels).toBe(0)
    expect(result.diffRatio).toBe(0)
    expect(result.diff).toBeInstanceOf(Buffer)
  })

  it('rejects a difference above the pixel ratio and reports the numbers', () => {
    const base = solidPng(20, 20, red)
    const result = compareImages(paintPixels(base, 40, blue), base)
    expect(result.pass).toBe(false)
    expect(result.diffPixels).toBeGreaterThanOrEqual(20)
    expect(result.diffRatio).toBeGreaterThan(0.01)
    expect(result.reason).toContain('pixels differ')
  })

  it('honours a custom pixel ratio', () => {
    const base = solidPng(20, 20, red)
    expect(compareImages(paintPixels(base, 40, blue), base, { maxDiffPixelRatio: 0.2 }).pass).toBe(
      true,
    )
  })

  it('fails on a width mismatch without comparing pixels', () => {
    const result = compareImages(solidPng(20, 20, red), solidPng(21, 20, red))
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('width differs')
    expect(result.diff).toBeUndefined()
  })

  it('compares the common height and applies the height tolerance', () => {
    const strict = compareImages(solidPng(20, 22, red), solidPng(20, 20, red))
    expect(strict.pass).toBe(false)
    expect(strict.heightDelta).toBe(2)
    expect(strict.height).toBe(20)
    expect(strict.reason).toContain('height differs by 2px')
    expect(
      compareImages(solidPng(20, 22, red), solidPng(20, 20, red), { maxHeightDelta: 2 }).pass,
    ).toBe(true)
  })
})
