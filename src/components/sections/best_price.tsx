import { useTranslations } from 'next-intl'

export function BestPriceSection() {
	const t = useTranslations('best-price')
	return (
		<section>
			<div className='container'>
				<div className='card !flex-col-reverse items-center bg-gray-150 lg:!flex-row'>
					<div className='p-8 md:p-10'>
						<h2 className='bg-gold bg-clip-text text-transparent'>{t('title')}</h2>
						<p className='mt-4'>{t('description')}</p>
						<button className='big mt-10 md:self-start'>{t('button')}</button>
					</div>
					<div
						className='h-80 w-full rounded-2xl bg-cover bg-center bg-no-repeat'
						style={{ backgroundImage: 'url(/images/business_agencies/insurance.jpg)' }}
					/>
				</div>
			</div>
		</section>
	)
}
