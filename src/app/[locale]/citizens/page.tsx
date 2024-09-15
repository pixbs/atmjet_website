import ForbesLogo from '@/assets/svg/forbes-logo.svg'
import { SubpageHeroSection, WhyUsSection } from '@/components/sections'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function CitizensPage() {
	const t = useTranslations()

	const cards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		num: '',
		title: t(`citizens-why-us.${card}.title`),
		description: '',
	}))

	const images = [
		'/images/citizens/why_us_sanctions.webp',
		'/images/citizens/why_us_techstops.webp',
		'/images/citizens/why_us_foreignaircraft.webp',
		'/images/citizens/why_us_coordination.webp',
		'/images/citizens/why_us_anypayment.webp',
	]

	return (
		<main>
			<SubpageHeroSection
				title={t('citizens-hero.title')}
				description={t('citizens-hero.description')}
				imageUrl='/images/citizens/hero.webp'
			/>
			<WhyUsSection title={t('citizens-why-us.title')} cards={cards} images={images} />
			<section>
				<div className='container'>
					<div className='card gap-8 bg-gray-150 p-8 md:gap-10 md:p-10'>
						<ForbesLogo className='-mb-6 h-14' />
						<h2 className='rounded-r-2xl border-l-2 border-gray-500 bg-gray-200 px-8 py-4 text-3xl md:px-10'>
							{t('quote.quote')}
						</h2>
						<p className='border-y border-gray-400 bg-gold bg-clip-text px-10 py-4 text-center text-transparent md:px-16'>
							{t('quote.description')}
						</p>
						<Link href='?showBooking=Citizens' className='self-center' scroll={false}>
							<button className='big'>{t('quote.button')}</button>
						</Link>
					</div>
				</div>
			</section>
		</main>
	)
}
