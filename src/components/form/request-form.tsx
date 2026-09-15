'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/cn'
import {
  emptyLeg,
  flightRequestSchema,
  handoffQuery,
  MAX_LEGS,
  type FlightRequest,
} from '@/lib/flight-request'

import { Direction } from './direction'

/**
 * The flight request (issue #151, `docs/legacy-inventory.md` section 7.1): up to four legs, or
 * one leg there and back, handed to the booking dialog with the legs in the query.
 *
 * Two of its habits are reproduced rather than fixed, both recorded in section 13 as decisions
 * of their own: a request that does not validate is refused in silence, the legacy form having
 * rendered no errors at all (entry 64), and switching to a round trip throws away every leg but
 * the first, with nothing to bring them back (entry 65).
 *
 * The buttons carry only the colours the legacy gave them; the shape is the parity layer's
 * `button` rule, as it was on the legacy site.
 */
const SECONDARY = 'border border-graphite-800 bg-graphite-900 text-white'

export function RequestForm({
  locale,
  label,
  className,
}: {
  locale: Locale
  /** The wording of the submit button where a section asks for its own. */
  label?: string
  /** Goes on the submit buttons, as the legacy `buttonClassName` did. */
  className?: string
}) {
  const t = useTranslations('form')
  const router = useRouter()
  const [isRoundTrip, setIsRoundTrip] = useState(false)

  const methods = useForm<FlightRequest>({
    resolver: zodResolver(flightRequestSchema),
    defaultValues: { legs: [emptyLeg()] },
  })
  const { control, handleSubmit } = methods
  const { append, fields, remove } = useFieldArray({ control, name: 'legs' })

  const submit = (request: FlightRequest) => {
    methods.reset()
    router.push(handoffQuery(request.legs), { scroll: false })
  }

  const roundTrip = (round: boolean) => {
    // Every leg after the first goes, and switching back does not bring it back: the legacy
    // `remove([1..n])` with no counterpart, which section 13 entry 65 marks `keep`.
    if (round && fields.length > 1) {
      remove(Array.from({ length: fields.length - 1 }, (_, index) => index + 1))
    }

    setIsRoundTrip(round)
  }

  const submitLabel = label ?? t('requestQuote')

  return (
    <FormProvider {...methods}>
      <form
        className="flex w-full flex-col gap-6 lg:gap-3"
        data-section="request-form"
        onSubmit={handleSubmit(submit)}
      >
        {fields.map((field, index) => (
          <div className="flex flex-col gap-2 lg:flex-row" key={field.id}>
            <Direction index={index} locale={locale} showReturn={isRoundTrip} />
            {index > 0 && (
              <button
                className={cn(SECONDARY, 'self-end lg:h-14 lg:w-48')}
                onClick={() => remove(index)}
                type="button"
              >
                {t('deleteLeg')}
              </button>
            )}
            {index === 0 && (
              <button
                className={cn(
                  buttonVariants(),
                  'hidden w-48 lg:flex lg:items-center lg:justify-center',
                  className,
                )}
                type="submit"
              >
                {submitLabel}
              </button>
            )}
          </div>
        ))}
        <div className="flex-row flex-wrap justify-between gap-4">
          {/* The legacy drew the chosen one as the quieter of the two, and the one on offer as
              the brighter; reproduced rather than corrected. */}
          <div className="flex-row gap-1 rounded-full border border-graphite-500 p-0.5">
            <button
              aria-pressed={!isRoundTrip}
              className={
                isRoundTrip ? 'bg-graphite-900 text-white' : 'bg-graphite-800 text-graphite-100'
              }
              onClick={() => roundTrip(false)}
              type="button"
            >
              {t('multiLeg')}
            </button>
            <button
              aria-pressed={isRoundTrip}
              className={
                isRoundTrip ? 'bg-graphite-800 text-graphite-100' : 'bg-graphite-900 text-white'
              }
              onClick={() => roundTrip(true)}
              type="button"
            >
              {t('roundTrip')}
            </button>
          </div>
          {fields.length < MAX_LEGS && !isRoundTrip && (
            <button
              className={cn(SECONDARY, 'self-start')}
              onClick={() => append(emptyLeg())}
              type="button"
            >
              {t('addLeg')}
            </button>
          )}
        </div>
        <button
          className={cn(buttonVariants({ size: 'big' }), 'lg:hidden', className)}
          type="submit"
        >
          {submitLabel}
        </button>
      </form>
    </FormProvider>
  )
}
