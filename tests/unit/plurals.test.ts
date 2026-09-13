import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'

import en from '@/messages/en.json'
import ru from '@/messages/ru.json'
import uk from '@/messages/uk.json'
import { ALL_LOCALES, type Locale } from '@/i18n/locales'

/**
 * ICU plurals (issue #167).
 *
 * The legacy site pluralised exactly one string, by hand, in Russian only: `pluralizeHours` in
 * `yachts/yacht_card.tsx` chose between час, часа and часов with `% 10` and `% 100` arithmetic
 * (`docs/legacy-inventory.md` section 11). Everything else it counted — guests, cabins,
 * bathrooms — was printed in one fixed form whatever the number, so a Russian visitor read
 * "1 гостей" and "1 каюты".
 *
 * These messages are the vocabulary that replaces both. `hours` reproduces the legacy rule
 * exactly, which is the interesting assertion below; the other four are correct plurals that no
 * component reaches yet, because whether a page keeps the legacy fixed form is a parity question
 * for the page issue that renders it (E8.6, E8.7), not for this one.
 */
// Typed against the English catalogue: the three are meant to have the same shape, so a key
// that exists in one and not the others fails here rather than at render time.
const CATALOGUES: Record<Locale, typeof en> = { en, ru, uk }

const UNITS = ['hours', 'guests', 'cabins', 'bathrooms', 'passengers'] as const

type Unit = (typeof UNITS)[number]

function unit(locale: Locale) {
  const translate = createTranslator({
    locale,
    messages: CATALOGUES[locale],
    namespace: 'units',
  })

  return (key: Unit, count: number) => translate(key, { count })
}

describe('the catalogue', () => {
  it('carries the same units in every locale, so none renders a missing key', () => {
    for (const locale of ALL_LOCALES) {
      expect(Object.keys(CATALOGUES[locale].units as object).sort(), locale).toEqual(
        [...UNITS].sort(),
      )
    }
  })
})

describe('hours in Russian', () => {
  const hours = unit('ru')

  it('matches the legacy pluralizeHours for every category', () => {
    // The legacy rule: %10 === 1 and %100 !== 11 → час; %10 in 2..4 and not 12..14 → часа;
    // otherwise часов. Russian CLDR says the same thing, so the output is unchanged.
    expect(hours('hours', 1)).toBe('1 час')
    expect(hours('hours', 2)).toBe('2 часа')
    expect(hours('hours', 5)).toBe('5 часов')
    expect(hours('hours', 21)).toBe('21 час')
    expect(hours('hours', 22)).toBe('22 часа')
    expect(hours('hours', 25)).toBe('25 часов')
  })

  it('keeps the teens the legacy carved out by hand', () => {
    // 11 ends in 1 and 12 to 14 end in 2 to 4, but all of them are "many". Getting this wrong is
    // the classic Russian plural bug, and the legacy code got it right.
    expect(hours('hours', 11)).toBe('11 часов')
    expect(hours('hours', 12)).toBe('12 часов')
    expect(hours('hours', 14)).toBe('14 часов')
    expect(hours('hours', 111)).toBe('111 часов')
    expect(hours('hours', 101)).toBe('101 час')
  })

  it('counts zero as many, which the legacy never reached', () => {
    // pluralizeHours returned undefined for 0 because of its falsy guard, so the card printed
    // "мин undefined". There is no such hole here.
    expect(hours('hours', 0)).toBe('0 часов')
  })
})

describe('hours in Ukrainian', () => {
  const hours = unit('uk')

  it('uses the same three categories, with Ukrainian words', () => {
    expect(hours('hours', 1)).toBe('1 година')
    expect(hours('hours', 2)).toBe('2 години')
    expect(hours('hours', 5)).toBe('5 годин')
    expect(hours('hours', 21)).toBe('21 година')
    expect(hours('hours', 22)).toBe('22 години')
    expect(hours('hours', 25)).toBe('25 годин')
  })

  it('treats the teens as many here too', () => {
    expect(hours('hours', 11)).toBe('11 годин')
    expect(hours('hours', 14)).toBe('14 годин')
  })
})

describe('hours in English', () => {
  const hours = unit('en')

  it('has the two categories English has', () => {
    expect(hours('hours', 1)).toBe('1 hour')
    expect(hours('hours', 2)).toBe('2 hours')
    expect(hours('hours', 5)).toBe('5 hours')
    expect(hours('hours', 21)).toBe('21 hours')
    expect(hours('hours', 22)).toBe('22 hours')
    expect(hours('hours', 25)).toBe('25 hours')
    expect(hours('hours', 0)).toBe('0 hours')
  })
})

describe('every unit in every locale', () => {
  for (const locale of ALL_LOCALES) {
    it(`renders a category for 1, 2, 5, 21, 22 and 25 in ${locale}`, () => {
      const render = unit(locale)

      for (const key of UNITS) {
        for (const count of [1, 2, 5, 21, 22, 25]) {
          const rendered = render(key, count)

          // A missing category makes next-intl echo the key rather than throw, so the assertion
          // is that the number and a word came back, not merely that something did.
          expect(rendered, `${locale}.${key}(${count})`).toMatch(
            new RegExp(`^${count} \\p{Letter}+$`, 'u'),
          )
        }
      }
    })
  }
})
