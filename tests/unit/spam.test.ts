import { describe, expect, it } from 'vitest'

import { addressOf, createSubmissionLimiter, looksAutomated } from '@/lib/spam'

/**
 * What tells a visitor from a script (issue #157, decided 2026-09-13: invisible measures only).
 * Nothing here reads a constant: what matters is which submissions are refused and which get
 * through, so the floor is found by asking rather than by importing it.
 */
const filled = (elapsedMs: number, trap?: string) => looksAutomated({ elapsedMs, trap })

/** The shortest fill the measures let through, found by asking rather than by importing it. */
function shortestAccepted(): number {
  for (let ms = 0; ms <= 60_000; ms += 100) if (filled(ms) === null) return ms

  return Number.POSITIVE_INFINITY
}

describe('the honeypot', () => {
  it('refuses a submission that filled in the field nothing shows', () => {
    expect(filled(30_000, 'ATM JET')).toBe('honeypot')
  })

  it('lets through a submission that left it alone, however it arrived empty', () => {
    expect(filled(30_000, '')).toBeNull()
    expect(filled(30_000, undefined)).toBeNull()
  })
})

describe('how fast a form can be filled in', () => {
  it('refuses a form sent the instant it was reached', () => {
    expect(filled(0)).toBe('too-fast')
  })

  it('lets through a visitor who was not hurrying', () => {
    expect(filled(30_000)).toBeNull()
  })

  it('leaves the floor well below the time three fields take to type', () => {
    // A visitor who is quick still spends seconds on a name, a number and an address; a floor
    // near that would refuse them, which costs a real lead rather than a script.
    expect(shortestAccepted()).toBeLessThanOrEqual(5_000)
    expect(shortestAccepted()).toBeGreaterThan(0)
  })
})

describe('how many one address may send', () => {
  it('lets an ordinary run of enquiries through and stops a flood', () => {
    const limiter = createSubmissionLimiter(3, 60_000)

    expect([1, 2, 3].map(() => limiter.allows('203.0.113.1', 1_000))).toEqual([true, true, true])
    expect(limiter.allows('203.0.113.1', 1_000)).toBe(false)
  })

  it('counts each address on its own, so one flood does not shut out everybody', () => {
    const limiter = createSubmissionLimiter(1, 60_000)
    limiter.allows('203.0.113.1', 1_000)

    expect(limiter.allows('203.0.113.1', 1_000)).toBe(false)
    expect(limiter.allows('198.51.100.7', 1_000)).toBe(true)
  })

  it('forgets what is older than the window, so the same visitor may come back', () => {
    const limiter = createSubmissionLimiter(1, 60_000)
    limiter.allows('203.0.113.1', 1_000)

    expect(limiter.allows('203.0.113.1', 30_000)).toBe(false)
    expect(limiter.allows('203.0.113.1', 62_000)).toBe(true)
  })
})

describe('the address a request came from', () => {
  it('takes the first of the chain the proxy wrote, which is the visitor', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.1, 70.41.3.18, 150.172.238.178' })

    expect(addressOf(headers)).toBe('203.0.113.1')
  })

  it('falls back to the other header a proxy may write instead', () => {
    expect(addressOf(new Headers({ 'x-real-ip': '203.0.113.9' }))).toBe('203.0.113.9')
  })

  it('says nothing where nothing does, so the limit is left off rather than shared', () => {
    // One bucket for every visitor would refuse the eleventh person of the hour, whoever
    // they are.
    expect(addressOf(new Headers())).toBe('')
  })

  it('says nothing for the loopback address, which is a machine talking to itself', () => {
    // No proxy in front means a local run or a test run, and every request of it is one
    // address; in production the proxy replaces whatever a client claims.
    expect(addressOf(new Headers({ 'x-forwarded-for': '127.0.0.1' }))).toBe('')
    expect(addressOf(new Headers({ 'x-real-ip': '::1' }))).toBe('')
  })
})
