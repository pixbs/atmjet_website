import { useTranslations } from 'next-intl'
import { RequestForm } from '../form'

export function TransferSection() {
	const t = useTranslations('transfer')
	return (
		<section>
			<div className='container'>
				<div className='gap-6 rounded-2xl bg-gray-200 p-8'>
					<div className='gap-8'>
						<div className='-mx-8 -mt-8 h-48 items-center justify-center rounded-t-2xl bg-blue-500'>
							<p className='font-serif text-3xl text-gray-900'>{t('subtitle')}</p>
						</div>
						<h2>{t('title')}</h2>
					</div>
					<RequestForm />
				</div>
			</div>
		</section>
	)
}
