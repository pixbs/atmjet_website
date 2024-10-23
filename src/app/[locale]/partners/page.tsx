import { Counter } from '@/components/elements'
import { PersonalManagerSection, WhyUsSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export default function PartnersPage() {
	const t = useTranslations()

	const whyUsCards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		num: '',
		title: t(`we-offer.${card}.title`),
		description: t(`we-offer.${card}.description`),
	}))

	const whyUsImages = [
		'/images/home_page/why_us_years.webp',
		'/images/home_page/why_us_clients.webp',
		'/images/home_page/why_us_trusted_by_celeb.webp',
		'/images/home_page/why_us_same_day_departure.webp',
		'/images/home_page/why_us_excellence.webp',
	]

	return (
		<main>
			<section>
				<div className='container gap-20 pt-32'>
					<h1 className='text-pretty text-center'>
						{t('partners-hero.title')}
						<Counter className='inline-block min-w-16 bg-gold bg-clip-text text-transparent'>
							{t('partners-hero.num')}
						</Counter>
						{t('partners-hero.title2')}
					</h1>
					<Image
						src='/images/partners/hero.webp'
						alt={t('partners-hero.title')}
						className='h-64 rounded-2xl object-cover object-center'
						loading='lazy'
						width={1200}
						height={260}
					/>
					<div className='card gap-4 bg-gray-150 p-8 md:p-10'>
						<h2>{t('instant-payment.title')}</h2>
						<p>{t('instant-payment.description')}</p>
					</div>
				</div>
			</section>
			<WhyUsSection
				title={t('we-offer.subtitle')}
				description={t('we-offer.description')}
				cards={whyUsCards}
				images={whyUsImages}
			/>
			<PersonalManagerSection />
			<NewContactUs />
		</main>
	)
}
