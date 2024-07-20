import { useTranslations } from 'next-intl'

export function OptionsSection() {
	const t = useTranslations('options')

	return (
		<section>
			<div className='container gap-6 lg:flex-row lg:content-stretch'>
				<div
					className='relative h-64 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl bg-cover p-6'
					style={{ backgroundImage: 'url(/images/home_page/For-Business-Agents-one.jpg)' }}
				>
					<h2 className='z-10'>{t('assistant')}</h2>
					<button className='z-10'>{t('button')}</button>
					<div className='option-darkening absolute inset-0' />
				</div>
				<div
					className='relative h-64 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl bg-cover p-6'
					style={{ backgroundImage: 'url(/images/home_page/For-Business-Agents-two.jpg)' }}
				>
					<h2 className='z-10'>{t('agencies')}</h2>
					<button className='z-10'>{t('button')}</button>
					<div className='option-darkening absolute inset-0' />
				</div>
			</div>
		</section>
	)
}
