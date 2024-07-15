import {
	EmptyLegSection,
	FaqSection,
	HeroSection,
	KeyFeaturesSection,
	MakeBookingSection,
	OptionsSection,
	PrivilegeSection,
	TestimonialsSection,
	TransferSection,
	WhyUsSection,
	YachtsSection,
} from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function HomePage() {
	const t = useTranslations()
	return (
		<main>
			<HeroSection title={t('hero-section.title')} />
			<MakeBookingSection />
			<WhyUsSection />
			<EmptyLegSection />
			<KeyFeaturesSection />
			<OptionsSection />
			<PrivilegeSection />
			<YachtsSection />
			<TestimonialsSection />
			<TransferSection />
			<FaqSection />
		</main>
	)
}
