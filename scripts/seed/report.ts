export type SeedAction = 'created' | 'updated' | 'unchanged'

export interface SeedOutcome {
  collection: string
  key: string
  action: SeedAction
  id?: number | string
}

export interface SeedReport {
  created: number
  updated: number
  unchanged: number
  outcomes: SeedOutcome[]
}

export function summarise(outcomes: SeedOutcome[]): SeedReport {
  return {
    created: outcomes.filter((outcome) => outcome.action === 'created').length,
    updated: outcomes.filter((outcome) => outcome.action === 'updated').length,
    unchanged: outcomes.filter((outcome) => outcome.action === 'unchanged').length,
    outcomes,
  }
}
