'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { AirportSearch } from '@/components/ui/airport-search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Locale } from '@/i18n/locales'
import { emptyLeg, handoffQuery } from '@/lib/flight-request'

/**
 * The form a detail page asks for one aircraft with (issue #138,
 * `docs/legacy-inventory.md` section 4, `/aircraft/[id]` item 1): where from, where to, when,
 * and a button that names the aircraft.
 *
 * It hands the leg to the booking dialog through the same query every other form uses, which is
 * where the legacy version went wrong: its server action wrote `showBooking=Yachts` on an
 * aircraft page, so a lead left here arrived saying it came from the yachts (section 13, entry
 * 30). The dialog is told the page it was opened from instead.
 */
export interface VehicleRequestProps {
  locale: Locale
  /** What the booking dialog records the lead as having come from. */
  source: string
  labels: { from: string; to: string; date: string; submit: string }
}

export function VehicleRequest({ locale, source, labels }: VehicleRequestProps) {
  const router = useRouter()
  const [leg, setLeg] = useState(emptyLeg)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push(handoffQuery([leg], source), { scroll: false })
  }

  return (
    <form className="flex flex-col gap-8" data-section="vehicle-request" onSubmit={submit}>
      <div className="flex flex-col gap-0.5 rounded-2xl">
        <AirportSearch
          id="request-from"
          label={labels.from}
          locale={locale}
          onChange={(from) => setLeg((asked) => ({ ...asked, from }))}
          value={leg.from}
          wrapperClassName="overflow-hidden rounded-t-2xl"
        />
        <AirportSearch
          id="request-to"
          label={labels.to}
          locale={locale}
          onChange={(to) => setLeg((asked) => ({ ...asked, to }))}
          value={leg.to ?? ''}
        />
        <Input
          id="request-date"
          label={labels.date}
          onChange={(event) => setLeg((asked) => ({ ...asked, date: event.target.value }))}
          type="date"
          value={leg.date}
          wrapperClassName="overflow-hidden rounded-b-2xl"
        />
      </div>
      <Button className="px-8 py-6" type="submit">
        {labels.submit}
      </Button>
    </form>
  )
}
