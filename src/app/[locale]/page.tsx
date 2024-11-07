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
import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { Suspense } from 'react'

export async function generateMetadata() {
	const locale = await getLocale()
	const baseURL =
		process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000'

	const title =
		locale === 'ru'
			? 'Аренда частного самолета, заказать самолет в Москве и любой точке мира'
			: 'Private Jet Charter, Hire a Private Jet Worldwide'
	const description =
		locale === 'ru'
			? 'Арендовать частный самолет в течение нескольких часов.✈ заказать частный самолет в Москве, других городах и странах.'
			: 'Hire a private jet within a few hours.✈ Book a private jet London, and other cities and countries.'

	const metadata: Metadata = {
		title: title,
		description: description,
		openGraph: {
			videos: [
				{
					url: `https://${baseURL}/video/background_full.mp4`,
					type: 'video/mp4',
					width: 1920,
					height: 1080,
				},
			],
		},
	}
	return metadata
}

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
