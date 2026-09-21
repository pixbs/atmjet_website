import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { clearableUploads, resetsOn } from '../../scripts/db/reset-rules'

/**
 * What `bun run db:reset` is allowed to destroy (issue #22). It is the command a clone starts
 * with, so both of its guards are worth pinning: it drops a schema and it deletes files.
 */
describe('resetsOn', () => {
  it('resets a development or a test environment', () => {
    expect(resetsOn(undefined, undefined)).toBe(true)
    expect(resetsOn('development', undefined)).toBe(true)
    expect(resetsOn('test', undefined)).toBe(true)
  })

  it('refuses production, which is the one that cannot be undone', () => {
    expect(resetsOn('production', undefined)).toBe(false)
    expect(resetsOn('production', '0')).toBe(false)
    expect(resetsOn('production', 'yes')).toBe(false)
  })

  it('takes the same deliberate override the seed takes', () => {
    expect(resetsOn('production', '1')).toBe(true)
  })
})

describe('clearableUploads', () => {
  const ROOT = '/home/dev/atmjet'

  it('clears the uploads the project keeps beside itself', () => {
    expect(clearableUploads(ROOT, 'media')).toBe(path.join(ROOT, 'media'))
    expect(clearableUploads(ROOT, undefined)).toBe(path.join(ROOT, 'media'))
    expect(clearableUploads(ROOT, 'var/uploads')).toBe(path.join(ROOT, 'var/uploads'))
  })

  it('leaves alone a directory that is not the project s', () => {
    expect(clearableUploads(ROOT, '/var/lib/atmjet')).toBeNull()
    expect(clearableUploads(ROOT, '../shared-media')).toBeNull()
    // The project itself, which would take the working tree with it.
    expect(clearableUploads(ROOT, '.')).toBeNull()
  })
})
