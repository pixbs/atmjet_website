import { useTranslations } from 'next-intl'
import { RequestForm } from '../form'

export function MakeBookingSection() {
	const t = useTranslations('form')
	return (
		<section>
			<div className="container gap-8">
				<h1>{t('title')}</h1>
				<RequestForm />
			</div>
		</section>
	)
}
