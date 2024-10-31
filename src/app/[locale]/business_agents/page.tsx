import Diamond from '@/assets/svg/diamond-gold.svg'
import { FileCard } from '@/components/elements'
import { BestPriceSection, TransferSection, WhyUsSection } from '@/components/sections'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

export default function businessAgentsPage() {
	const t = useTranslations()
	const locale = useLocale()

	const tWhyUs = useTranslations('home-why-us')

	const whyUsImages = [
		'/images/home_page/why_us_years.webp',
		'/images/home_page/why_us_clients.webp',
		'/images/home_page/why_us_trusted_by_celeb.webp',
		'/images/home_page/why_us_same_day_departure.webp',
		'/images/home_page/why_us_excellence.webp',
	]

	const whyUsCards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		num: tWhyUs(`${card}.num`),
		title: tWhyUs(`${card}.title`),
		description: tWhyUs(`${card}.description`),
	}))

	const checklistUrl =
		locale === 'en'
			? 'https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20EN.pdf'
			: 'https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20RU.pdf'

	const presentationUrl =
		locale === 'en'
			? 'https://atmjet.ams3.cdn.digitaloceanspaces.com/presentation/ATM%20JET%20Presentation.pdf'
			: 'https://atmjet.ams3.cdn.digitaloceanspaces.com/presentation/ATM%20JET%20Presentation%20RU.pdf'

	return (
		<main>
			<section>
				<div className='container gap-20 pt-32'>
					<h1 className='text-center'>{t('business-agents-hero.title')}</h1>
					<div className='gap-10 lg:flex-row'>
						<div className='w-full gap-6'>
							<h2>{t('guide.title')}</h2>
							<div className='flex-row gap-4'>
								<Diamond className='h-11 w-11 shrink-0 md:h-11 md:w-11' alt='Icon of diamond' />
								<p>{t('guide.description')}</p>
							</div>
							<hr />
							<div className='flex-row gap-4'>
								<Diamond className='h-11 w-11 shrink-0 md:h-11 md:w-11' alt='Icon of diamond' />
								<p>{t('guide.description2')}</p>
							</div>
						</div>
						<Image
							src='/images/business_agencies/hero2.webp'
							alt={t('business-agents-hero.title')}
							className='h-80 w-full rounded-2xl object-cover object-center'
							loading='lazy'
							width={2240}
							height={1280}
						/>
					</div>
				</div>
			</section>
			<WhyUsSection title={tWhyUs('title')} cards={whyUsCards} images={whyUsImages} />
			<section>
				<div className='container gap-6 md:flex-row'>
					<FileCard
						title={t('documents.document1.title')}
						imageUrl='/images/business_agencies/file1.webp'
						button={t('documents.document1.button')}
						url={checklistUrl}
					/>
					<FileCard
						title={t('documents.document2.title')}
						imageUrl='/images/business_agencies/file2.webp'
						button={t('documents.document2.button')}
						url={presentationUrl}
					/>
				</div>
			</section>
			<TransferSection />
			<BestPriceSection />
		</main>
	)
}
