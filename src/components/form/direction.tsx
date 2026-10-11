'use client'

import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { AirportSearch } from '@/components/ui/airport-search'
import { CounterInput } from '@/components/ui/counter-input'
import { Input } from '@/components/ui/input'
import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/cn'
import type { FlightRequest } from '@/lib/flight-request'

/**
 * One leg of a flight request (issue #151, `docs/legacy-inventory.md` section 7.1): where it
 * starts, where it ends, when, and how many people are on it.
 *
 * The four controls are the shared field primitives rather than four hand-built boxes: the
 * legacy leg positioned its own labels absolutely, with no `htmlFor` on any of them, so a
 * screen reader read four unnamed fields and a click on a label focused nothing (issue #96).
 *
 * The first and last fields round themselves, as the legacy ones did: a box clipping the leg to
 * round it clips the airport list under the field too (#441).
 */

/** Only the two airports are given a floor: the counter has to keep the width of its own row. */
const AIRPORT = 'lg:h-full lg:min-w-40'

/** Top and bottom when stacked, left and right in a row; the airport panel clips its input. */
const FIRST = 'overflow-hidden rounded-t-xl lg:rounded-none lg:rounded-l-xl'
const LAST = 'rounded-b-xl lg:rounded-none lg:rounded-r-xl'

export function Direction({
  index,
  locale,
  showReturn = false,
}: {
  index: number
  locale: Locale
  /** The round trip asks when it comes back instead of offering another leg. */
  showReturn?: boolean
}) {
  const t = useTranslations('form')
  const { control } = useFormContext<FlightRequest>()

  return (
    <div className="w-full content-stretch items-stretch justify-stretch gap-0.5 rounded-xl lg:flex-row">
      <Controller
        control={control}
        name={`legs.${index}.from`}
        render={({ field }) => (
          <AirportSearch
            id={`leg-${index}-from`}
            label={t('from')}
            locale={locale}
            onChange={field.onChange}
            value={field.value}
            wrapperClassName={cn(AIRPORT, FIRST)}
          />
        )}
      />
      <Controller
        control={control}
        name={`legs.${index}.to`}
        render={({ field }) => (
          <AirportSearch
            id={`leg-${index}-to`}
            label={t('to')}
            locale={locale}
            onChange={field.onChange}
            value={field.value ?? ''}
            wrapperClassName={AIRPORT}
          />
        )}
      />
      <Controller
        control={control}
        name={`legs.${index}.date`}
        render={({ field }) => (
          <Input
            id={`leg-${index}-date`}
            // The legacy asked "When" on a round trip and "Date" on a one-way leg.
            label={showReturn ? t('when') : t('date')}
            type="date"
            wrapperClassName="lg:h-full"
            {...field}
          />
        )}
      />
      {showReturn && (
        <Controller
          control={control}
          name={`legs.${index}.returnDate`}
          render={({ field }) => (
            <Input
              id={`leg-${index}-return`}
              label={t('returnDate')}
              type="date"
              wrapperClassName="lg:h-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      )}
      <Controller
        control={control}
        name={`legs.${index}.passengers`}
        render={({ field }) => (
          <CounterInput
            id={`leg-${index}-passengers`}
            label={t('passengers')}
            onValueChange={field.onChange}
            value={field.value}
            wrapperClassName={cn('lg:h-full', LAST)}
          />
        )}
      />
    </div>
  )
}
