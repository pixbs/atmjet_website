import { useTranslations } from 'next-intl'

export function OptionsSection() {
	const t = useTranslations('options')

	return (
		<section>
			<div className="container gap-6">
				<div className="p-6 h-64 justify-center items-start gap-6 relative bg-blue-500 rounded-2xl overflow-hidden">
					<h2 className='z-10'>{t('assistant')}</h2>
					<button className='z-10'>{t('button')}</button>
					<div className='option-darkening absolute inset-0'/>
				</div>
				<div className="p-6 h-64 justify-center items-start gap-6 relative bg-blue-500 rounded-2xl overflow-hidden">
					<h2 className='z-10'>{t('agencies')}</h2>
					<button className='z-10'>{t('button')}</button>
					<div className='option-darkening absolute inset-0'/>
				</div>
			</div>
		</section>
	)
}
