'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { handoffQuery } from '@/lib/flight-request'

/**
 * The form a yacht's page asks for it with (issue #140, `docs/legacy-inventory.md` section 4,
 * `/yachts/[id]` item 1): where it lies, when, for how many hours and how many guests.
 *
 * Two of the legacy fields did not do what they looked like doing:
 *
 * - `from` was a `disabled` input, and a disabled control is not submitted, so the harbour the
 *   visitor could see was missing from the message that reached the office (section 13, entry
 *   47). It is read-only here: unchangeable, and sent.
 * - the guests field opened on the minimum number of *hours*, a copy-paste from the field beside
 *   it (entry 46). It opens on one guest, which is its own minimum.
 */
export interface YachtRequestProps {
  /** Where the yacht lies; the field shows it and cannot be edited, as the legacy one could not. */
  location: string
  /** The shortest charter the owner takes, which is what the hours field opens on. */
  minHours: number
  /** The most it sleeps by day; the legacy fell back to ten where nobody had said. */
  maxGuests: number
  /** `4,500 AED / Hour`, composed by the page from the price and the currency. */
  price?: string
  /** What the booking dialog records the lead as having come from. */
  source: string
  labels: { from: string; date: string; hours: string; guests: string; submit: string }
}

export function YachtRequest({
  location,
  minHours,
  maxGuests,
  price,
  source,
  labels,
}: YachtRequestProps) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [hours, setHours] = useState(minHours)
  const [guests, setGuests] = useState(1)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push(handoffQuery([{ from: location, date, hours, guests }], source), { scroll: false })
  }

  return (
    <form className="flex flex-col gap-8" data-section="yacht-request" onSubmit={submit}>
      <div className="flex flex-col gap-0.5 overflow-hidden rounded-2xl">
        <Input
          className="cursor-not-allowed bg-graphite-100 text-graphite-500"
          id="request-from"
          label={labels.from}
          readOnly
          value={location}
        />
        <Input
          id="request-date"
          label={labels.date}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
        <div className="gap-0.5 md:flex-row">
          <Input
            id="request-hours"
            label={labels.hours}
            min={minHours}
            onChange={(event) => setHours(Number(event.target.value))}
            type="number"
            value={hours}
          />
          <Input
            id="request-guests"
            label={labels.guests}
            max={maxGuests}
            min={1}
            onChange={(event) => setGuests(Number(event.target.value))}
            type="number"
            value={guests}
          />
        </div>
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <Button className="self-start px-8 py-6" type="submit">
          {labels.submit}
        </Button>
        {price !== undefined && price !== '' && <p>{price}</p>}
      </div>
    </form>
  )
}
