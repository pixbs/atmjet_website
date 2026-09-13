import { describe, expect, it } from 'vitest'

import {
  admin,
  adminFieldOnly,
  adminOrSelf,
  anyone,
  editorOrAdmin,
  hasRole,
  publishedOnly,
} from '@/access'

/**
 * The access helpers in isolation (issue #70). `tests/int/access.int.spec.ts` proves Payload
 * enforces them on real documents; here each rule is checked against the shapes `req.user` can
 * actually take, including the malformed ones.
 */
const as = (roles?: unknown) => ({ req: { user: roles === undefined ? null : { id: 1, roles } } })
const anonymous = { req: { user: null } }

describe('hasRole', () => {
  it('is true when the user holds any of the accepted roles', () => {
    expect(hasRole({ roles: ['editor'] } as never, 'editor', 'admin')).toBe(true)
    expect(hasRole({ roles: ['admin'] } as never, 'admin')).toBe(true)
  })

  it('is false for a role the user does not hold, and for nobody', () => {
    expect(hasRole({ roles: ['editor'] } as never, 'admin')).toBe(false)
    expect(hasRole(null, 'admin')).toBe(false)
  })
})

describe('access rules', () => {
  it('lets anyone read what is public', () => {
    expect(anyone(anonymous as never)).toBe(true)
  })

  it('keeps admin rules to admins', () => {
    expect(admin(anonymous as never)).toBe(false)
    expect(admin(as(['editor']) as never)).toBe(false)
    expect(admin(as(['admin']) as never)).toBe(true)
  })

  it('lets both roles run the content', () => {
    expect(editorOrAdmin(anonymous as never)).toBe(false)
    expect(editorOrAdmin(as(['editor']) as never)).toBe(true)
    expect(editorOrAdmin(as(['admin']) as never)).toBe(true)
    expect(editorOrAdmin(as([]) as never)).toBe(false)
  })
})

describe('publishedOnly', () => {
  it('narrows a public read to published documents instead of rejecting it', () => {
    expect(publishedOnly(anonymous as never)).toEqual({ _status: { equals: 'published' } })
  })

  it('shows drafts to the people who run the content, so preview works', () => {
    expect(publishedOnly(as(['editor']) as never)).toBe(true)
    expect(publishedOnly(as(['admin']) as never)).toBe(true)
  })
})

describe('adminOrSelf', () => {
  it('refuses anonymous requests outright', () => {
    expect(adminOrSelf(anonymous as never)).toBe(false)
  })

  it('gives an admin everything', () => {
    expect(adminOrSelf(as(['admin']) as never)).toBe(true)
  })

  it('narrows anyone else to their own document', () => {
    expect(adminOrSelf(as(['editor']) as never)).toEqual({ id: { equals: 1 } })
  })
})

describe('adminFieldOnly', () => {
  it('guards the fields that would let someone widen their own access', () => {
    expect(adminFieldOnly(as(['admin']) as never)).toBe(true)
    expect(adminFieldOnly(as(['editor']) as never)).toBe(false)
    expect(adminFieldOnly(anonymous as never)).toBe(false)
  })
})
