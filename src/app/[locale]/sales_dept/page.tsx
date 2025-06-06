import { VehiclesCarousel } from '@/components/elements'
import {
	AdvantagesSection,
	HeroSalesSection,
	OptionsSelectionSection,
	PersonalManagerSection,
	WhyUsSection,
} from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, vehicles } from '@/lib/drizzle'
import { sql } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'

export default async function SalesDeptPage() {
	const t = await getTranslations()
	const cards = ['card1', 'card2', 'card3'].map((card) => ({
		num: t(`sales-why-us.${card}.num`),
		title: t(`sales-why-us.${card}.title`),
		description: t(`sales-why-us.${card}.description`),
	}))
	const images = [
		'/images/jets_dep/jetsmarket_page_specialmanagement_50flights.webp',
		'/images/jets_dep/jetsmarket_page_specialmanagement_experience.webp',
		'/images/jets_dep/jetsmarket_page_specialmanagement_yields.webp',
	]

	const smallJets = (await db
		.select()
		.from(vehicles)
		.orderBy(
			sql`CASE 
         	WHEN ${vehicles.tailYear} = '' THEN NULL 
          	ELSE CAST(${vehicles.tailYear} AS INT) 
        	END DESC NULLS LAST`,
		)
		.limit(15)
		.catch(() => [])) as (typeof vehicles.$inferSelect)[]

	return (
		<main>
			<HeroSalesSection />
			<PersonalManagerSection />
			{smallJets.length > 0 && (
				<section>
					<div className='container'>
						<div className='card gap-8 rounded-2xl bg-gray-150 p-8 !pr-0 md:gap-10 md:p-10'>
							<h2>{t('aircrafts.title')}</h2>
							<VehiclesCarousel vehicles={smallJets} />
						</div>
					</div>
				</section>
			)}
			<OptionsSelectionSection
				title={t('sales-options.title')}
				card1={{
					title: t('sales-options.card1.title'),
					description: t('sales-options.card1.description'),
					list: t('sales-options.card1.list').split(' \\n'),
					imageSrc: '/images/jets_dep/jetsmarket_page_aircrafts_services_legaldpt.webp',
				}}
				card2={{
					title: t('sales-options.card2.title'),
					description: t('sales-options.card2.description'),
					list: t('sales-options.card2.list').split(' \\n'),
					imageSrc: '/images/jets_dep/jetsmarket_page_aircrafts_services_financedpt.webp',
				}}
			/>
			<AdvantagesSection
				title={t('aircrafts-descriptor.title')}
				cards={[
					{
						title: t('aircrafts-descriptor.card1.title'),
						description: t('aircrafts-descriptor.card1.description'),
					},
					{
						title: t('aircrafts-descriptor.card2.title'),
						description: t('aircrafts-descriptor.card2.description'),
					},
					{
						title: t('aircrafts-descriptor.card3.title'),
						description: t('aircrafts-descriptor.card3.description'),
					},
				]}
				imageSrc='/images/jets_dep/jetsmarket_page_team_atmjet.webp'
			/>
			<WhyUsSection
				title='ATM JET'
				description={t('sales-why-us.title')}
				cards={cards}
				images={images}
			/>
			<NewContactUs />
		</main>
	)
}
