'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export function LocaleSwitch() {
	const t = useTranslations()
	const locale = useLocale()

	const pathname = usePathname()
	const searchParams = useSearchParams()
	let basePathname = pathname.substring(pathname.indexOf('/', 1))
	if (basePathname === '/en' || basePathname === '/ru' || basePathname === '/uk') {
		basePathname = '/'
	}
	const url = `${basePathname}?${searchParams}`

	return (
		<>
			<Link
				href={`/en${url}`}
				locale='en'
				scroll={false}
				className={`text-base ${locale == 'en' && 'opacity-50'}`}
			>
				{t('locale.en')}
			</Link>
			<Link
				href={`/ru${url}`}
				locale='ru'
				scroll={false}
				className={`text-base ${locale == 'ru' && 'opacity-50'}`}
			>
				{t('locale.ru')}
			</Link>
			{/* <Link
				href={`/uk${url}`}
				locale='uk'
				scroll={false}
				className={`text-base ${locale == 'uk' && 'opacity-50'}`}
			>
				{t('locale.uk')}
			</Link> */}
		</>
	)
}
