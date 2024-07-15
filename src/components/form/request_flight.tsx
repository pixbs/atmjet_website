import { useTranslations } from 'next-intl'
import { CounterInput } from '../elements'

export function RequestForm() {
	const t = useTranslations('form')
	return (
		<form className="flex flex-col gap-1">
			<input placeholder={t('from')}></input>
			<input placeholder={t('to')}></input>
			<input type="date" placeholder={t('date')} />
			<CounterInput placeholder={t('passangers')} />
			<button type="submit" className="big mt-3 bg-gold bg-fixed">
				{t('request-quote')}
			</button>
		</form>
	)
}
