import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'

/**
 * One Payload instance per process, one resolution per request (ADR-0007).
 *
 * `getPayload` is memoised at module scope because building the instance is expensive and it
 * holds the database pool; `cache()` then dedupes the lookup inside a single render pass, so a
 * page and the blocks below it share one await instead of racing.
 */
let instance: Promise<Payload> | undefined

export const getPayloadClient = cache(async (): Promise<Payload> => {
  instance ??= config.then((resolved) => getPayload({ config: resolved }))
  return instance
})
