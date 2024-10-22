import { Counter } from '@/components/elements'
import { ContactUsSection, EmptyLegSection } from '@/components/sections'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export default function EmptyLegsPage() {
	const t = useTranslations()

	return (
		<main>
			<section>
				<div className='container gap-16 pb-24 pt-32'>
					<h1 className='text-center'>
						<Counter className='bg-gold bg-clip-text pb-2 text-7xl text-transparent'>
							{t('empty-leg-hero.num')}
						</Counter>
						<br />
						{t('empty-leg-hero.title')}
					</h1>
					<div className='card items-center gap-4 overflow-hidden lg:flex-row'>
						<div className='w-full'>
							<Image
								src='/images/empty_legs/hero.png'
								alt={t('empty-leg-hero.title')}
								className='w-full'
								width={1920}
								height={1080}
							/>
						</div>
						<div className='w-full gap-8 p-8'>
							<h2>{t('empty-leg-hero.subtitle')}</h2>
							<p>{t('empty-leg-hero.description')}</p>
						</div>
					</div>
				</div>
			</section>
			<section>
				<div className='container gap-4 pb-24'>
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
