/**
 * Airports: how a code is stored and how one reads in a list.
 *
 * The two legacy airport tables spelled the same codes in whatever case the source used
 * (`docs/legacy-inventory.md` section 8.5); the collection hook runs the normalisers so a code
 * is stored one way whichever table it came from, and the search lists what it finds through
 * `airportOption`.
 */

/**
 * ICAO and IATA codes, canonical: trimmed, inner whitespace removed, upper-cased. An empty or
 * absent value becomes undefined rather than an empty string, so a missing code is missing
 * rather than a value that matches nothing.
 */
export function normaliseCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const normalised = value.replace(/\s+/g, '').toUpperCase()
  return normalised === '' ? undefined : normalised
}

/** Collapses runs of whitespace and trims, leaving human text otherwise untouched. */
export function normaliseText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const normalised = value.replace(/\s+/g, ' ').trim()
  return normalised === '' ? undefined : normalised
}

/** Letters typed without their marks that decomposition does not take apart; `й` is kept whole. */
const FOLDED: Readonly<Record<string, string>> = {
  ё: 'е',
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
  ø: 'o',
  ł: 'l',
  đ: 'd',
  ð: 'd',
  þ: 'th',
  ı: 'i',
}

/** Cyrillic in Latin letters, so a name stored in one script is found from the other (#443). */
const LATIN: Readonly<Record<string, string>> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'i',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

/** Both spellings of a saint, which the legacy search re-queried so both showed (section 8.6). */
const SAINT: Readonly<Record<string, string>> = {
  st: 'saint',
  saint: 'st',
  ste: 'sainte',
  sainte: 'ste',
}

/** Where a Ukrainian word reads otherwise: `Київ` is Kyiv and `Харків` Kharkiv, not Kiiv. */
const UKRAINIAN: Readonly<Record<string, string>> = { и: 'y', г: 'h' }

const CYRILLIC = /\p{Script=Cyrillic}/u

/**
 * Shorter Latin readings collide with unrelated words: the Russian name of every Oak airfield
 * reads `dub` and outranks Dubai, and `биль` reads `bil`, the code of Billings.
 */
const MIN_LATIN_LENGTH = 4

