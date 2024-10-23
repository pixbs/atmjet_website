import { YachtCarousel } from '@/components/elements'
import {
	HeroYachtsSection,
	KeyFeaturesSection,
	OptionsSelectionSection,
	WeInspectSection,
	WhyUsSection
} from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, yachts as yachtsTable } from '@/lib/drizzle'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export default async function YachtsPage() {
	const t = await getTranslations()

	const yachts = await db.select().from(yachtsTable)

	const whyUsCards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		num: '',
		title: t(`yachts-why-us.${card}.title`),
		description: t(`yachts-why-us.${card}.description`),
	}))

	const whyUsImages = [
		'/images/yachts/yacht_page_over20years_management.webp',
		'/images/yachts/yacht_page_over20years_plan.webp',
		'/images/yachts/yacht_page_over20years_database.webp',
		'/images/yachts/yacht_page_over20years_luxury.webp',
	]

	const keyFeaturesCards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		title: t(`carousel.${card}.title`),
		description: t(`carousel.${card}.description`),
	}))

	const keyFeatures = [
		'/images/yachts/yacht_page_over20years_management.webp',
		'/images/yachts/yacht_page_over20years_plan.webp',
		'/images/yachts/yacht_page_over20years_database.webp',
		'/images/yachts/yacht_page_over20years_luxury.webp',
	]
	return (
		<main>
			<HeroYachtsSection />
			<KeyFeaturesSection
				title={t('carousel.title')}
				description={t('carousel.description')}
				cards={keyFeaturesCards}
				images={keyFeatures}
			/>
			<section>
				<div className='container'>
					<div className='rounded-xl bg-gold p-0.5'>
						<div className='rounded-xl bg-gray-150 p-10'>
							<h2 className='text-center'>{t('yachts-descriptor.title')}</h2>
						</div>
					</div>
				</div>
			</section>
			<section>
				<div className='container'>
					<div className='card gap-8 rounded-2xl bg-gray-150 p-8 md:gap-10 md:p-10'>
						<h2>{t('recent-yachts.title')}</h2>
						<YachtCarousel vehicles={yachts} />
					</div>
				</div>
			</section>
			<WeInspectSection />
			<OptionsSelectionSection
				title={t('yachts-options.title')}
				card1={{
					title: t('yachts-options.card1.title'),
					description: t('yachts-options.card1.description'),
					list: t('yachts-options.card1.list').split(' \\n'),
					imageSrc: '/images/yachts/yacht_page_yachtservices_legal.webp',
				}}
				card2={{
					title: t('yachts-options.card2.title'),
					description: t('yachts-options.card2.description'),
					list: t('yachts-options.card2.list').split(' \\n'),
					imageSrc: '/images/yachts/yacht_page_yachtservices_finance.webp',
				}}
			/>
			<section>
				<div className='container'>
					<h2 className='mx-auto max-w-xl text-center'>{t('yachts-why-us.title')}</h2>
					<p className='mx-auto max-w-xl py-4 text-center'>{t('yachts-why-us.description')}</p>
					<Image
						src='/images/yachts/yacht_page_over20years_l.webp'
						height={1920}
						width={1080}
						alt='Image of a yacht'
						className='my-10 w-full rounded-xl object-cover object-center'
						loading='lazy'
					/>
				</div>
			</section>
			<WhyUsSection title={t('yachts-why-us.title')} cards={whyUsCards} images={whyUsImages} />
			<NewContactUs />
		</main>
	)
}
