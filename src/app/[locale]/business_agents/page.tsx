import { FileCard } from '@/components/elements'
import { BestPriceSection, TransferSection } from '@/components/sections'
import { useLocale, useTranslations } from 'next-intl'

export default function businessAgentsPage() {
	const t = useTranslations()
	const locale = useLocale()

	const checklistUrl =
		locale === 'en'
			? 'https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20EN.pdf'
			: 'https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20RU.pdf'

	return (
		<main>
			<section>
				<div className='container gap-20 pt-32'>
					<h1 className='text-center'>{t('business-agents-hero.title')}</h1>
					<div className='gap-10 lg:flex-row'>
						<div className='w-full gap-6'>
							<h2>{t('guide.title')}</h2>
							<p>{t('guide.description')}</p>
							<hr />
							<p>{t('guide.description2')}</p>
						</div>
						<div
							className='h-80 w-full rounded-2xl bg-cover bg-center bg-no-repeat'
							style={{ backgroundImage: 'url(/images/business_agencies/hero2.jpg)' }}
						/>
					</div>
				</div>
			</section>
			<section>
				<div className='container gap-6 md:flex-row'>
					<FileCard
						title={t('documents.document1.title')}
						imageUrl='/images/business_agencies/file1.jpg'
						button={t('documents.document1.button')}
						url={checklistUrl}
					/>
					<FileCard
						title={t('documents.document2.title')}
						imageUrl='/images/business_agencies/file2.jpg'
						button={t('documents.document2.button')}
						url='https://atmjet.ams3.cdn.digitaloceanspaces.com/ATM%20JET%20Presentation.pdf'
					/>
				</div>
			</section>
			<BestPriceSection />
			<TransferSection />
		</main>
	)
}
