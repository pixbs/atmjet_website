import { useTranslations } from 'next-intl'
import { RequestForm } from '../form'

export function MakeBookingSection() {
	const t = useTranslations('form')
	return (
		<section>
			<div className='container gap-8'>
				<h2>{t('title')}</h2>
				<RequestForm />
			</div>
		</section>
	)
}
