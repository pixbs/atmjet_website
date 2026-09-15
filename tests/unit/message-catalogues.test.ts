import { describe, expect, it } from 'vitest'

import en from '@/messages/en.json'
import ru from '@/messages/ru.json'
import uk from '@/messages/uk.json'

import { ALL_LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/locales'

/**
 * Every language says the same things (issue #166, ADR-0003). The legacy Ukrainian catalogue was
 * ten keys short of the English one and was never loaded, so nobody found out
 * (`docs/legacy-inventory.md` section 11.3); a key added to one file and forgotten in another
 * renders its own name at a visitor, which is what this is here to catch.
 */
type Catalogue = Record<string, unknown>

const CATALOGUES: Record<Locale, Catalogue> = { en, ru, uk }

/** Every message in a catalogue, by the dotted path next-intl reads it under. */
function pathsOf(catalogue: Catalogue, prefix = ''): string[] {
  return Object.entries(catalogue).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? pathsOf(value as Catalogue, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

function messageAt(catalogue: Catalogue, path: string): string {
  const value = path
    .split('.')
    .reduce<unknown>((node, key) => (node as Catalogue | undefined)?.[key], catalogue)

  return typeof value === 'string' ? value : ''
}

/**
 * The values a message asks its caller for. Only the outermost ones: a plural picks its own
 * categories per language — Russian has `few` and `many` where English has none — so what is
 * inside the braces of a plural is the translator's, and what is outside is the contract.
 */
function argumentsOf(message: string): string[] {
  const names = new Set<string>()
  let depth = 0

  for (let index = 0; index < message.length; index += 1) {
    if (message[index] === '}') depth -= 1
    if (message[index] !== '{') continue

    depth += 1
    if (depth === 1) {
      const name = message.slice(index + 1).match(/^\s*([^,{}\s]+)/)?.[1]
      if (name !== undefined) names.add(name)
    }
  }

  return [...names].sort()
}

const TRANSLATIONS = ALL_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)

describe('the message catalogues', () => {
  const english = pathsOf(CATALOGUES[DEFAULT_LOCALE]).sort()

  it('has messages to compare', () => {
    expect(english.length).toBeGreaterThan(50)
  })

  for (const locale of TRANSLATIONS) {
    it(`says everything in ${locale} that it says in ${DEFAULT_LOCALE}`, () => {
      const translated = pathsOf(CATALOGUES[locale]).sort()

      // Both directions: a message nothing reads is as much of a mistake as a missing one.
      expect(translated).toEqual(english)
    })

    it(`asks for the same values in ${locale}`, () => {
      const mismatched = english.filter(
        (path) =>
          argumentsOf(messageAt(CATALOGUES[locale], path)).join() !==
          argumentsOf(messageAt(CATALOGUES[DEFAULT_LOCALE], path)).join(),
      )

      expect(mismatched).toEqual([])
    })
  }
})
