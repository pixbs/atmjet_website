import { useTranslations } from "next-intl"

export function OptionsSection() {
	const t = useTranslations('options')

	return (
		<section>
			<div className="container">
				<div className="p-6">
					<h2>{t('assistant')}</h2>
					<button>{t('button')}</button>
				</div>
				<div className="p-6">
					<h2>{t('agencies')}</h2>
					<button>{t('button')}</button>
				</div>
			</div>
		</section>
	)
}
