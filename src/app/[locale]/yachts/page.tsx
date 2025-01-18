import Line from '@/components/animated/line'
import { HeroYachtsSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { getLocale } from 'next-intl/server'
import YachtCard from './yacht_card'

export default async function Yachts() {
	const locale = (await getLocale()) as 'en' | 'ru'

	const yachts =
		(await db
			.select()
			.from(newYachts)
			.catch(() => [])) || []
	return (
		<main>
			<HeroYachtsSection />
			<section className='gap-10 md:py-16 md:pb-24'>
				<h2>
					{locale === 'en'
						? 'Yachts available for rent in Dubai'
						: 'Яхты доступные в аренду в Дубае'}
				</h2>
				<div className='container gap-10 md:grid md:grid-cols-2'>
					{yachts.map((yacht) => (
						<>
							<YachtCard {...yacht} slug={`yachts/${yacht.slug}`} key={yacht.id} />
							<YachtCard {...yacht} slug={`yachts/${yacht.slug}`} key={yacht.id} />
						</>
					))}
				</div>
			</section>
			<Line />
			<NewContactUs />
		</main>
	)
}
