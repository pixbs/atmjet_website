import { useTranslations } from 'next-intl'

export function OptionsSection() {
	const t = useTranslations('options')

	return (
		<section>
			<div className="container gap-6">
				<div className="relative h-64 items-start justify-center gap-6 overflow-hidden rounded-2xl bg-blue-500 p-6">
					<h2 className="z-10">{t('assistant')}</h2>
					<button className="z-10">{t('button')}</button>
					<div className="option-darkening absolute inset-0" />
				</div>
				<div className="relative h-64 items-start justify-center gap-6 overflow-hidden rounded-2xl bg-blue-500 p-6">
					<h2 className="z-10">{t('agencies')}</h2>
					<button className="z-10">{t('button')}</button>
					<div className="option-darkening absolute inset-0" />
				</div>
			</div>
		</section>
	)
}
