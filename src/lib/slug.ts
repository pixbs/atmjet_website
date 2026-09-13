/**
 * Slugs (issue #65).
 *
 * The legacy admin built a yacht slug as
 * `name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_')`
 * (`docs/legacy-inventory.md` section 14 item 4). Three things are wrong with it: a Cyrillic name
 * collapses to an empty string, the slug is recomputed on every edit so a rename moves the URL,
 * and nothing enforces uniqueness while the site matches with `ILIKE '%id%'`.
 *
 * The rule here keeps the shape of the legacy one — lower case, underscores, ASCII — so an
 * imported row whose slug is missing gets the slug the legacy admin would have produced, and adds
 * the transliteration step that was the actual bug.
 */

/** Cyrillic, Russian and Ukrainian, to the Latin the legacy rule could have kept. */
const CYRILLIC: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ґ: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
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

/** Latin letters that carry no combining mark to strip, so `normalize` cannot flatten them. */
const LATIN: Record<string, string> = {
  æ: 'ae',
  ø: 'o',
  œ: 'oe',
  ß: 'ss',
  đ: 'd',
  ł: 'l',
  þ: 'th',
  ð: 'd',
}

/**
 * The closest ASCII spelling of a name. Cyrillic and the odd Latin letter are mapped by hand;
 * everything else is decomposed and has its combining marks dropped, which turns `é` into `e`.
 *
 * The mapping runs before the decomposition, and on a composed string, because several Cyrillic
 * letters decompose into another letter plus a mark: `Ї` is `І` with a diaeresis and `й` is `и`
 * with a breve, so stripping marks first would spell `Їжак` as `Izhak` and `Йога` as `Ioga`.
 */
function transliterate(value: string): string {
  let result = ''

  for (const character of value.normalize('NFC')) {
    const lower = character.toLowerCase()
    const mapped = CYRILLIC[lower] ?? LATIN[lower]

    if (mapped === undefined) {
      result += character.normalize('NFD').replace(/\p{Diacritic}/gu, '')
      continue
    }

    // Keep the case of the source, so a transliteration is readable before it is lower-cased.
    result += character === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
  }

  return result
}

/**
 * A slug in the legacy shape: lower case, ASCII, words joined by underscores. Unlike the legacy
 * rule it transliterates first and trims, because a leading underscore in a URL helps nobody.
 *
 * Returns an empty string when nothing survives — a name written in a script this does not know,
 * or one made entirely of punctuation. The caller decides what to do about that; for Yachts the
 * field is required, so an editor is asked for one.
 */
export function slugify(value: unknown): string {
  if (typeof value !== 'string') return ''

  return transliterate(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
}
