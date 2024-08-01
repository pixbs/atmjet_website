'use client'

import { getCookie, setCookie } from 'cookies-next'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Checkbox } from '../elements'

export function CookiesModal({ closeModal }: { closeModal: () => void }) {
	const t = useTranslations('cookies')
	const containerRef = useRef<HTMLDivElement>(null)

	const marketingCookies = getCookie('marketing-consent') == 'true' ? true : false
	const personalCookies = getCookie('personal-consent') == 'true' ? true : false

	const [marketingConsent, setMarketingConsent] = useState<boolean>(marketingCookies)
	const [personalConsent, setPersonalConsent] = useState<boolean>(personalCookies)
	console.log(
		`marketing: ${marketingConsent} : ${marketingCookies}, personal: ${personalConsent} : ${personalCookies}`,
	)

	const handleClickOutside = (event: React.MouseEvent) => {
		if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
			closeModal()
		}
	}

	const handleSubmit = () => {
		console.log(personalConsent, marketingConsent)
		setCookie('marketing-consent', marketingConsent, { maxAge: 60 * 525960 })
		setCookie('personal-consent', personalConsent, { maxAge: 60 * 525960 })
		setCookie('cookie-consent', true, { maxAge: 60 * 525960 })
		closeModal()
	}

	const handleReject = () => {
		setCookie('marketing-consent', false)
		setCookie('personal-consent', false)
		setCookie('cookie-consent', true)
		closeModal()
	}

	return (
		<section
			className='fixed inset-0 z-[901] bg-gray-150 bg-opacity-40 backdrop-blur-sm duration-300 animate-in fade-in-0'
			onClick={handleClickOutside}
		>
			<div
				className='container relative mx-auto max-h-svh items-center overflow-auto rounded-2xl bg-gray-150 stroke-gray-800 stroke-1 !p-10 !pb-0'
				ref={containerRef}
			>
				<div className='max-w-screen-md gap-8 self-center pb-10'>
					<h2>{t('title')}</h2>
					<p>{t('description')}</p>
					<hr />
					<div className='flex-row justify-between text-gray-900'>
						<p>{t('necessary')}</p>
						<p>{t('required')}</p>
					</div>
					<hr />
					<div className='flex-row justify-between text-gray-900'>
						<label className='w-full' htmlFor='marketing-consent'>
							{t('marketing-cookies')}
						</label>
						<Checkbox
							id='marketing-consent'
							checked={marketingConsent}
							onChange={(e) => setMarketingConsent(e.target.checked)}
						/>
					</div>
					<hr />
					<div className='flex-row justify-between text-gray-900'>
						<label className='w-full' htmlFor='personal-consent'>
							{t('personal-cookies')}
						</label>
						<Checkbox
							id='personal-consent'
							checked={personalConsent}
							onChange={(e) => setPersonalConsent(e.target.checked === true)}
						/>
					</div>
					<hr />
				</div>
				<div className='sticky bottom-0 left-0 right-0 w-full max-w-screen-md flex-row gap-2 bg-gray-150 pb-10 pt-4'>
					<button className='middle dark w-full' onClick={handleReject}>
						{t('reject')}
					</button>
					<button className='middle w-full' onClick={handleSubmit}>
						{t('accept')}
					</button>
				</div>
			</div>
		</section>
	)
}
