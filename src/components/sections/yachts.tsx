import { useTranslations } from 'next-intl'
import { YachtsCard } from '../elements'

export function YachtsSection() {
	const t = useTranslations('yachts')

	return (
		<section>
			<div className='container'>
				<h2 className='mb-4 text-center'>{t('title')}</h2>
				<p className='text-center'>{t('description')}</p>
				<p className='mb-10 text-center'>{t('description2')}</p>
				<YachtsCard />
			</div>
		</section>
	)
}
