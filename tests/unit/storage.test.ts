import { afterEach, describe, expect, it, vi } from 'vitest'

import { mediaFileUrl, readS3Settings } from '@/lib/storage'

/**
 * Where uploads are kept (issue #20). The choice is the environment's, and the one thing this
 * must never do quietly is fall back to a disk because a variable name was misspelled.
 */
const COMPLETE = {
  S3_BUCKET: 'atmjet',
  S3_REGION: 'eu-north-1',
  S3_ACCESS_KEY_ID: 'AKIA-not-a-real-key',
  S3_SECRET_ACCESS_KEY: 'not-a-real-secret',
}

describe('an environment that names no bucket', () => {
  it('keeps the uploads on disk, which is what development and the tests run on', () => {
    expect(readS3Settings({})).toBeNull()
    expect(readS3Settings({ DATABASE_URL: 'postgres://x', S3_BUCKET: '  ' })).toBeNull()
  })
})

describe('an environment that names one', () => {
  it('reads the four it cannot do without', () => {
    expect(readS3Settings(COMPLETE)).toMatchObject({
      bucket: 'atmjet',
      region: 'eu-north-1',
      accessKeyId: 'AKIA-not-a-real-key',
      secretAccessKey: 'not-a-real-secret',
    })
  })

  it('leaves out the two that only some deployments need', () => {
    const settings = readS3Settings(COMPLETE)

    expect(settings?.endpoint).toBeUndefined()
    expect(settings?.publicUrl).toBeUndefined()
  })

  it('takes an S3-compatible host and the address a browser is given', () => {
    const settings = readS3Settings({
      ...COMPLETE,
      S3_ENDPOINT: 'https://ams3.digitaloceanspaces.com',
      S3_PUBLIC_URL: 'https://cdn.example.com/',
    })

    expect(settings?.endpoint).toBe('https://ams3.digitaloceanspaces.com')
    // The trailing slash comes off here so nothing downstream has to join two of them.
    expect(settings?.publicUrl).toBe('https://cdn.example.com')
  })

  it('reads a value that was pasted with spaces around it', () => {
    expect(readS3Settings({ ...COMPLETE, S3_BUCKET: '  atmjet  ' })?.bucket).toBe('atmjet')
  })
})

describe('an environment that names half of one', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterEach(() => warn.mockClear())

  it('says which parts are missing rather than leaving it to be noticed', () => {
    readS3Settings({ S3_BUCKET: 'atmjet', S3_REGION: 'eu-north-1' })

    const [message] = warn.mock.calls[0] ?? []

    expect(message).toContain('S3_ACCESS_KEY_ID')
    expect(message).toContain('S3_SECRET_ACCESS_KEY')
    expect(message).not.toContain('S3_BUCKET,')
  })

  it('keeps the uploads on disk rather than refusing to render the site', () => {
    // Only DATABASE_URL and PAYLOAD_SECRET are worth refusing to start over (`src/lib/env.ts`);
    // a misspelling here costs an editor their uploader, not a visitor the page.
    expect(readS3Settings({ S3_BUCKET: 'atmjet' })).toBeNull()
  })

  it('says nothing about a deployment that set only what some deployments need', () => {
    // An endpoint or a public URL on its own names no bucket, so it is not a half-written group.
    expect(readS3Settings({ S3_PUBLIC_URL: 'https://cdn.example.com' })).toBeNull()
    expect(readS3Settings({ S3_ENDPOINT: 'https://ams3.digitaloceanspaces.com' })).toBeNull()
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('the address a browser is given for an object', () => {
  it('puts the collection prefix between the host and the file', () => {
    expect(mediaFileUrl('https://cdn.example.com', 'hero.webp', 'media')).toBe(
      'https://cdn.example.com/media/hero.webp',
    )
  })

  it('leaves out a prefix that is not there rather than doubling the slash', () => {
    expect(mediaFileUrl('https://cdn.example.com', 'hero.webp')).toBe(
      'https://cdn.example.com/hero.webp',
    )
    expect(mediaFileUrl('https://cdn.example.com', 'hero.webp', '')).toBe(
      'https://cdn.example.com/hero.webp',
    )
  })
})
