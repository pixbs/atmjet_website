/**
 * The counting logic of the legacy Counter (issue #50, docs/legacy-inventory.md section 10.5),
 * kept as pure functions so it can be unit tested and so the component only owns the timer.
 *
 * The legacy counter walked every number inside a label ("16+", "1,000 flights", "3.5 h") from
 * zero to its value in 30 ms steps over 800 ms, formatting each step with `toLocaleString` and
 * restoring the original text once every number had arrived, which is what keeps a suffix such
 * as `+` and a decimal point intact.
 */

/** Matches a number with an optional decimal or thousands part, as the legacy pattern did. */
const NUMBER_PATTERN = /\d+([,.]\d+)?/g

/** How often the legacy counter updated, in milliseconds. */
export const COUNT_INTERVAL_MS = 30

/** How long the legacy counter took to reach its targets, in milliseconds. */
const COUNT_DURATION_MS = 800

/** The number of steps the count takes. */
const COUNT_STEPS = COUNT_DURATION_MS / COUNT_INTERVAL_MS

/** Every number in the text, in order ("1,000 of 3.5" gives [1000, 3.5]). */
export function parseCountTargets(text: string): number[] {
  const matches = text.match(NUMBER_PATTERN)
  if (!matches) return []

  return matches.map((match) => Number.parseFloat(match.replace(/,/g, '')))
}

/** The value of each number after `step` intervals; the last step reaches the target. */
export function countValues(targets: number[], step: number): number[] {
  return targets.map((target) => (target / COUNT_STEPS) * step)
}

/** Whether every number has reached its target, which ends the count. */
export function isCountDone(values: number[], targets: number[]): boolean {
  return values.every((value, index) => value >= targets[index])
}

/** The text with each number replaced by its current value, rounded like the legacy did. */
export function formatCount(text: string, values: number[]): string {
  let index = 0

  return text.replace(NUMBER_PATTERN, () => {
    const value = values[index] ?? 0
    index += 1

    return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  })
}
