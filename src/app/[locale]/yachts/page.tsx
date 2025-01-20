import Line from '@/components/animated/line'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { getLocale } from 'next-intl/server'
import YachtsSection from './YachtsSection'
import { HeroYachtsSection } from '@/components/sections'

export default async function Yachts() {
	const locale = (await getLocale()) as 'en' | 'ru'

	const yachts =
		(await db
			.select()
			.from(newYachts)
			.orderBy(newYachts.id)
			.catch(() => [])) || []
	return (
		<main>
			<HeroYachtsSection />
			<YachtsSection yachts={yachts} />
			<Line />
			<NewContactUs />
		</main>
	)
}
;``
