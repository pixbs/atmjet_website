/**
 * Integration test harness (issue #40, ADR-0004).
 * One Payload instance per worker (Vitest runs every file in its own worker), unique data so files
 * running in parallel never collide, and a registry that removes what a suite created.
 */
import {
  getPayload,
  type CollectionSlug,
  type DataFromCollectionSlug,
  type File,
  type Payload,
  type RequiredDataFromCollectionSlug,
  type TypedLocale,
} from 'payload'
import config from '@/payload.config'

let instance: Promise<Payload> | undefined

export function getTestPayload(): Promise<Payload> {
  instance ??= config.then((resolved) => getPayload({ config: resolved }))
  return instance
}

let counter = 0

/** Unique, sortable suffix for data created by tests. */
export function uniqueSuffix(): string {
  counter += 1
  return `${process.pid.toString(36)}-${Date.now().toString(36)}-${counter}`
}

interface Tracked {
  collection: CollectionSlug
  id: number | string
}

export interface CreateExtras {
  file?: File
  locale?: TypedLocale
}

/** Records the documents a suite creates and deletes them afterwards, newest first. */
export class TestRegistry {
  private readonly tracked: Tracked[] = []

  constructor(readonly payload: Payload) {}

  async create<TSlug extends CollectionSlug>(
    collection: TSlug,
    data: RequiredDataFromCollectionSlug<TSlug>,
    extras: CreateExtras = {},
  ): Promise<DataFromCollectionSlug<TSlug>> {
    const doc = await this.payload.create({ collection, data, overrideAccess: true, ...extras })
    this.tracked.push({ collection, id: doc.id })
    return doc
  }

  /** Adopts a document created elsewhere so the registry removes it too. */
  track(collection: CollectionSlug, id: number | string): void {
    this.tracked.push({ collection, id })
  }

  get size(): number {
    return this.tracked.length
  }

  async cleanup(): Promise<void> {
    for (const { collection, id } of [...this.tracked].reverse()) {
      await this.payload.delete({ collection, id, overrideAccess: true }).catch(() => undefined)
    }
    this.tracked.length = 0
  }
}

export async function createRegistry(): Promise<TestRegistry> {
  return new TestRegistry(await getTestPayload())
}
