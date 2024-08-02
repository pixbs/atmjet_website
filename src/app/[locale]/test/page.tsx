'use client'

import { getAirport } from "@/app/actions"
import { useLocale } from "next-intl"
import { useState } from "react"

export default function Page() {
    const [autocomplete, setAutocomplete] = useState<string[]>([])
    const locale = useLocale()
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const res = await getAirport(e.target.value, locale)
        console.log(locale)
        setAutocomplete(res)
    }

    return (
        <section>
            <div className="container">
                <input 
                    className="mt-20"
                    type="text" 
                    placeholder="Name" 
                    onChange={handleChange}
                />
                <ul>
                    {autocomplete.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </section>
    )
}