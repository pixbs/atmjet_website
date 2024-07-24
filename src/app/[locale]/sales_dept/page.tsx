import {
	AdvantagesSection,
	ContactUsSection,
	HeroSalesSection,
	OptionsSelectionSection,
	PersonalManagerSection,
	WhyUsSection,
} from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function SalesDeptPage() {
	const t = useTranslations()
	const tWhyUs = useTranslations('sales-why-us')
	const cards = ['card1', 'card2', 'card3'].map((card) => ({
		num: tWhyUs(`${card}.num`),
		title: tWhyUs(`${card}.title`),
		description: tWhyUs(`${card}.description`),
	}))
	const images = [
		'/images/jets_dep/jetsmarket_page_specialmanagement_50flights.jpg',
		'/images/jets_dep/jetsmarket_page_specialmanagement_experience.jpg',
		'/images/jets_dep/jetsmarket_page_specialmanagement_yields.jpg',
	]
	return (
		<main>
			<HeroSalesSection />
			<PersonalManagerSection />
			{/* <TestimonialsSection /> */}
			<OptionsSelectionSection
				title={t('sales-options.title')}
				card1={{
					title: t('sales-options.card1.title'),
					description: t('sales-options.card1.description'),
					list: t('sales-options.card1.list').split(' \\n'),
					imageSrc: 'url(/images/jets_dep/jetsmarket_page_aircraftservices_legaldpt.jpg)',
				}}
				card2={{
					title: t('sales-options.card2.title'),
					description: t('sales-options.card2.description'),
					list: t('sales-options.card2.list').split(' \\n'),
					imageSrc: 'url(/images/jets_dep/jetsmarket_page_aircraftservices_financedpt.jpg)',
				}}
			/>
			<AdvantagesSection
				title={t('aircraft-descriptor.title')}
				cards={[
					{
						title: t('aircraft-descriptor.card1.title'),
						description: t('aircraft-descriptor.card1.description'),
					},
					{
						title: t('aircraft-descriptor.card2.title'),
						description: t('aircraft-descriptor.card2.description'),
					},
					{
						title: t('aircraft-descriptor.card3.title'),
						description: t('aircraft-descriptor.card3.description'),
					},
				]}
				imageSrc='/images/jets_dep/jetsmarket_page_team_atmjet.jpg'
			/>
			<WhyUsSection title={tWhyUs('title')} cards={cards} images={images} />
			<ContactUsSection
				title={t('sales-contact-us.title')}
				description={t('sales-contact-us.description')}
				buttonText={t('sales-contact-us.button')}
				imageSrc='/images/jets_dep/jetsmarket_page_team_contactus.jpg'
			/>
		</main>
	)
}
