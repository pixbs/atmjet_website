'use client'

import { useCallback, useState } from 'react'

import { Autocomplete } from '@/components/ui/autocomplete'
import { airportOption } from '@/lib/airports'

/**
 * Stands in for the airport search behind the fixture's Autocomplete (issue #107). The endpoint
 * arrives with E9.9; until then the field is fed from a handful of rows here, which is enough
 * to show the list, the keyboard and the option format.
 */
const AIRPORTS = [
  { city: 'Dubai', country: 'United Arab Emirates', label: 'Dubai International', icao: 'OMDB' },
  { city: 'Dubai', country: 'United Arab Emirates', label: 'Al Maktoum', icao: 'OMDW' },
  { city: 'Paris', country: 'France', label: 'Le Bourget', icao: 'LFPB' },
  { city: 'Paris', country: 'France', label: 'Charles de Gaulle', icao: 'LFPG' },
  { city: 'London', country: 'United Kingdom', label: 'Luton', icao: 'EGGW' },
  // No ICAO, so the list falls back to the IATA code.
  { city: 'Geneva', country: 'Switzerland', label: 'Cointrin', iata: 'gva' },
]

const OPTIONS = AIRPORTS.map(airportOption)

export function AirportSearch({ label, id }: { label: string; id: string }) {
  const [options, setOptions] = useState<readonly string[]>([])

  const search = useCallback((term: string) => {
    const wanted = term.toLowerCase()
    setOptions(OPTIONS.filter((option) => option.toLowerCase().includes(wanted)))
  }, [])

  return <Autocomplete id={id} label={label} onSearch={search} options={options} />
}
