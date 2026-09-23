import { createServer, type Server } from 'node:http'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * Where an upload goes when the environment names a bucket (issue #20). The legacy admin wrote
 * every photograph to its bucket and deleted none of them when a document lost one, so the
 * bucket grew objects nothing pointed at (`docs/legacy-inventory.md` section 14).
 *
 * The bucket here is a server of this suite's own: the AWS client signs and sends real requests
 * at it, so what it records is what the adapter actually asks S3 to do — which is the half of
 * this that a mock of the client could not tell apart from a call that was never made.
 *
 * The address has to be in the environment before `payload.config.ts` is first imported, which
 * is why it is chosen in a hoisted block rather than in `beforeAll`.
 */
const PORT = vi.hoisted(() => {
  const port = 40_000 + Math.floor(Math.random() * 10_000)

  process.env.S3_BUCKET = 'atmjet-test'
  process.env.S3_REGION = 'eu-north-1'
  process.env.S3_ACCESS_KEY_ID = 'test-key-id'
  process.env.S3_SECRET_ACCESS_KEY = 'test-secret'
  process.env.S3_ENDPOINT = `http://127.0.0.1:${port}`

  return port
})

const revalidateTag = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

const { createRegistry } = await import('../helpers/payload')
const { mediaData } = await import('../factories')

interface BucketRequest {
  method: string
  key: string
}

const received: BucketRequest[] = []
let bucket: Server

const keysOf = (method: string): string[] =>
  received.filter((request) => request.method === method).map((request) => request.key)

/** Big enough that every size the collection asks for is actually generated. */
const photograph = () =>
  sharp({ create: { width: 2400, height: 1600, channels: 3, background: '#14323d' } })
    .png()
    .toBuffer()

beforeAll(async () => {
  bucket = createServer((request, response) => {
    // The SDK appends `?x-id=PutObject`; what identifies the object is the path.
    const [path = ''] = (request.url ?? '').replace(/^\/+/, '').split('?')

    received.push({ method: request.method ?? '', key: path })
    request.resume()
    request.on('end', () => {
      response.writeHead(200, { 'content-type': 'application/xml', etag: '"stand-in"' })
      response.end('<?xml version="1.0" encoding="UTF-8"?><Result />')
    })
  })

  await new Promise<void>((resolve) => bucket.listen(PORT, '127.0.0.1', resolve))
})

afterAll(async () => {
  await new Promise<void>((resolve) => bucket.close(() => resolve()))
})

describe('an upload, when the environment names a bucket', () => {
  it('goes to it under the collection key, with every size beside it', async () => {
    const registry = await createRegistry()
    received.length = 0

    const document = await registry.create('media', mediaData(), {
      file: {
        data: await photograph(),
        mimetype: 'image/png',
        name: `hero-${Date.now()}.png`,
        size: 0,
      },
    })

    const written = keysOf('PUT')

    // The original and the four widths the pages render (`src/collections/Media.ts`).
    expect(written).toHaveLength(5)
    expect(written.every((key) => key.startsWith('atmjet-test/media/'))).toBe(true)
    expect(written).toContain(`atmjet-test/media/${String(document.filename)}`)

    await registry.cleanup()
  })

  it('takes every one of them away again when the document goes', async () => {
    const registry = await createRegistry()
    received.length = 0

    const document = await registry.create('media', mediaData(), {
      file: {
        data: await photograph(),
        mimetype: 'image/png',
        name: `hero-${Date.now()}.png`,
        size: 0,
      },
    })
    const written = keysOf('PUT')

    await registry.payload.delete({
      collection: 'media',
      id: document.id,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

    // The bug this replaces: the legacy admin removed the row and left the objects behind.
    expect(keysOf('DELETE').sort()).toEqual([...written].sort())
  })
})
