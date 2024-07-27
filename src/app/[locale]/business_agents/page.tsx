import { FileCard } from '@/components/elements'
import { BestPriceSection, TransferSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function businessAgentsPage() {
	const t = useTranslations()

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
							style={{ backgroundImage: 'url(/images/business_agencies/hero.jpg)' }}
						/>
					</div>
				</div>
			</section>
			<section>
				<div className='container gap-6 md:flex-row'>
					<FileCard
						url='/images/business_agencies/hero.jpg'
						title={t('documents.document1.title')}
						imageUrl='/images/business_agencies/file1.jpg'
						button={t('documents.document1.button')}
					/>
					<FileCard
						url='/images/business_agencies/hero.jpg'
						title={t('documents.document2.title')}
						imageUrl='/images/business_agencies/file2.jpg'
						button={t('documents.document2.button')}
					/>
				</div>
			</section>
			<BestPriceSection />
			<TransferSection />
		</main>
	)
}
