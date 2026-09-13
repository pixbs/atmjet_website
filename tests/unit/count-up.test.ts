import { describe, expect, it } from 'vitest'

import { countValues, formatCount, isCountDone, parseCountTargets } from '@/lib/count-up'

/** The legacy counter's behaviour (issue #50): what it parsed, how it stepped and formatted. */
describe('count up', () => {
  it.each([
    ['16+', [16]],
    ['1,000 flights', [1000]],
    ['3.5 h', [3.5]],
    ['20 years, 5 offices', [20, 5]],
    ['no numbers here', []],
  ])('parses %s', (text, expected) => {
    expect(parseCountTargets(text)).toEqual(expected)
  })

  it('reaches the target on the last step and not before', () => {
    const targets = [16]

    expect(countValues(targets, 0)).toEqual([0])
    // 800 ms in 30 ms steps: 26 steps are not enough, 27 reach the target.
    expect(isCountDone(countValues(targets, 25), targets)).toBe(false)
    expect(isCountDone(countValues(targets, 27), targets)).toBe(true)
  })

  it('keeps everything around the numbers while counting', () => {
    expect(formatCount('16+', [8])).toBe('8+')
    expect(formatCount('20 years, 5 offices', [10, 2])).toBe('10 years, 2 offices')
  })

  it('rounds to whole numbers, as the legacy formatting did', () => {
    expect(formatCount('3.5 h', [2.7])).toBe('3 h')
  })

  it('treats a missing value as zero, so a partial list never renders undefined', () => {
    expect(formatCount('20 years, 5 offices', [10])).toBe('10 years, 0 offices')
  })

  it('leaves a label without numbers alone', () => {
    expect(formatCount('flights', [])).toBe('flights')
  })
})
