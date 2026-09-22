import { describe, expect, it } from 'vitest'

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
  it('refuses to start, naming every part that is missing', () => {
    let message = ''

    try {
      readS3Settings({ S3_BUCKET: 'atmjet', S3_REGION: 'eu-north-1' })
    } catch (error) {
      message = (error as Error).message
    }

    expect(message).toContain('S3_ACCESS_KEY_ID is not set')
    expect(message).toContain('S3_SECRET_ACCESS_KEY is not set')
    expect(message).not.toContain('S3_BUCKET is not set')
  })

  it('counts a variable only some deployments need as naming one', () => {
    // Setting the public URL alone is a mistake, not a deployment that wanted its disk.
    expect(() => readS3Settings({ S3_PUBLIC_URL: 'https://cdn.example.com' })).toThrow(
      /S3_BUCKET is not set/,
    )
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
