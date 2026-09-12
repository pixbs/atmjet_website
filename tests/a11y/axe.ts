/**
 * Accessibility helper (issue #42, ADR-0004): runs axe with the WCAG 2.1 A/AA rule set, drops the
 * documented exemptions, and reports the rest. Blocking rules fail the test; advisory rules are
 * reported in the test output only.
 */
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import type { Result } from 'axe-core'

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/** Rules reported but not blocking until the design decisions behind them are made (see tests/README.md). */
export const ADVISORY_RULES = ['color-contrast']

export interface Exemption {
  /** axe rule id, for example `color-contrast` */
  rule: string
  /** CSS selector of the element the exemption applies to; omitted means every element */
  selector?: string
  /** why the legacy design forces it, with the inventory anchor */
  reason: string
}

export interface A11yOptions {
  allow?: Exemption[]
  advisory?: string[]
}

export interface A11yReport {
  blocking: Result[]
  advisory: Result[]
  exempted: Result[]
}

function matches(violation: Result, exemption: Exemption): boolean {
  if (violation.id !== exemption.rule) return false
  if (!exemption.selector) return true
  return violation.nodes.every((node) =>
    node.target.some((target) => String(target).includes(exemption.selector!)),
  )
}

/** Pure classification of axe violations into blocking, advisory and exempted (unit tested). */
export function classifyViolations(violations: Result[], options: A11yOptions = {}): A11yReport {
  const allow = options.allow ?? []
  const advisory = options.advisory ?? ADVISORY_RULES
  const report: A11yReport = { blocking: [], advisory: [], exempted: [] }
  for (const violation of violations) {
    if (allow.some((exemption) => matches(violation, exemption))) report.exempted.push(violation)
    else if (advisory.includes(violation.id)) report.advisory.push(violation)
    else report.blocking.push(violation)
  }
  return report
}

export function describeViolations(violations: Result[]): string {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help}\n  ${violation.nodes.map((node) => node.target.join(' ')).join('\n  ')}`,
    )
    .join('\n')
}

export async function expectNoA11yViolations(
  page: Page,
  options: A11yOptions = {},
): Promise<A11yReport> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  const report = classifyViolations(results.violations, options)
  if (report.advisory.length > 0) {
    await test.info().attach('a11y-advisory.txt', {
      body: describeViolations(report.advisory),
      contentType: 'text/plain',
    })
    console.warn(
      `advisory accessibility findings on ${page.url()}:\n${describeViolations(report.advisory)}`,
    )
  }
  expect(report.blocking, describeViolations(report.blocking)).toEqual([])
  return report
}
