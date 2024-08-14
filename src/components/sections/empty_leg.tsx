'use server'

import { airports, db, emptyLegs } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { EmptyLegCard } from '../elements'

export async function EmptyLegSection() {
	const t = await getTranslations('empty-leg')
	const locale = getLocale()
	const cards = ['card1', 'card2', 'card3', 'card4']
	const calucalateDuration = (start?: Date, end?: Date) => {
		if (!start || !end) return 'N/A'
		const diff = end.getTime() - start.getTime()
		const hours = Math.floor(diff / 1000 / 60 / 60)
		const minutes = Math.floor((diff / 1000 / 60 / 60 - hours) * 60)
		return `${hours}h / direct`
	}

	const findByICAO = async (icao: string) => {
		const airport = await db.select().from(airports).where(eq(airports.icaoCode, icao)).limit(1)
		return airport[0].nameEng ?? 'N/A'
	}
	const realCards = await db.select().from(emptyLegs).orderBy(emptyLegs.order)
	return (
		<section className='bg-gray-150'>
			<div className='container gap-8 py-10 pt-10 lg:flex-row'>
				<div className='top-40 min-w-40 flex-shrink-0 gap-4 self-start lg:sticky lg:w-72'>
					<h2>{t('title')}</h2>
					<p>{t('description')}</p>
				</div>
				<div className='gap-4'>
					{realCards.map((card, index) => (
						<EmptyLegCard
							date={`${new Date(card.start).toLocaleDateString(`en-US`, { month: 'long', day: 'numeric', year: 'numeric' })}`}
							price={`$${card.price?.toLocaleString() ?? 'N/A'}`}
							initalPrice={'$' + ((card.price ? card.price : 0) * 4).toLocaleString() ?? 'N/A'}
							discountPercent={'-75%'}
							from={card.from}
							to={card.to}
							fromTime={new Date(card.start).toLocaleTimeString(`en-US`, {
								hour: 'numeric',
								minute: 'numeric',
							})}
							toTime={new Date(card.end).toLocaleTimeString(`en-US`, {
								hour: 'numeric',
								minute: 'numeric',
							})}
							fromAirport={card.from}
							toAirport={card.to}
							howLong={calucalateDuration(card.start, card.end)}
							key={index.toString()}
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
