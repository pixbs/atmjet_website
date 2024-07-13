import { EmptyLegSection, HeroSection, KeyFeaturesSection, OptionsSection, PrivilegeSection, WhyUsSection, YachtsSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function HomePage() {
	const t = useTranslations()
	return <main>
		<HeroSection title={t('hero-section.title')} />
		<WhyUsSection/>
		<EmptyLegSection/>
		<KeyFeaturesSection/>
		<OptionsSection/>
		<PrivilegeSection/>
		<YachtsSection/>
	</main>
}
