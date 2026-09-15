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
 * A request that does not validate is refused in silence, as the legacy form refused it: it
 * rendered no errors at all, and giving it any is a decision of its own (section 13, entry 64).
 *
 * What does change is that switching from a multi-leg request to a round trip no longer throws
 * the other legs away: the legacy `remove` deleted them and the way back was never written
 * (section 7.1), so a visitor who looked at the return flight lost the itinerary they had typed.
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
  // What a multi-leg request had before the round trip put it aside, so it can be handed back.
  const [setAside, setSetAside] = useState<FlightRequest['legs']>([])

  const methods = useForm<FlightRequest>({
    resolver: zodResolver(flightRequestSchema),
    defaultValues: { legs: [emptyLeg()] },
  })
  const { control, handleSubmit } = methods
  const { append, fields, remove, replace } = useFieldArray({ control, name: 'legs' })

  const submit = (request: FlightRequest) => {
    methods.reset()
    router.push(handoffQuery(request.legs), { scroll: false })
  }

  const roundTrip = (round: boolean) => {
    const legs = methods.getValues('legs')

    if (round && legs.length > 1) {
      setSetAside(legs.slice(1))
      replace([legs[0]])
    }

    if (!round && setAside.length > 0) {
      replace([...legs, ...setAside].slice(0, MAX_LEGS))
      setSetAside([])
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
