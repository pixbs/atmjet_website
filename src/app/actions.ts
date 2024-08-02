'use server'

import { airports, db } from '@/lib/drizzle'
import { like, or } from 'drizzle-orm'

export async function getAirport(str : string, locale: string) {

    const query = await db.select()
            .from(airports)
            .where(
                or(
                    like(airports.cityEng, `%${str}%`),
                    like(airports.cityRus, `%${str}%`),
                    like(airports.countryEng, `%${str}%`),
                    like(airports.countryRus, `%${str}%`),
                    like(airports.nameEng, `%${str}%`),
                    like(airports.nameRus, `%${str}%`),
                    like(airports.iataCode, `%${str}%`),
                    like(airports.icaoCode, `%${str}%`)
                )
            )
            .limit(10)
    
    if (locale === 'ru' || locale === 'uk') {
        return query.map((item) => `${item.nameRus ? item.nameRus : item.nameEng} ( ${item.iataCode} ) ${item.countryRus}, ${item.cityRus}`)
    } else {
        return query.map((item) => `${item.nameEng} ( ${item.iataCode} ) ${item.countryEng}, ${item.cityEng}`)
    }
}