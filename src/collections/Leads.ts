import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { admin, hasRole } from '@/access'
import { ALL_LOCALES } from '@/i18n/locales'
import {
  deliveryStatus,
  isSubmittableEmail,
  isSubmittablePhone,
  LEAD_DELIVERY_CHANNELS,
  LEAD_DELIVERY_STATUSES,
  LEAD_FORM_TYPES,
  LEAD_NAME_MAX_LENGTH,
  LEAD_TAG_MAX_LENGTH,
  LEAD_TAGS_MAX,
  LEAD_PHONE_MAX_DIGITS,
  LEAD_PHONE_MIN_DIGITS,
} from '@/lib/leads'

/**
 * Puts a new lead on the queue that sends it to Telegram (issue #155). Only on create: the job
 * writes its attempt back onto the same document, and an update that queued another job would
 * send the lead again every time somebody looked at it.
 *
 * The job row is written through the same request, so it commits with the lead or not at all;
 * the queue itself is drained by the cron (`vercel.json`), because nothing can read the lead
 * until the transaction this hook runs inside has committed.
 */
const queueTelegramDelivery: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  await req.payload.jobs.queue({ task: 'sendTelegramLead', input: { leadId: doc.id }, req })

  return doc
}

/**
 * Leads (issue #68). The legacy site stored none: a submission became a Telegram message and, if
 * the send failed, an unhandled rejection (`docs/legacy-inventory.md` sections 7.2 and 9.1). This
 * is the record that was missing, with the delivery of each channel on the document so a lead
 * that did not arrive is visible rather than gone.
 *
 * It holds more personal data than anything else here — a name, a phone number, an e-mail address
 * and an itinerary — so it is administrators only on every operation, exactly like Contacts. The
 * server action of E9.4 writes through the Local API, which is not subject to access control, so
 * closing the collection to the REST and GraphQL APIs costs the forms nothing: nobody can create
 * a lead by posting to `/api/leads`, and nobody can read one back.
 *
 * The fields are the two legacy zod schemas (sections 7.1 and 7.2) plus the context the legacy
 * message carried in prose: the locale, the `showBooking` value and the page it came from.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    // What the desk looks at first (issue #154): when it came in, which button it came from,
    // who it is, how to reach them, and whether it arrived. Every one of these is indexed, so
    // the list can be filtered by any of them.
    defaultColumns: ['createdAt', 'source', 'name', 'phone', 'deliveryStatus'],
    group: 'People',
    description:
      'Form submissions and how they were delivered. Personal data: administrators only, and never rendered on the public site.',
    hidden: ({ user }) => !hasRole(user, 'admin'),
  },
  defaultSort: '-createdAt',
  hooks: { afterChange: [queueTelegramDelivery] },
  access: {
    // Not `authenticated`: a lead is a stranger's phone number and itinerary. The server action
    // creates them through the Local API, which does not go through this.
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: LEAD_NAME_MAX_LENGTH,
      admin: {
        description: `As submitted. The legacy form allowed ${LEAD_NAME_MAX_LENGTH} characters.`,
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
      validate: (value: unknown) =>
        isSubmittableEmail(value) || 'That is not an e-mail address the form would have accepted.',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      validate: (value: unknown) =>
        isSubmittablePhone(value) ||
        `A phone number needs between ${LEAD_PHONE_MIN_DIGITS} and ${LEAD_PHONE_MAX_DIGITS} digits, however it is punctuated.`,
      admin: {
        description:
          'As submitted, formatting included. The legacy message stripped the spaces on its way to Telegram; the original is kept here.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      maxRows: LEAD_TAGS_MAX,
      maxLength: LEAD_TAG_MAX_LENGTH,
      admin: {
        description:
          'The chips the visitor ticked. The legacy list was hard-coded per language (section 7.2).',
      },
    },
    {
      name: 'directions',
      type: 'array',
      label: 'Itinerary',
      admin: {
        description:
          'The legs, in the order they were entered. From the legacy `direction` query parameter, which carried this exact shape (section 7.6).',
      },
      fields: [
        { name: 'from', type: 'text' },
        { name: 'to', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'returnDate', type: 'text' },
        { name: 'passengers', type: 'number' },
        { name: 'guests', type: 'number' },
        { name: 'hours', type: 'number' },
      ],
    },
    {
      name: 'formType',
      type: 'select',
      required: true,
      index: true,
      options: LEAD_FORM_TYPES.map((type) => ({ label: type, value: type })),
      admin: { position: 'sidebar', description: 'Which form the visitor actually submitted.' },
    },
    {
      name: 'source',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'The ?showBooking= value that opened the dialog (Header, Empty-legs, Flight_request …), or the page when the form had none, as the inline contact form does.',
      },
    },
    {
      name: 'locale',
      type: 'select',
      index: true,
      options: ALL_LOCALES.map((locale) => ({ label: locale, value: locale })),
      admin: { position: 'sidebar', description: 'The language the visitor was reading.' },
    },
    {
      type: 'group',
      name: 'page',
      label: 'Page',
      fields: [
        { name: 'path', type: 'text' },
        { name: 'url', type: 'text' },
        { name: 'referrer', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'utm',
      label: 'Campaign',
      admin: { description: 'The utm_* parameters on the page the form was submitted from.' },
      fields: [
        { name: 'source', type: 'text', index: true },
        { name: 'medium', type: 'text' },
        { name: 'campaign', type: 'text', index: true },
        { name: 'term', type: 'text' },
        { name: 'content', type: 'text' },
      ],
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { description: 'As sent by the browser. Kept for spam triage, nothing else.' },
    },
    {
      name: 'deliveryStatus',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Worked out from the attempts below: failed if any channel failed, pending while any has not been sent.',
      },
      hooks: {
        beforeChange: [({ siblingData }) => deliveryStatus(siblingData?.delivery)],
      },
    },
    {
      name: 'delivery',
      type: 'array',
      label: 'Delivery',
      admin: {
        // Written by the job that sends the lead (issue #155), not by hand: a row an editor
        // could edit would say a lead had arrived when it had not.
        readOnly: true,
        description:
          'One row per channel, written by the queue. The legacy site had none of this: a failed send was an unhandled rejection and the lead was gone.',
      },
      fields: [
        {
          name: 'channel',
          type: 'select',
          required: true,
          options: LEAD_DELIVERY_CHANNELS.map((channel) => ({ label: channel, value: channel })),
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: LEAD_DELIVERY_STATUSES.map((status) => ({ label: status, value: status })),
        },
        { name: 'attempts', type: 'number', defaultValue: 0, min: 0 },
        { name: 'lastAttemptAt', type: 'date' },
        { name: 'deliveredAt', type: 'date' },
        {
          name: 'lastError',
          type: 'textarea',
          admin: { description: 'What the channel said when it refused, verbatim.' },
        },
      ],
    },
  ],
}
