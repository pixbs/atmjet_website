import type { Result } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { ADVISORY_RULES, classifyViolations, describeViolations } from '../a11y/axe'

function violation(id: string, targets: string[], impact: Result['impact'] = 'serious'): Result {
  return {
    id,
    impact,
    description: id,
    help: `help for ${id}`,
    helpUrl: '',
    tags: [],
    nodes: targets.map((target) => ({ any: [], all: [], none: [], html: '', target: [target] })),
  } as unknown as Result
}

describe('classifyViolations', () => {
  it('blocks every violation by default except the advisory rules', () => {
    const report = classifyViolations([
      violation('image-alt', ['img']),
      violation('color-contrast', ['p']),
    ])
    expect(report.blocking.map((v) => v.id)).toEqual(['image-alt'])
    expect(report.advisory.map((v) => v.id)).toEqual(['color-contrast'])
    expect(ADVISORY_RULES).toContain('color-contrast')
  })

  it('exempts a rule globally or for matching selectors only', () => {
    const violations = [violation('link-name', ['a.logo']), violation('link-name', ['a.cta'])]
    const global = classifyViolations(violations, {
      allow: [{ rule: 'link-name', reason: 'legacy icon links' }],
    })
    expect(global.exempted).toHaveLength(2)
    const scoped = classifyViolations(violations, {
      allow: [{ rule: 'link-name', selector: 'a.logo', reason: 'logo' }],
    })
    expect(scoped.exempted.map((v) => v.nodes[0].target[0])).toEqual(['a.logo'])
    expect(scoped.blocking.map((v) => v.nodes[0].target[0])).toEqual(['a.cta'])
  })

  it('lets a spec override the advisory list', () => {
    const report = classifyViolations([violation('color-contrast', ['p'])], { advisory: [] })
    expect(report.blocking).toHaveLength(1)
  })

  it('describes violations with rule, impact and targets', () => {
    expect(describeViolations([violation('image-alt', ['img.hero'])])).toBe(
      'image-alt (serious): help for image-alt\n  img.hero',
    )
  })
})
