import Line from '@/components/animated/line'
import { HeroYachtsSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { getLocale } from 'next-intl/server'
import YachtCard from './yacht_card'

interface YachtProps {
	searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function Yachts({ searchParams }: YachtProps) {
	const locale = (await getLocale()) as 'en' | 'ru'
	const query = searchParams?.query

	const yachts =
		(await db
			.select()
			.from(newYachts)
			.orderBy(newYachts.id)
			.catch(() => [])) || []
	return (
		<main>
			<HeroYachtsSection />
			<section className='gap-10 md:py-16 md:pb-24'>
				<div className='container gap-10 md:grid md:grid-cols-2'>
					<h2 className='col-span-full self-center text-center'>
						{locale === 'en'
							? 'Yachts available for rent in Dubai'
							: 'Яхты доступные в аренду в Дубае'}
						{query}
					</h2>
					{yachts.map((yacht) => (
						<YachtCard {...yacht} slug={`yachts/${yacht.slug}`} key={yacht.id} />
					))}
				</div>
			</section>
			<Line />
			<NewContactUs />
		</main>
	)
}
