import { useTranslations } from 'next-intl'
import { RequestForm } from '../form'

export function CargoRequestSection() {
	const t = useTranslations('cargo-form')
	return (
		<section>
			<div className='container'>
				<div className='card gap-6 p-8 md:p-10'>
					<h2 className='lg:text-center'>{t('title')}</h2>
					<RequestForm buttonText={t('button')} />
				</div>
			</div>
		</section>
	)
}
