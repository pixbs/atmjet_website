import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/cn'

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    expect(cn('flex', undefined, null, false, 'gap-2')).toBe('flex gap-2')
  })

  it('supports conditional objects and arrays like clsx', () => {
    expect(cn(['p-2', { hidden: false, block: true }])).toBe('p-2 block')
  })

  it('resolves conflicting tailwind utilities, last one wins', () => {
    expect(cn('p-2 text-sm', 'p-4')).toBe('text-sm p-4')
  })
})
