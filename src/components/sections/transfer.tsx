import { useTranslations } from 'next-intl'
import { RequestForm } from '../form'

export function TransferSection() {
	const t = useTranslations('transfer')
	return (
		<section>
			<div className="container">
				<div>
					<div>
						<p>{t('subtitle')}</p>
					</div>
					<h2>{t('title')}</h2>
				</div>
				<RequestForm />
			</div>
		</section>
	)
}
