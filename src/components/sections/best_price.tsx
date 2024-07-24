import { useTranslations } from 'next-intl'

export function BestPriceSection() {
	const t = useTranslations('best-price')
	return (
		<section>
			<div className='container !flex-col-reverse items-center gap-10 lg:!flex-row'>
				<div>
					<h2>{t('title')}</h2>
					<p className='mt-4'>{t('description')}</p>
					<button className='big mt-10 md:self-start'>{t('button')}</button>
				</div>
				<div
					className='h-80 w-full rounded-2xl bg-cover bg-center bg-no-repeat'
					style={{ backgroundImage: 'url(/images/business_agencies/insurance.jpg)' }}
				/>
			</div>
		</section>
	)
}
