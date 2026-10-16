import { zodResolver } from '@hookform/resolvers/zod'
import { describe, expect, it } from 'vitest'

import { bookingSchema } from '@/lib/booking'
import { lazyZodResolver } from '@/lib/lazy-resolver'

/**
 * The booking form's rules arrive when the form is first judged (issue #428); what they say
 * must not change with when they arrive.
 */
const options = { fields: {}, shouldUseNativeValidation: false } as const

describe('a resolver that fetches its schema', () => {
  const lazy = lazyZodResolver(() => Promise.resolve(bookingSchema))
  const eager = zodResolver(bookingSchema)

  it('refuses what the schema refuses, with the same errors', async () => {
    const values = { name: '', email: 'nobody', phone: '+971', tags: [] }

    const judged = await lazy(values, undefined, options)

    expect(Object.keys(judged.errors)).toEqual(['name', 'email', 'phone'])
    expect(judged).toEqual(await eager(values, undefined, options))
  })

  it('passes what the schema passes', async () => {
    const values = { name: 'Ann', email: 'ann@example.com', phone: '+971 50 458 9926', tags: [] }

    expect(await lazy(values, undefined, options)).toEqual({ values, errors: {} })
  })
})