/** The words of a text as the search compares them: no case, marks, ё, apostrophes or punctuation. */
function searchWords(text: string): string[] {
  const folded = Array.from(text.normalize('NFC').toLowerCase(), (char) =>
    char === 'й' ? char : (FOLDED[char] ?? char.normalize('NFD').replace(/\p{M}/gu, '')),
  ).join('')

  return folded
    .replace(/['‘’ʼ`´]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

/** A Cyrillic word in Latin letters, or nothing when it has none or the reading is too short. */
function latin(word: string): string | undefined {
  if (!CYRILLIC.test(word)) return undefined

  const letters = /[ієґ]/.test(word) ? { ...LATIN, ...UKRAINIAN } : LATIN
  const read = Array.from(word, (char) => letters[char] ?? char).join('')
  return read.length >= MIN_LATIN_LENGTH ? read : undefined
}

/** The fields an airport is searched on, in every language it has them (#443). */
export const SEARCHED_FIELDS = ['city', 'name', 'country', 'aliases', 'icao', 'iata'] as const

/**
 * What a term is matched against (#443): every name of an airport in every language and both its
 * codes as one folded text, plus the other spelling of a saint and every Cyrillic word in Latin.
 * Folding here rather than in SQL keeps the match independent of the database collation, which
 * did not fold Cyrillic on the legacy site. A localized field may be given as its locale map.
 */
export function airportSearchText(
  airport: Partial<Record<(typeof SEARCHED_FIELDS)[number], unknown>>,
): string {
  const found = new Set<string>()
  const texts = SEARCHED_FIELDS.flatMap((field) => {
    const value = airport[field]
    return value !== null && typeof value === 'object' ? Object.values(value) : [value]
  })

  for (const text of texts) {
    if (typeof text !== 'string') continue
    for (const word of searchWords(text)) {
      found.add(word)
      for (const also of [SAINT[word], latin(word)]) if (also !== undefined) found.add(also)
    }
  }

  return [...found].join(' ')
}

/** An airport as the search offers it, narrowed to what one line of the list needs. */
export interface AirportOption {
  city?: string | null
  country?: string | null
  /** The airport's own name, which the legacy row called `label`. */
  label?: string | null
  icao?: string | null
  iata?: string | null
}

/**
 * `Dubai (OMDB) United Arab Emirates, Dubai International`: one airport as the legacy
 * autocomplete listed it (`docs/legacy-inventory.md` section 8.5). ICAO, or IATA where an
 * airport has no ICAO code.
 *
 * The legacy template left the gap where a missing code would have gone — `Dubai  United Arab
 * Emirates` with two spaces — and printed a bare comma for an airport with no name; what is
 * absent is simply left out here.
 */
export function airportOption(airport: AirportOption): string {
  const code = normaliseCode(airport.icao) ?? normaliseCode(airport.iata)
  const head = [
    normaliseText(airport.city),
    code === undefined ? undefined : `(${code})`,
    normaliseText(airport.country),
  ]
    .filter((part) => part !== undefined)
    .join(' ')
  const name = normaliseText(airport.label)

  if (head === '') return name ?? ''
  return name === undefined ? head : `${head}, ${name}`
}

/**
 * The airport search (issue #159, `docs/legacy-inventory.md` section 8.5).
 *
 * Below two characters the legacy search returned nothing but the term itself, so a single
 * letter never queried the table; that bound is kept, because a letter matches thousands of
 * rows in ten columns.
 */
const MIN_SEARCH_LENGTH = 2

/** How many options the list offers. The legacy query took twenty before de-duplicating. */
export const SEARCH_LIMIT = 20

/** The endpoint is public and every word is a condition, so a term is read only this far (#443). */
const MAX_TERM_LENGTH = 100
const MAX_TERM_WORDS = 6

/**
 * The words of a term, each with the spellings it may be found under (a Cyrillic word also in
 * Latin letters), folded exactly as `airportSearchText` folds a name; empty when the term is
 * shorter than the search looks up.
 */
export function searchTerms(term: string): string[][] {
  const words = [...new Set(searchWords(term.slice(0, MAX_TERM_LENGTH)))].slice(0, MAX_TERM_WORDS)
  if (words.join('').length < MIN_SEARCH_LENGTH) return []

  return words.map((word) => {
    const read = latin(word)
    return read === undefined ? [word] : [word, read]
  })
}

/** The code a term is, when it is one word of three or four letters or digits, upper-cased. */
export function termCode(terms: readonly (readonly string[])[]): string | undefined {
  const [only] = terms
  return terms.length === 1 && only && /^[a-z0-9]{3,4}$/.test(only[0] ?? '')
    ? only[0]?.toUpperCase()
    : undefined
}

/**
 * One row per airport: a code names one airport, so rows sharing their codes are the same one,
 * as the legacy search's two tables were. Without a code the city alone is not enough (11,650
 * imported airfields share their city, an administrative area, with another), so the name joins
 * it; two rows with neither code, city nor name cannot be told apart and the first wins.
 *
 * Not exported: `rankAirports` is the only way to ask, so a caller cannot rank a list it has not
 * de-duplicated (ADR-0008).
 */
function dedupeAirports<T extends AirportOption>(airports: readonly T[]): T[] {
  const seen = new Set<string>()

  return airports.filter((airport) => {
    const codes = [normaliseCode(airport.icao) ?? '', normaliseCode(airport.iata) ?? '']
    const key = codes.some(Boolean)
      ? codes.join('|')
      : ['', normaliseText(airport.city), normaliseText(airport.label)]
          .map((part) => part?.toLowerCase() ?? '')
          .join('|')
    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

/** An airport as the search ranks them: the option's fields, which airport it is, and how busy. */
export interface RankedAirport extends AirportOption {
  id?: number | string
  passengersPerYear?: number | null
  /** Its `airportSearchText`, which says how closely it matches the term. */
  search?: string | null
}

/**
 * What a match adds to an airport's standing, counted in decades of yearly passengers (#443). A
 * code typed as one (four characters, or three in capitals) puts its airport first; a lower-case
 * three-letter code or a whole word lifts a busy airport above a busier word-start match (`led` is
 * Pulkovo before King Khaled, `kazan` Kazan before Nikos Kazantzakis) but not an unknown one above
 * a city being typed (`mos` is Moscow before Moses Point, code MOS).
 */
const TYPED_CODE = 10
const CODE = 1.5
const WHOLE_WORD = 1
const WORD_START = 0.5

/**
 * How an airport ranks for a term: whether every word starts one of its words, which a match
 * inside a word does not (`nic` in Los Angeles' Municipal, `орел` in Морелия), and then how busy
 * it is and how closely it matches.
 */
function standing(
  airport: RankedAirport,
  terms: readonly (readonly string[])[],
  term: string,
): { atWordStart: boolean; score: number } {
  const passengers =
    typeof airport.passengersPerYear === 'number' && airport.passengersPerYear > 0
      ? airport.passengersPerYear
      : 0
  const traffic = Math.log10(passengers + 10)

  const code = termCode(terms)
  if (code !== undefined && [airport.icao, airport.iata].some((one) => normaliseCode(one) === code))
    return {
      atWordStart: true,
      score: traffic + (code.length === 4 || term.trim() === code ? TYPED_CODE : CODE),
    }

  const text = ` ${airport.search ?? ''} `
  const everyWord = (bounded: (word: string) => string) =>
    terms.length > 0 &&
    terms.every((spellings) => spellings.some((word) => text.includes(bounded(word))))

  if (everyWord((word) => ` ${word} `)) return { atWordStart: true, score: traffic + WHOLE_WORD }
  if (everyWord((word) => ` ${word}`)) return { atWordStart: true, score: traffic + WORD_START }
  return { atWordStart: terms.length === 0, score: traffic }
}

/**
 * The busiest and closest matches first (issues #159 and #443). The legacy search ordered by
 * `passengers_per_year`, a text column, ascending, so the smallest airports came first and `9`
 * sorted above `1000000` (`docs/legacy-inventory.md` section 13, entry 69).
 *
 * A match inside a word comes after every match at the start of one. An airport whose traffic
 * nobody recorded counts as none; among equals one with a code goes
 * before an airfield without, and the order they arrived in is kept so the two languages a term
 * was matched in do not shuffle between keystrokes.
 */
export function rankAirports<T extends RankedAirport>(
  airports: readonly T[],
  limit: number,
  term = '',
): T[] {
  const terms = searchTerms(term)
  const coded = (airport: T): number =>
    normaliseCode(airport.icao) || normaliseCode(airport.iata) ? 1 : 0

  return dedupeAirports(airports)
    .map((airport, index) => ({ airport, index, ...standing(airport, terms, term) }))
    .sort(
      (one, two) =>
        Number(two.atWordStart) - Number(one.atWordStart) ||
        two.score - one.score ||
        coded(two.airport) - coded(one.airport) ||
        one.index - two.index,
    )
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.airport)
}
