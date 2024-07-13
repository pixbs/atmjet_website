import { useTranslations } from 'next-intl'

export function PrivilegeSection() {
	const t = useTranslations('privilege')

	return (
		<section>
			<div className="container">
				<h2>{t('title')}</h2>
				<p>{t('description')}</p>
				<button>{t('button')}</button>
			</div>
		</section>
	)
}
