/**
 * The arithmetic of the passenger stepper (issue #97, `docs/legacy-inventory.md` section 6).
 *
 * The legacy stepper clamped in three places — the two buttons and the typed value — and each
 * did it slightly differently. Here it is one rule, so a number that reaches the field has been
 * through the same door however it arrived.
 */

/** What the legacy stepper allowed: one passenger at least, twenty-five at most. */
export const COUNT_RANGE = { min: 1, max: 25 } as const

export interface CountRange {
  min: number
  max: number
}

export function clampCount(value: number, { min, max }: CountRange = COUNT_RANGE): number {
  if (!Number.isFinite(value)) return min

  return Math.min(max, Math.max(min, Math.round(value)))
}

/**
 * What a typed value becomes. Anything that is not a number is ignored and the field keeps what
 * it had, which is what the legacy `Number(e.target.value)` did for an empty or partial entry.
 */
export function countFromInput(
  text: string,
  current: number,
  range: CountRange = COUNT_RANGE,
): number {
  const trimmed = text.trim()
  if (trimmed === '' || !/^\d+$/.test(trimmed)) return current

  return clampCount(Number(trimmed), range)
}
