import { Counter } from '@/components/elements'
import { ContactUsSection, EmptyLegSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function EmptyLegsPage() {
	const t = useTranslations()

	return (
		<main>
			<section>
				<div className='container gap-8 pt-32'>
					<h1 className='text-center'>
						<Counter className='bg-gold bg-clip-text pb-2 text-7xl text-transparent'>
							{t('empty-leg-hero.num')}
						</Counter>
						<br />
						{t('empty-leg-hero.title')}
					</h1>
					<div className='card gap-4 p-6'>
						<h2>{t('empty-leg-hero.subtitle')}</h2>
						<p>{t('empty-leg-hero.description')}</p>
					</div>
				</div>
			</section>
			<section>
				<div className='container gap-4'>
					<h2>{t('empty-leg-descriptor.title')}</h2>
					<p>{t('empty-leg-descriptor.description')}</p>
				</div>
			</section>
			<EmptyLegSection />
			<ContactUsSection
				title={t('empty-leg-contact-us.title')}
				description={t('empty-leg-contact-us.description')}
				buttonText={t('empty-leg-contact-us.button')}
				imageSrc='/images/home_page/key_features_tailoredp_references.webp'
			/>
		</main>
	)
}
