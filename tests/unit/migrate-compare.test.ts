import { describe, expect, it } from 'vitest'

import { differences, rendered, sampled, text } from '../../scripts/migrate/compare'

/**
 * The sampled comparison of rendered strings (issue #85, ADR-0002 item 10): what is read off a
 * page, what counts as a difference, and which pages are sampled.
 */
describe('what a page says', () => {
  const legacy = `<html><body><h1 class="x">Global 6000 <span>LX-NST</span></h1>
    <div><h3>13</h3><p>max pax</p></div><div><h3>Ultra&nbsp;long range</h3><p>type</p></div>
    <div><h3>1.92m</h3><p>cabin height</p></div><h3>other</h3><p>max pax</p></body></html>`

  it('is its heading and its figures by label, as text', () => {
    expect(rendered(legacy)).toEqual({
      heading: 'Global 6000 LX-NST',
      figures: { 'max pax': '13', type: 'Ultra long range', 'cabin height': '1.92m' },
    })
  })

  it('decodes entities and folds whitespace', () => {
    expect(text(' A &amp; B&#39;s &#x2014; <b>C</b>\n D ')).toBe("A & B's — C D")
  })

  it('has no heading and no figures for a page that draws none', () => {
    expect(rendered('<html><body><p>nothing</p></body></html>')).toEqual({
      heading: null,
      figures: {},
    })
  })

  it('reads the misspelt legacy label as the word it means, and leaves a blurb out', () => {
    const page = rendered(
      '<h3>14.74m/2.49m</h3><p>lenght/width</p><h3>Telegram</h3><p>Manage your enquiries and bookings on the go via private chat with our team</p>',
    )

    expect(page.figures).toEqual({ 'length/width': '14.74m/2.49m' })
  })
})

describe('the differences', () => {
  const page = rendered(
    '<h1>Global 6000 LX-NST</h1><h3>13</h3><p>max pax</p><h3>2017</h3><p>year</p>',
  )

  it('are none when the port says the same', () => {
    expect(differences(page, page)).toEqual([])
  })

  it('name the heading and each figure the port changed or lost', () => {
    const port = rendered('<h1>Global 6000</h1><h3>14</h3><p>max pax</p>')

    expect(differences(page, port)).toEqual([
      'heading: "Global 6000 LX-NST" → "Global 6000"',
      'max pax: "13" → "14"',
      'year: "2017" → missing',
    ])
  })

  it('let a legacy page that drew no heading go, and spacing that moved', () => {
    // The legacy sent a catalogue slug without pictures to its listing: nothing to compare.
    expect(differences(rendered('<p>listing</p>'), rendered('<h1>CRJ-1000</h1>'))).toEqual([])
    expect(differences(rendered('<h1>"Outlaw "</h1>'), rendered('<h1>"Outlaw"</h1>'))).toEqual([])
  })

  it('let the port say more than the legacy did', () => {
    const port = rendered(
      '<h1>Global 6000 LX-NST</h1><h3>13</h3><p>max pax</p><h3>2017</h3><p>year</p><h3>11,297km</h3><p>range</p>',
    )

    expect(differences(page, port)).toEqual([])
  })
})

describe('the sample', () => {
  it('spreads over each list rather than taking its start, in the English detail URLs', () => {
    const paths = sampled(
      {
        catalogueSlugs: ['a', 'b', 'c', 'd', 'e', 'f'],
        tailNumbers: ['RA-1', ' ', 'RA-2'],
        charterSlugs: ['y1'],
      },
      6,
    )

    expect(paths).toEqual([
      '/en/aircraft/a',
      '/en/aircraft/d',
      '/en/aircraft/RA-1',
      '/en/aircraft/RA-2',
      '/en/yachts/y1',
    ])
  })

  it('encodes what a slug carries', () => {
    expect(sampled({ catalogueSlugs: ['a b/c'], tailNumbers: [], charterSlugs: [] }, 3)).toEqual([
      '/en/aircraft/a%20b%2Fc',
    ])
  })
})
