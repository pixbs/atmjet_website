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

export const PROJECT_ROOT = process.cwd()
export const FRONTEND_STYLESHEET = path.resolve(PROJECT_ROOT, 'src/app/(frontend)/globals.css')

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
export function escapeClassName(className: string): string {
  const escaped = className.replace(/[.:/%[\]()#,!]/g, (character) => `\\${character}`)

  return /^\d/.test(escaped) ? `\\3${escaped[0]} ${escaped.slice(1)}` : escaped
}

/** The declaration block of one utility, or undefined when the theme does not generate it. */
export function utilityRule(css: string, className: string): string | undefined {
  const selector = `.${escapeClassName(className)} {`
  const start = css.indexOf(selector)
  if (start === -1) return undefined

  let depth = 0
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    else if (css[index] === '}') {
      depth -= 1
      if (depth === 0) return css.slice(start, index + 1)
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
