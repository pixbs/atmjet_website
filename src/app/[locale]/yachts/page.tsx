import {
	ContactUsSection,
	HeroYachtsSection,
	KeyFeaturesSection,
	OptionsSelectionSection,
	WeInspectSection,
	WhyUsSection
} from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function YachtsPage() {
	const t = useTranslations()

	const whyUsCards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		num: '',
		title: t(`yachts-why-us.${card}.title`),
		description: t(`yachts-why-us.${card}.description`),
	}))

	const whyUsImages = [
		'/images/yachts/yacht_page_over20years_management.jpg',
		'/images/yachts/yacht_page_over20years_plan.jpg',
		'/images/yachts/yacht_page_over20years_database.jpg',
		'/images/yachts/yacht_page_over20years_luxury.jpg',
	]

	const keyFeaturesCards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		title: t(`carousel.${card}.title`),
		description: t(`carousel.${card}.description`),
	}))

	const keyFeatures = [
		'/images/yachts/yacht_page_over20years_management.jpg',
		'/images/yachts/yacht_page_over20years_plan.jpg',
		'/images/yachts/yacht_page_over20years_database.jpg',
		'/images/yachts/yacht_page_over20years_luxury.jpg',
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
			<WeInspectSection />
			<OptionsSelectionSection
				title={t('yachts-options.title')}
				card1={{
					title: t('yachts-options.card1.title'),
					description: t('yachts-options.card1.description'),
					list: t('yachts-options.card1.list').split(' \\n'),
					imageSrc: 'url(/images/yachts/yacht_page_yachtservices_legal.jpg)',
				}}
				card2={{
					title: t('yachts-options.card2.title'),
					description: t('yachts-options.card2.description'),
					list: t('yachts-options.card2.list').split(' \\n'),
					imageSrc: 'url(/images/yachts/yacht_page_yachtservices_finance.jpg)',
				}}
			/>
			<section>
				<div className='container'>
					<h2 className='mx-auto max-w-xl text-center'>{t('yachts-why-us.title')}</h2>
					<p className='mx-auto max-w-xl py-4 text-center'>{t('yachts-why-us.description')}</p>
					<div
						className='my-10 h-40 rounded-xl bg-cover bg-center bg-no-repeat'
						style={{ backgroundImage: 'url(/images/yachts/yacht_page_over20years_l.jpg)' }}
					/>
				</div>
			</section>
			<WhyUsSection title={t('yachts-why-us.title')} cards={whyUsCards} images={whyUsImages} />
			<ContactUsSection
				title={t('yachts-contact-us.title')}
				description={t('yachts-contact-us.description')}
				buttonText={t('yachts-contact-us.button')}
				imageSrc='/images/yachts/yacht_page_contactus.jpg'
			/>
		</main>
	)
}
