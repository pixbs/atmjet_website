import { Preloader } from '@/components/elements'
import {
	AngleBar,
	EmptyLegSection,
	FaqSection,
	HeroSection,
	KeyFeaturesSection,
	MakeBookingSection,
	OptionsSection,
	PrivilegeSection,
	TilesSection,
	TransferSection,
	WhyUsSection,
	YachtsSection,
} from '@/components/sections'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

export default function HomePage() {
	const t = useTranslations()
	const tWhyUs = useTranslations('home-why-us')

	const whyUsCards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		num: tWhyUs(`${card}.num`),
		title: tWhyUs(`${card}.title`),
		description: tWhyUs(`${card}.description`),
	}))
	const whyUsImages = [
		'/images/home_page/why_us_years.webp',
		'/images/home_page/why_us_clients.webp',
		'/images/home_page/why_us_trusted_by_celeb.webp',
		'/images/home_page/why_us_same_day_departure.webp',
		'/images/home_page/why_us_excellence.webp',
	]

	const keyFeaturesCards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		title: t(`key-features.${card}.title`),
		description: t(`key-features.${card}.description`),
	}))

	const keyFeaturesImages = [
		'/images/home_page/key_features_tailoredp_references.webp',
		'/images/home_page/key_features_cuztomized_aircrafts.webp',
		'/images/home_page/key_features_payment_after_flight.webp',
		'/images/home_page/key_features_pay_anyway.webp',
		'/images/home_page/key_features_shampain.jpg',
	]

	return (
		<Suspense fallback={<Preloader />}>
			<main>
				<Preloader />
				<AngleBar />
				<HeroSection title={t('home-hero.title')} />
				<MakeBookingSection />
				<WhyUsSection title={tWhyUs('title')} cards={whyUsCards} images={whyUsImages} />
				<EmptyLegSection />
				<KeyFeaturesSection
					title={t('key-features.title')}
					description={t('key-features.description')}
					cards={keyFeaturesCards}
					images={keyFeaturesImages}
				/>
				<OptionsSection />
				<PrivilegeSection />
				<YachtsSection />
				<TilesSection />
				<TransferSection />
				<FaqSection />
			</main>
		</Suspense>
	)
}
