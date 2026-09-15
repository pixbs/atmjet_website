'use server'

import { headers } from 'next/headers'

import { campaignOf, submissionSchema, type LeadSubmission } from '@/lib/booking'

import { getPayloadClient } from './payload'

/**
 * Writing a lead down (issues #152 and #154, `docs/legacy-inventory.md` section 9.1).
 *
 * The legacy site stored nothing: a submission became a Telegram message and, if the send
 * failed, an unhandled rejection, so a lost lead was simply lost. Here the lead is written
 * first and the sending is a job the collection's hook queues (issue #155), which is what makes
 * a failed delivery something an administrator can see rather than something nobody knows about.
 *
 * Written through the Local API, which does not go through access control: the collection is
 * closed to the REST and GraphQL APIs precisely so that nothing but this can create one.
 */

/** As much of a browser's own description of itself as is worth keeping for spam triage. */
const USER_AGENT_MAX = 512

export async function submitLead(submission: LeadSubmission): Promise<{ ok: boolean }> {
  // A server action is a public endpoint whatever calls it, so nothing here is taken on trust.
  const parsed = submissionSchema.safeParse(submission)
  if (!parsed.success) return { ok: false }

  const { values, formType, source, locale, url, directions } = parsed.data
  const request = await headers()
  const page = URL.canParse(url) ? new URL(url) : undefined

  try {
    const payload = await getPayloadClient()

    await payload.create({
      collection: 'leads',
      data: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        tags: values.tags ?? [],
        directions: directions ?? [],
        formType,
        source,
        locale,
        page: {
          path: page?.pathname,
          url: page?.href,
          referrer: request.get('referer') ?? undefined,
        },
        utm: campaignOf(url),
        userAgent: request.get('user-agent')?.slice(0, USER_AGENT_MAX),
      },
      overrideAccess: true,
    })

    return { ok: true }
  } catch (error) {
    // The visitor is told the same thing either way; what went wrong belongs in the log.
    console.error('[leads] the submission could not be stored.', error)

    return { ok: false }
  }
}
