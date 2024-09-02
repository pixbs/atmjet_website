import { useTranslations } from 'next-intl'
import { RequestForm } from '../form'

interface MakeBookingSectionProps {
	isCard?: boolean
}

export function MakeBookingSection(props: MakeBookingSectionProps) {
	const { isCard = false } = props
	const t = useTranslations('form')
	return (
		<section>
			<div className='container'>
				<div className={`gap-8 ${isCard && 'rounded-2xl bg-gray-200 p-8'}`}>
					<h2>{t('title')}</h2>
					<RequestForm />
				</div>
			</div>
		</section>
	)
}
