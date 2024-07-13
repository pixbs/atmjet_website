import { useTranslations } from 'next-intl'

export function RequestForm() {
	const t = useTranslations('form')
	return (
		<form className="flex flex-col gap-1">
			<input placeholder={t('from')}></input>
			<input placeholder={t('to')}></input>
			<input type="date" placeholder={t('date')}></input>
			<div className="flex">
				<button>-</button>
				<input placeholder={t('passangers')}></input>
				<button>+</button>
			</div>
			<button type="submit">{t('request-quote')}</button>
		</form>
	)
}
