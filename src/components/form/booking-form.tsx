'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

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
    })

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

  return (
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
      <button className="big self-center px-24!" disabled={isSubmitting} type="submit">
        {t('send')}
      </button>
      {/* The legacy confirm view existed and nothing ever set the query that showed it
          (section 13, entry 59); saying so here is what E9.8 builds on. */}
      {isSent && (
        <p className="text-center text-white" role="status">
          {t('sent')}
        </p>
      )}
    </form>
  )
}
