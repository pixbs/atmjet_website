/**
 * Compiles the frontend stylesheet the way the build does, so tests can assert what the
 * design tokens in src/app/(frontend)/globals.css resolve to (issue #47).
 *
 * Tailwind 4 is configured in CSS, so the theme is only observable after compilation:
 * `compile()` returns the theme layer (every token as a custom property) and `build()`
 * turns a list of candidate class names into the utilities they generate.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { compile } from 'tailwindcss'

const PROJECT_ROOT = process.cwd()
const FRONTEND_STYLESHEET = path.resolve(PROJECT_ROOT, 'src/app/(frontend)/globals.css')

const TAILWIND_DIR = path.resolve(PROJECT_ROOT, 'node_modules/tailwindcss')

/** Resolves `tailwindcss`, `tailwindcss/preflight.css` and relative imports from disk. */
async function loadStylesheet(id: string, base: string) {
  let file: string
  if (id === 'tailwindcss') file = path.join(TAILWIND_DIR, 'index.css')
  else if (id.startsWith('tailwindcss/'))
    file = path.join(TAILWIND_DIR, id.slice('tailwindcss/'.length))
  else file = path.resolve(base, id)

  return { path: file, base: path.dirname(file), content: readFileSync(file, 'utf8') }
}

/** The compiled stylesheet, including the utilities for `candidates`. */
export async function compileFrontendCss(candidates: string[] = []): Promise<string> {
  const compiler = await compile(readFileSync(FRONTEND_STYLESHEET, 'utf8'), {
    base: path.dirname(FRONTEND_STYLESHEET),
    loadStylesheet,
  })

  return compiler.build(candidates)
}

/**
 * Every token as written in the `@theme` block, by custom-property name, whitespace
 * collapsed. The stylesheet is read rather than the compiled output because Tailwind 4
 * only emits the theme variables the built utilities reference (a breakpoint or a shadow
 * is inlined), so the compiled CSS is the wrong place to look up a token's value.
 */
export function themeTokens(): Map<string, string> {
  const tokens = new Map<string, string>()

  for (const [, name, value] of readThemeBlock().matchAll(/(--[\w*-]+):([^;]+);/g)) {
    tokens.set(
      name,
      value
        .replace(/\/\*.*?\*\//gs, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
  }

  return tokens
}

/**
 * A CSS value in a form two sources can be compared in: whitespace collapsed, no space
 * just inside brackets, hex lowercased, trailing zeros dropped. Prettier reformats long
 * gradients (`rgba(21, 21, 21, 0.00)` becomes `rgba(21, 21, 21, 0)`), so the legacy string
 * and the formatted stylesheet differ only cosmetically.
 */
export function normaliseCssValue(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\b(\d+)\.(\d*?)0+\b/g, (_match, whole, fraction) =>
      fraction ? `${whole}.${fraction}` : whole,
    )
    .trim()
    .toLowerCase()
}

/**
 * The class name as it appears in a selector: Tailwind escapes `:`, `/`, `%`, `.` and
 * friends with a backslash, and a leading digit as a hex escape (`2xl:flex` becomes
 * `.\32 xl\:flex`).
 */
function escapeClassName(className: string): string {
  const escaped = className.replace(/[.:/%[\]()#,!]/g, (character) => `\\${character}`)

  return /^\d/.test(escaped) ? `\\3${escaped[0]} ${escaped.slice(1)}` : escaped
}

/**
 * One rule with its declarations, or undefined when the stylesheet does not contain it. The
 * selector has to start a line, so `div` does not match `.card div`; a selector list is
 * matched as written on one line (`h1, h2, h3, h4`).
 */
function ruleFor(css: string, selector: string): string | undefined {
  // Prettier breaks selector lists over several lines; compare them on one line.
  css = css.replace(/,\s*\n\s*/g, ', ')
  const pattern = new RegExp(`(?:^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{`)
  const match = pattern.exec(css)
  if (!match) return undefined

  const start = match.index + match[0].length - `${selector} {`.length
  return blockAt(css, css.indexOf('{', start), start)
}

/**
 * Every rule with that selector, in source order. The Tailwind preflight also styles `a`,
 * `hr` and `::placeholder`, so the parity rule for those is not the first one.
 */
export function rulesFor(css: string, selector: string): string[] {
  const flat = css.replace(/,\s*\n\s*/g, ', ')
  const rules: string[] = []
  let rest = flat

  for (;;) {
    const rule = ruleFor(rest, selector)
    if (!rule) return rules

    rules.push(rule)
    rest = rest.slice(rest.indexOf(rule) + rule.length)
  }
}

/** The declaration block of one utility, or undefined when the theme does not generate it. */
export function utilityRule(css: string, className: string): string | undefined {
  return ruleFor(css, `.${escapeClassName(className)}`)
}

/** The text of every top-level `@layer <name>` block, concatenated. */
export function layerCss(css: string, name: string): string {
  const blocks: string[] = []

  for (const match of css.matchAll(/@layer\s+([\w\s,]+?)\s*\{/g)) {
    const names = match[1].split(',').map((entry) => entry.trim())
    if (!names.includes(name)) continue

    const open = match.index + match[0].length - 1
    blocks.push(blockAt(css, open, open) ?? '')
  }

  return blocks.join('\n')
}

/**
 * The stylesheet without its cascade layers: what is left outranks every layer, which is how
 * the parity class rules reproduce the legacy cascade (docs/adr/0006-styling-and-motion.md).
 */
export function unlayeredCss(css: string): string {
  let rest = css

  for (;;) {
    const match = /@layer\s+[\w\s,]+?\s*\{/.exec(rest)
    if (!match) return rest

    const open = match.index + match[0].length - 1
    const block = blockAt(rest, open, open) ?? ''
    rest = rest.slice(0, match.index) + rest.slice(open + block.length)
  }
}

/** The balanced `{ ... }` block that starts at `open`, taken from `from`. */
function blockAt(css: string, open: number, from: number): string | undefined {
  let depth = 0

  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    else if (css[index] === '}') {
      depth -= 1
      if (depth === 0) return css.slice(from, index + 1)
    }
  }

  return undefined
}

/** The `@theme` block of the stylesheet as written, for checks on the source itself. */
export function readThemeBlock(): string {
  const source = readFileSync(FRONTEND_STYLESHEET, 'utf8')
  const start = source.indexOf('@theme {')
  const end = source.indexOf('\n}', start)

  return source.slice(start, end)
}
