import { useTranslations } from 'next-intl'

export function YachtsSection() {
	const t = useTranslations('yachts')

	return (
		<section>
			<div className="container">
				<h2>{t('title')}</h2>
				<p>{t('description')}</p>
				<div>
					<div>
						<div>
							<h3>{t('sub-title1')}</h3>
							<p>{t('sub-description1')}</p>
						</div>
						<div>
							<h3>{t('sub-title2')}</h3>
							<p>{t('sub-description2')}</p>
						</div>
						<div>
							<h3>{t('sub-title3')}</h3>
							<p>{t('sub-description3')}</p>
						</div>
					</div>
					<div>
						<h3>{t('call-to-action')}</h3>
						<button>{t('button')}</button>
					</div>
				</div>
			</div>
		</section>
	)
}
