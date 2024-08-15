'use server'

import { airports, db, emptyLegs } from '@/lib/drizzle'
import { eq, ilike } from 'drizzle-orm'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { EmptyLegCard } from '../elements'

export async function EmptyLegSection() {
	const t = await getTranslations('empty-leg')
	const locale = getLocale()
	

	const emptyLegsCards = await db.select().from(emptyLegs)

    const cardsWithAirports = await Promise.all(
        emptyLegsCards.map(async (card) => ({
            ...card,
            fromAirport: await findByICAO(card.from),
            toAirport: await findByICAO(card.to),
        }))
    )

	console.log(emptyLegsCards)
	return (
		<section className='bg-gray-150'>
			<div className='container gap-8 py-10 pt-10 lg:flex-row'>
				<div className='top-40 min-w-40 flex-shrink-0 gap-4 self-start lg:sticky lg:w-72'>
					<h2>{t('title')}</h2>
					<p>{t('description')}</p>
				</div>
				<div className='gap-4'>
                    {cardsWithAirports.map((card, index) => (
                        <EmptyLegCard
                            key={index}
                            {...card}
                        />
                    ))}
					<div className='card mt-4 items-start gap-4 border-0 bg-gradient-to-b from-gray-200 from-15% to-[#14323D] p-6 md:bg-fixed'>
						<h3>{t('telegram.title')}</h3>
						<p className='text-gray-900'>{t('telegram.description')}</p>
						<Link href='tg://resolve?domain=@atmjet1'>
							<button className='mt-2 bg-blue-500 text-gray-900'>{t('telegram.button')}</button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}

export default async function findByICAO(icao: string) {
	const airport = await db.select().from(airports).where(ilike(airports.icaoCode, `%${icao}%`)).limit(1)
	return airport[0].cityEng ?? 'N/A'
}