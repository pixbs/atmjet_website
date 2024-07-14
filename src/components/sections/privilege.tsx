import { useTranslations } from 'next-intl'

export function PrivilegeSection() {
	const t = useTranslations('privilege')

	return (
		<section>
			<div className="container">
				<div className="gap-10 overflow-hidden rounded-2xl bg-gold bg-fixed">
					<div className="h-64 bg-white" />
					<div className="items-center gap-4 px-6 pb-10">
						<h2 className="text-center text-gray-100">{t('title')}</h2>
						<p className="text-center text-gray-100">{t('description')}</p>
						<button className="big">{t('button')}</button>
					</div>
				</div>
			</div>
		</section>
	)
}
