import Line from '@/components/animated/line'
import { HeroYachtsSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { getLocale, getTranslations } from 'next-intl/server'
import YachtsSection from './YachtsSection'

export default async function Yachts() {
	const locale = (await getLocale()) as 'en' | 'ru'
	const t = await getTranslations('yachts-charter-hero')

	const yachts =
		(await db
			.select()
			.from(newYachts)
			.orderBy(newYachts.id)
			.catch(() => [])) || []
	return (
		<main>
			<HeroYachtsSection title={t('title')} description2={t('description2')} />
			<YachtsSection yachts={yachts} />
			<Line />
			<NewContactUs />
		</main>
	)
}
