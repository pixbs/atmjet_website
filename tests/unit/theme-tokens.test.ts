/**
 * The design tokens are the parity contract for every ported section (issue #47): this
 * suite compiles src/app/(frontend)/globals.css and checks each token against the legacy
 * value in tests/fixtures/legacy-tokens.ts, that the utilities the ported markup will use
 * resolve through those tokens, and that the cleared Tailwind defaults stay gone.
 */
import { beforeAll, describe, expect, it } from 'vitest'

import {
  BREAKPOINTS,
  FONTS,
  GEOMETRY,
  GOLD_GRADIENT,
  PALETTE,
  RADII,
  REMOVED_CLASSES,
  SCREEN_CONTAINERS,
  Z_INDEX,
  type TokenCase,
} from '../fixtures/legacy-tokens'
import {
  compileFrontendCss,
  normaliseCssValue,
  readThemeBlock,
  themeTokens,
  utilityRule,
} from '../helpers/tailwind'

const CASES: TokenCase[] = [...PALETTE, GOLD_GRADIENT, ...FONTS, ...RADII, ...Z_INDEX, ...GEOMETRY]

let css: string
const tokens = themeTokens()

beforeAll(async () => {
  css = await compileFrontendCss([
    ...CASES.map((entry) => entry.utility),
    ...BREAKPOINTS.map((entry) => entry.utility),
    ...SCREEN_CONTAINERS.map((entry) => entry.utility),
    ...REMOVED_CLASSES,
  ])
})

describe.each([
  ['palette', PALETTE],
  ['gradient', [GOLD_GRADIENT]],
  ['fonts', FONTS],
  ['radii', RADII],
  ['z-index', Z_INDEX],
  ['geometry', GEOMETRY],
])('%s tokens', (_group, cases) => {
  it.each(cases)('$legacy -> $variable carries the legacy value', ({ variable, value }) => {
    expect(normaliseCssValue(tokens.get(variable) ?? '')).toBe(normaliseCssValue(value))
  })

  it.each(cases)('$utility resolves through $variable', ({ utility, declaration }) => {
    const rule = utilityRule(css, utility)

    expect(rule, `${utility} generates no utility`).toBeDefined()
    expect(rule).toContain(declaration)
  })
})

describe('breakpoints', () => {
  it.each(BREAKPOINTS)('$name is the legacy $value', ({ name, value, utility, media }) => {
    expect(tokens.get(`--breakpoint-${name}`)).toBe(value)
    expect(utilityRule(css, utility), `${utility} generates no utility`).toBeDefined()
    expect(css).toContain(media)
  })

  it.each(SCREEN_CONTAINERS)('$utility keeps the breakpoint width', ({ utility, declaration }) => {
    expect(utilityRule(css, utility)).toContain(declaration)
  })
})

describe('cleared defaults', () => {
  it.each(REMOVED_CLASSES)('%s generates nothing', (className) => {
    expect(utilityRule(css, className)).toBeUndefined()
  })

  it('declares no colour the fixture does not document', () => {
    const documented = new Set(CASES.map((entry) => entry.variable))
    const declared = [...readThemeBlock().matchAll(/(--color-[\w-]+):/g)]
      .map(([, name]) => name)
      .filter((name) => name !== '--color-*')

    expect(declared.length).toBeGreaterThan(0)
    expect(declared.filter((name) => !documented.has(name))).toEqual([])
  })
})
