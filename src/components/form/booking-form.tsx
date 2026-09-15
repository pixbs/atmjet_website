'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Checkmark } from '@/components/icons'
import { PhoneInput, type PhoneInputProps } from '@/components/ui/phone-input'
import type { Locale } from '@/i18n/locales'
import { bookingSchema, parseDirections, type Booking } from '@/lib/booking'
import { cn } from '@/lib/cn'
import { submitLead } from '@/lib/data/leads'
import type { LEAD_FORM_TYPES } from '@/lib/leads'

/**
 * The form that turns a visitor into a lead (issue #152, `docs/legacy-inventory.md` section
 * 7.2): a name, a telephone number, an address, the chips they ticked, and a button.
 *
 * The legacy form sent a Telegram message from the browser and kept no record, so a send that
 * failed took the lead with it (section 13, entry 62). Here the submission is a server action
 * that writes the lead down first; the sending is the queue's job (issue #155).
 *
 * The validation is the legacy's, down to when it speaks: `onBlur`, and a field says what is
 * wrong with it only once it has been left (`touchedFields && errors`).
 *
 * What it says when it is done is issue #158. The legacy confirm view existed and nothing ever
 * set the query that showed it, so no visitor ever saw one (section 13, entry 59); it is what
 * a sent form becomes here. A failed send said nothing at all — the dialog closed either way
 * and the error went out as an unhandled rejection — so the visitor was told their enquiry had
 * arrived when it had not. That one has no legacy markup to copy, because there was none.
 */
const FIELD =
  'w-full border-b bg-transparent px-4 py-2 text-sm text-white placeholder-graphite-400 focus:outline-hidden'

const CHIP =
  'cursor-pointer rounded-full border border-graphite-700 px-5 py-2 font-semibold uppercase transition-colors hover:border-graphite-100 peer-checked:border-transparent peer-checked:bg-gold peer-checked:text-graphite-900'

export function BookingForm({
  locale,
  defaultCountry,
  formType,
  source,
  tags = [],
  className,
}: {
  locale: Locale
  /** Where the phone field opens, resolved from the request on the server (issue #160). */
  defaultCountry: PhoneInputProps['defaultCountry']
  /** Which form this is, for the record the lead keeps (issue #68). */
  formType: (typeof LEAD_FORM_TYPES)[number]
  /** What the lead is traced back to where no button opened the form, as the inline one is. */
  source?: string
  /** The chips a visitor may tick. The legacy list was hard-coded per language (section 7.2). */
  tags?: readonly string[]
  className?: string
}) {
  const t = useTranslations('booking')
  const chipId = useId()
  const [isSent, setIsSent] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const {
    control,
    formState: { errors, isSubmitting, touchedFields },
    handleSubmit,
    register,
    reset,
  } = useForm<Booking>({
    resolver: zodResolver(bookingSchema),
    // The legacy timing: a field is judged when it is left, not while it is being typed.
    mode: 'onBlur',
    defaultValues: { name: '', email: '', phone: '', tags: [] },
  })

  const submit = async (values: Booking) => {
    // The query is read here rather than through `useSearchParams`, which would make the whole
    // page render on the client unless every caller wrapped this in a Suspense boundary.
    const query = new URLSearchParams(window.location.search)
    const { ok } = await submitLead({
      values,
      formType,
      // The legacy carried the name of the button that opened the form (section 3.9); a form
      // nothing opened sent an empty string, so this one says where it stands instead.
      source: query.get('showBooking') ?? source,
      locale,
      url: window.location.href,
      directions: parseDirections(query.get('direction')),
      // A refusal and a connection that never arrived are the same thing to the visitor: the
      // enquiry is not away yet, and the button says so.
    }).catch(() => ({ ok: false }))

    setHasFailed(!ok)
    if (!ok) return

    reset()
    setIsSent(true)
  }

  /**
   * The legacy timing, and the legacy wording: a field says what is wrong with it only once it
   * has been left (`touchedFields && errors`). The three messages were English on a site served
   * in three languages (section 10.4); here they are in the language being read.
   */
  const shows = (field: keyof Booking) => touchedFields[field] === true && Boolean(errors[field])

  // The legacy confirm view, in place of the form rather than under it: the legacy returned
  // these two elements instead of the form, and nothing ever reached the branch that did.
  if (isSent)
    return (
      <>
        <h2
          className="text-center text-white"
          data-section="booking-form"
          data-state="sent"
          role="status"
        >
          {t('sent')}
        </h2>
        <Checkmark className="mx-auto my-10 h-20 text-orange-200" />
      </>
    )

  return (
    // The heading stands beside the form rather than inside it, as the legacy returned the two:
    // the room under it belongs to whatever holds them — a wide gap in the dialog and none in
    // the contact card — and the form's own gap is the one between its fields (issue #345).
    <>
      <h2 className="text-center text-white">{t('title')}</h2>
      <form
        className={cn('flex w-full flex-col gap-6', className)}
        data-section="booking-form"
        // The legacy form asked the browser not to validate it: the rules are zod's.
        noValidate
        onSubmit={handleSubmit(submit)}
      >
        <div className="gap-1">
          <label className="text-sm text-white" htmlFor={`${chipId}-name`}>
            {t('name')}
          </label>
          <input
            className={cn(FIELD, shows('name') ? 'border-red-500' : 'border-graphite-400')}
            id={`${chipId}-name`}
            placeholder={t('namePlaceholder')}
            type="text"
            {...register('name')}
          />
          {shows('name') && <p className="mt-1 text-xs text-red-500">{t('nameRequired')}</p>}
        </div>
        <div className="gap-1">
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                defaultCountry={defaultCountry}
                id={`${chipId}-phone`}
                invalid={shows('phone')}
                label={t('phone')}
                labels={{
                  countries: t('countries'),
                  noResults: t('noResults'),
                  search: t('search'),
                }}
                locale={locale}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
          {shows('phone') && <p className="mt-1 text-xs text-red-500">{t('phoneInvalid')}</p>}
        </div>
        <div className="gap-1">
          <label className="text-sm text-white" htmlFor={`${chipId}-email`}>
            {t('email')}
          </label>
          <input
            className={cn(FIELD, shows('email') ? 'border-red-500' : 'border-graphite-400')}
            id={`${chipId}-email`}
            placeholder={t('emailPlaceholder')}
            type="email"
            {...register('email')}
          />
          {shows('email') && <p className="mt-1 text-xs text-red-500">{t('emailInvalid')}</p>}
        </div>
        {tags.length > 0 && (
          <div className="flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag}>
                <input
                  className="peer sr-only"
                  id={`${chipId}-${tag}`}
                  type="checkbox"
                  value={tag}
                  {...register('tags')}
                />
                <label className={CHIP} htmlFor={`${chipId}-${tag}`}>
                  {tag}
                </label>
              </div>
            ))}
          </div>
        )}
        {/* The legacy said nothing when a send failed and closed the dialog anyway, so a lead
          that never arrived looked exactly like one that did (section 13, entry 59). The form
          keeps what was typed, so sending again is pressing the button again. */}
        {hasFailed && (
          <p className="text-center text-sm text-red-500" role="alert">
            {t('failed')}
          </p>
        )}
        <button className="big self-center px-24!" disabled={isSubmitting} type="submit">
          {hasFailed ? t('tryAgain') : t('send')}
        </button>
      </form>
    </>
  )
}
