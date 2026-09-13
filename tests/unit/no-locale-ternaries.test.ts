import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * The lint rule that keeps locale ternaries out of components (issue #163).
 *
 * The legacy site decided what to render by comparing the locale in 77 places across 18 files
 * (`docs/i18n-audit.md`), which is the reason `uk` could never be turned on: every one of them
 * would have fallen through to English. The rule is what stops them coming back, so it is tested
 * like any other piece of logic.
 *
 * The fixtures are strings rather than files on disk: a file containing the pattern would be
 * flagged by the repository's own lint run, which is exactly what the rule is for.
 */
const RULE = 'no-restricted-syntax'
const COMPONENT = 'src/components/example.tsx'

let eslint: ESLint

beforeAll(() => {
  eslint = new ESLint({ cwd: process.cwd() })
})

async function messagesFor(code: string, filePath = COMPONENT): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath, warnIgnored: false })

  return result.messages
    .filter((message) => message.ruleId === RULE)
    .map((message) => message.message)
}

describe('a locale ternary in a component', () => {
  it('is refused however the comparison is written', async () => {
    const fixtures = [
      `export const a = locale === 'en' ? 'Guests' : 'Гости'`,
      `export const b = locale !== 'ru' ? 'Guests' : 'Гости'`,
      `export const c = params.locale === 'ru' ? 'Гости' : 'Guests'`,
      `export const d = 'ru' === locale ? 'Гости' : 'Guests'`,
      `export const e = 'uk' === props.locale ? 'Гості' : 'Guests'`,
      `export const f = lang === 'en' ? 'Apply' : 'Применить'`,
      `export const g = language == 'ru' ? 'Час' : 'Hour'`,
    ]

    for (const fixture of fixtures) {
      const messages = await messagesFor(fixture)

      expect(messages, fixture).toHaveLength(1)
      expect(messages[0]).toMatch(/message catalogue or in a localized Payload field/)
    }
  })

  it('leaves alone the comparisons that are not a rendering decision', async () => {
    const fixtures = [
      // A locale that is not compared to a language code at all.
      `export const a = locale === fallback`,
      // Some other value that happens to be one of those strings.
      `export const b = status === 'en'`,
      `export const c = country === 'ru'`,
      // Membership, which is how a route checks a locale is one it serves.
      `export const d = locales.includes(locale)`,
    ]

    for (const fixture of fixtures) {
      expect(await messagesFor(fixture), fixture).toEqual([])
    }
  })
})

describe('the files the rule covers', () => {
  it('covers what renders', async () => {
    for (const path of [
      'src/app/(frontend)/[locale]/page.tsx',
      'src/components/elements/card.tsx',
      'src/blocks/Hero/Component.tsx',
    ]) {
      expect(
        await messagesFor(`export const a = locale === 'en' ? 'a' : 'b'`, path),
        path,
      ).toHaveLength(1)
    }
  })

  it('leaves the routing and the collections alone, where comparing a locale is the job', async () => {
    for (const path of [
      'src/i18n/locales.ts',
      'src/collections/Pages.ts',
      'src/lib/data/pages.ts',
    ]) {
      expect(await messagesFor(`export const a = locale === 'en' ? 'a' : 'b'`, path), path).toEqual(
        [],
      )
    }
  })
})
