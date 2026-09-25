import { describe, expect, it } from 'vitest'

import { markdown, summarise } from '../../scripts/ci/lighthouse-summary'

/**
 * The medians the legacy baseline is recorded from (issue #43): one row per page and form
 * factor, whatever order the runs arrive in.
 */
const report = (url: string, formFactor: 'mobile' | 'desktop', lcp: number, image: number) => ({
  finalDisplayedUrl: url,
  configSettings: { formFactor },
  categories: { performance: { score: lcp < 2000 ? 0.95 : 0.6 } },
  audits: {
    'largest-contentful-paint': { numericValue: lcp },
    'cumulative-layout-shift': { numericValue: 0.0123 },
    'total-blocking-time': { numericValue: 120.4 },
    'total-byte-weight': { numericValue: 2048000 },
    'resource-summary': {
      details: {
        items: [
          { resourceType: 'total', transferSize: 2048000 },
          { resourceType: 'image', transferSize: image },
        ],
      },
    },
  },
})

describe('the Lighthouse medians', () => {
  it('take the middle run of each page and form factor', () => {
    const rows = summarise([
      report('https://atmjet.com/en', 'mobile', 4000, 1024000),
      report('https://atmjet.com/en', 'mobile', 3000, 512000),
      report('https://atmjet.com/en', 'mobile', 5000, 2048000),
      report('https://atmjet.com/en', 'desktop', 1500, 512000),
    ])

    expect(rows).toEqual([
      {
        url: 'https://atmjet.com/en',
        formFactor: 'mobile',
        runs: 3,
        performance: 60,
        lcp: 4000,
        cls: 0.012,
        tbt: 120,
        bytes: 2048000,
        imageBytes: 1024000,
      },
      expect.objectContaining({ formFactor: 'desktop', runs: 1, lcp: 1500, performance: 95 }),
    ])
  })

  it('print as the table the baseline document keeps', () => {
    const table = markdown(summarise([report('https://atmjet.com/en', 'desktop', 1500, 512000)]))

    expect(table.split('\n')[2]).toBe(
      '| /en | desktop | 1 | 95 | 1500 ms | 0.012 | 120 ms | 2000 KiB | 500 KiB |',
    )
  })
})
