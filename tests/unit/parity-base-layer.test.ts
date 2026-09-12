/**
 * The parity base layer is the pixel contract for every ported section (issue #48). This
 * suite compiles the frontend stylesheet and checks that each legacy global rule is there
 * with the declarations the legacy site computed, that the quirks are kept (square corners
 * where the legacy radius was undefined), that the Tailwind 3 preflight defaults are
 * restored, and that the cascade split holds: element rules in `@layer base`, class rules
 * unlayered, so utilities beat the former and lose to the latter, as on the legacy site.
 */
import { beforeAll, describe, expect, it } from 'vitest'

import {
  CLASS_RULES,
  DROPPED_SELECTORS,
  ELEMENT_RULES,
  NO_SCROLLBAR_DECLARATIONS,
  PREFLIGHT_RESTORED,
  type ParityRule,
} from '../fixtures/parity-base-layer'
import {
  compileFrontendCss,
  layerCss,
  rulesFor,
  unlayeredCss,
  utilityRule,
} from '../helpers/tailwind'

/** The declarations of every rule with that selector, so preflight's own `a` or `hr` is included. */
function declarationsOf(css: string, selector: string): string {
  return rulesFor(css, selector).join('\n')
}

function expectRule(css: string, rule: ParityRule): void {
  const declarations = declarationsOf(css, rule.selector)

  expect(declarations, `${rule.selector} is missing`).not.toBe('')
  for (const declaration of rule.declarations) expect(declarations).toContain(declaration)
  for (const declaration of rule.absent ?? []) expect(declarations).not.toContain(declaration)
}

let css: string
let base: string
let unlayered: string

beforeAll(async () => {
  css = await compileFrontendCss(['no-scrollbar', 'container'])
  base = layerCss(css, 'base')
  unlayered = unlayeredCss(css)
})

describe('element rules', () => {
  it.each(ELEMENT_RULES)('$legacy', (rule) => {
    expectRule(base, rule)
  })

  it.each(ELEMENT_RULES)('$selector stays in the base layer, where utilities win', (rule) => {
    expect(rulesFor(unlayered, rule.selector)).toEqual([])
  })
})

describe('restored Tailwind 3 preflight defaults', () => {
  it.each(PREFLIGHT_RESTORED)('$legacy', (rule) => {
    expectRule(base, rule)
  })
})

describe('class rules', () => {
  it.each(CLASS_RULES)('$legacy', (rule) => {
    expectRule(unlayered, rule)
  })

  it.each(CLASS_RULES)('$selector stays unlayered, so it outranks utilities', (rule) => {
    expect(rulesFor(base, rule.selector)).toEqual([])
    if (!rule.alsoAUtility) expect(rulesFor(layerCss(css, 'utilities'), rule.selector)).toEqual([])
  })
})

describe('utilities and omissions', () => {
  it('keeps no-scrollbar as a utility', () => {
    const rule = utilityRule(css, 'no-scrollbar')

    expect(rule).toBeDefined()
    for (const declaration of NO_SCROLLBAR_DECLARATIONS) expect(rule).toContain(declaration)
  })

  it.each(DROPPED_SELECTORS)('does not port %s', (selector) => {
    expect(css).not.toContain(selector)
  })
})
