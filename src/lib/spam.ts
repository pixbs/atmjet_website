/**
 * What tells a visitor from a script (issue #157, decided 2026-09-13: invisible measures only —
 * a honeypot, a floor under how fast a form can be filled in, and a limit per address). A
 * captcha was ruled out because it would change what every form looks like, which hard rule 6
 * does not allow.
 *
 * None of this is proof against somebody who reads the page and writes a request by hand: the
 * elapsed time is the browser's word for it, and a server action is a public endpoint whatever
 * posts to it. It is here for the scripts that fill in every field they find and post as fast
 * as they can, which is what a form on a public site actually receives.
 */

/**
 * The field a person never sees. Named so that no browser recognises it: a honeypot called
 * `company` or `address` is one an address autofill fills in, and the visitor whose browser
 * filled it is then the one refused.
 */
export const HONEYPOT_FIELD = 'reference'

/**
 * The floor under how long a form is on screen before it is sent. Two seconds is below any real
 * visitor — the legacy form asked for a name, a telephone number and an address, and reaching
 * the send button alone takes longer — and above what a script that posts the moment the page
 * arrives spends.
 */
const MIN_FILL_MS = 2_000

/**
 * How many submissions one address may make, and over how long. Ten an hour is far above what
 * an office behind one address sends and far below a flood; the address is shared by everyone
 * behind a company's network, so a tighter limit would refuse the wrong people.
 */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000

/** Addresses kept at once, so a flood cannot grow the map without bound. */
const MAX_TRACKED = 10_000

/** Why a submission was refused; `null` is a submission to write down. */
export type SpamReason = 'honeypot' | 'too-fast' | 'too-many'

/** What the browser says about how the form was filled in. */
export interface FillEvidence {
  /** The honeypot's value. Anything at all in it is a script. */
  trap?: string
  /**
   * Milliseconds between the form appearing and the visitor sending it, where the browser said.
   * Absent where it said nothing believable — a tab open since yesterday, most of all.
   */
  elapsedMs?: number
}

export function looksAutomated({ trap, elapsedMs }: FillEvidence): SpamReason | null {
  if ((trap ?? '') !== '') return 'honeypot'
  // No reading is no evidence, and no evidence is not a reason to refuse somebody: a tab left
  // open overnight sends nothing believable, and the honeypot and the limit still stand over it.
  if (elapsedMs !== undefined && elapsedMs < MIN_FILL_MS) return 'too-fast'

  return null
}

/**
 * A sliding window per address, held in memory. Each server instance keeps its own, so this
 * caps a burst down one connection rather than a campaign spread over many; the database is
 * deliberately not involved, because an address is personal data and this is the one place
 * that has to see one (issue #157 asks for rejections logged without any).
 */
export function createSubmissionLimiter(
  limit: number = RATE_LIMIT,
  windowMs: number = RATE_WINDOW_MS,
) {
  const seen = new Map<string, number[]>()

  return {
    /** Records the attempt and says whether it is within the limit. */
    allows(address: string, now: number = Date.now()): boolean {
      const recent = (seen.get(address) ?? []).filter((at) => now - at < windowMs)

      if (recent.length >= limit) {
        seen.set(address, recent)
        return false
      }

      // The oldest addresses go first: everything they did is outside the window by now.
      if (!seen.has(address) && seen.size >= MAX_TRACKED) {
        for (const [key, attempts] of seen) {
          if (attempts.every((at) => now - at >= windowMs)) seen.delete(key)
        }
      }

      seen.set(address, [...recent, now])
      return true
    },
  }
}

/** The machine the site is running on, which is every request in a local run and a test run. */
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'])

/**
 * The address a request came from, as the proxy in front of the site reports it.
 *
 * An empty string where nothing does, and where what does is the loopback address: the limit is
 * then not applied at all, rather than counting every visitor into one bucket and refusing the
 * eleventh person of the hour. Loopback means there is no proxy in front — a local run, or a
 * test run — and in production the proxy replaces whatever a client claims, so nothing is given
 * away by ignoring it.
 */
export function addressOf(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for') ?? ''
  const first = forwarded.split(',')[0]?.trim() ?? ''
  const address = first === '' ? (headers.get('x-real-ip') ?? '').trim() : first

  return LOOPBACK.has(address) ? '' : address
}
