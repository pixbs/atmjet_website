'use server'

import { airports, db, emptyLegs } from '@/lib/drizzle'
import { ilike } from 'drizzle-orm'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { EmptyLegCard } from '../elements'

export async function EmptyLegSection() {
	const t = await getTranslations('empty-leg')
	const locale = getLocale()

	const emptyLegsCards =
		(await db
			.select()
			.from(emptyLegs)
			.catch(() => [])) || []

	const cardsWithAirports = (
		await Promise.all(
			emptyLegsCards.map(async (card) => {
				try {
					const fromAirport = await findByICAO(card.from)
					const toAirport = await findByICAO(card.to)
					if (!fromAirport || !toAirport) {
						throw new Error('Airport not found')
					}
					return {
						...card,
						fromAirport,
						toAirport,
					}
				} catch {
					return null
				}
			}),
		)
	).filter((card) => card !== null)
	return (
		<section className='bg-gray-150'>
			<div className='container gap-8 py-10 pt-10 lg:flex-row'>
				<div className='top-40 min-w-40 flex-shrink-0 gap-4 self-start lg:sticky lg:w-72'>
					<h2>{t('title')}</h2>
					<p>{t('description')}</p>
				</div>
				<div className='gap-4'>
					{cardsWithAirports.map((card, index) => (
						<EmptyLegCard key={index} {...card} />
					))}
					<div className='card mt-4 items-start gap-4 border-0 bg-gradient-to-b from-gray-200 from-15% to-[#14323D] p-6 md:bg-fixed'>
						<h3>{t('telegram.title')}</h3>
						<p className='text-gray-900'>{t('telegram.description')}</p>
						<Link href='tg:\\nesolve?domain=@atmjet1'>
							<button className='big mt-2 bg-blue-600 text-gray-900'>{t('telegram.button')}</button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}

export default async function findByICAO(icao: string) {
	const airport = await db
		.select()
		.from(airports)
		.where(ilike(airports.icaoCode, `%${icao}%`))
		.limit(1)
	const city = airport[0]?.cityEng ? airport[0].cityEng : ''
	const country = airport[0]?.countryEng ? airport[0].countryEng : ''
	if (city === '' && country === '') {
		return ''
	}
	return `${city}, ${country}`
}
