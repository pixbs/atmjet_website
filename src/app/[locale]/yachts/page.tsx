import Line from '@/components/animated/line'
import { HeroYachtsSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { getLocale, getTranslations } from 'next-intl/server'
import YachtsSection from './YachtsSection'
import FilterSection from './filter_section'

export default async function Yachts() {
	const locale = (await getLocale()) as 'en' | 'ru'
	const t = await getTranslations('yachts-charter-hero')

	const yachts =
		(await db
			.select()
			.from(newYachts)
			.orderBy(newYachts.id)
			.catch(() => [])) || []

	const findMinPrice =
		Math.round(
			Number(
				yachts
					.filter((yacht) => yacht.customerPrice)
					.sort((a, b) => Number(a.customerPrice) - Number(b.customerPrice))[0].customerPrice,
			) / 10,
		) * 10 || undefined

	const findMaxPrice =
		Math.round(
			Number(
				yachts
					.filter((yacht) => yacht.customerPrice)
					.sort((a, b) => Number(b.customerPrice) - Number(a.customerPrice))[0].customerPrice,
			) / 10,
		) * 10 || undefined

	const findMinLenght =
		Math.round(
			Number(
				yachts
					.filter((yacht) => yacht.length)
					.sort((a, b) => Number(a.length) - Number(b.length))[0].length,
			) / 10,
		) * 10 || undefined

	const findMaxLenght =
		yachts.filter((yacht) => yacht.length).sort((a, b) => Number(b.length) - Number(a.length))[0]
			.length || 0

	const findMinGuests =
		Math.round(
			Number(
				yachts
					.filter((yacht) => yacht.guestsDay)
					.sort((a, b) => Number(a.guestsDay) - Number(b.guestsDay))[0].guestsDay,
			) / 5,
		) * 5 || 0

	const findMaxGuests =
		Math.round(
			Number(
				yachts
					.filter((yacht) => yacht.guestsDay)
					.sort((a, b) => Number(b.guestsDay) - Number(a.guestsDay))[0].guestsDay,
			) / 10,
		) * 10 || 0

	return (
		<main>
			<HeroYachtsSection
				title={t('title')}
				description={t('description')}
				description2={t('description2')}
				isButtonHidden
			/>
			<FilterSection
				price={{ min: findMinPrice, max: findMaxPrice, step: 250 }}
				lenght={{ min: findMinLenght, max: Number(findMaxLenght), step: 10 }}
				guests={{ min: findMinGuests, max: findMaxGuests, step: 1 }}
			/>
			<Line />
			<YachtsSection yachts={yachts} />
			<Line />
			<NewContactUs />
		</main>
	)
}
