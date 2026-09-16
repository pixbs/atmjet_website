import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { readEnvironment } from '@/lib/env'

/**
 * The environment the site refuses to start without (issue #19). What is asserted is the message
 * a person gets, because the point of the check is that a fresh deployment says which variable
 * is wrong rather than failing later as a connection error or an unsigned cookie.
 */
const configured = {
  DATABASE_URL: 'postgresql://payload:payload@localhost:5432/atmjet',
  PAYLOAD_SECRET: 'a-long-enough-secret-for-signing',
}

const example = readFileSync(new URL('../../.env.example', import.meta.url), 'utf8')

/** What `.env.example` ships for a variable, as a person copying the file would get. */
const shipped = (name: string): string =>
  new RegExp(`^${name}=(.*)$`, 'm').exec(example)?.[1]?.trim() ?? ''

describe('reading the environment', () => {
  it('answers with the values when both are set', () => {
    expect(readEnvironment(configured)).toEqual(configured)
  })

  it('trims what an environment file leaves around a value', () => {
    expect(
      readEnvironment({ ...configured, PAYLOAD_SECRET: `  ${configured.PAYLOAD_SECRET}  ` })
        .PAYLOAD_SECRET,
    ).toBe(configured.PAYLOAD_SECRET)
  })

  it('names every variable that is wrong, not just the first', () => {
    const thrown = (): void => void readEnvironment({})

    expect(thrown).toThrow(/DATABASE_URL is not set/)
    expect(thrown).toThrow(/PAYLOAD_SECRET is not set/)
  })

  it('says a blank value is not set, and nothing more about it', () => {
    const thrown = (): void => void readEnvironment({ DATABASE_URL: '', PAYLOAD_SECRET: ' ' })

    expect(thrown).toThrow(/DATABASE_URL is not set/)
    expect(thrown).not.toThrow(/is not a postgres/)
    expect(thrown).toThrow(/PAYLOAD_SECRET is not set/)
    expect(thrown).not.toThrow(/shorter than/)
  })

  it('says where to set them', () => {
    expect(() => readEnvironment({})).toThrow(/docs\/environment\.md/)
  })

  it('refuses a connection string that is not Postgres', () => {
    expect(() =>
      readEnvironment({ ...configured, DATABASE_URL: 'mysql://localhost/atmjet' }),
    ).toThrow(/DATABASE_URL is not a postgres/)
    expect(() => readEnvironment({ ...configured, DATABASE_URL: 'localhost:5432' })).toThrow(
      /DATABASE_URL is not a postgres/,
    )
  })

  it('takes either spelling of the Postgres scheme, as the adapter does', () => {
    expect(() =>
      readEnvironment({ ...configured, DATABASE_URL: 'postgres://payload@localhost/atmjet' }),
    ).not.toThrow()
  })

  it('refuses the placeholder the repository publishes', () => {
    // Read from the file rather than named here, so the two cannot drift: `.env.example` is in
    // the repository, and a deployment that copied it has no signing key at all.
    expect(() =>
      readEnvironment({ ...configured, PAYLOAD_SECRET: shipped('PAYLOAD_SECRET') }),
    ).toThrow(/PAYLOAD_SECRET is the placeholder/)
  })

  it('refuses a secret short enough to guess', () => {
    expect(() => readEnvironment({ ...configured, PAYLOAD_SECRET: 'atmjet' })).toThrow(
      /PAYLOAD_SECRET is shorter than 16 characters/,
    )
  })
})

/**
 * The matrix and the example file (issue #19). A variable that exists in one and not the other is
 * how a deployment ends up missing something nobody knew it needed, so the two are held together
 * here rather than by anyone remembering.
 */
const matrix = readFileSync(new URL('../../docs/environment.md', import.meta.url), 'utf8')

/** The names `.env.example` assigns, in the order it assigns them. */
const declared = [...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(([, name]) => name)

/** The names the matrix lists for us to set: its first table, before the platform's own. */
const listed = [
  ...matrix
    .slice(0, matrix.indexOf('## Set by the platform'))
    .matchAll(/^\| `([A-Z][A-Z0-9_]*)`/gm),
].map(([, name]) => name)

describe('the environment matrix', () => {
  it('lists every variable the example file declares', () => {
    expect(listed.length).toBeGreaterThan(0)
    expect([...declared].sort()).toEqual([...listed].sort())
  })

  it('says what each one is read by, or that nothing reads it yet', () => {
    // A row with an empty last cell is a variable nobody has explained.
    const rows = matrix
      .slice(0, matrix.indexOf('## Set by the platform'))
      .split('\n')
      .filter((line) => /^\| `[A-Z]/.test(line))

    for (const row of rows) {
      const cells = row.split('|').map((cell) => cell.trim())

      expect(cells[cells.length - 2], `${cells[1]} names nothing that reads it`).not.toBe('')
    }
  })
})
