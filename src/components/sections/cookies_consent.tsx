'use client'
import { hasCookie, setCookie } from 'cookies-next'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CookiesModal } from './cookies_modal'

export function CookiesConsent() {
	const t = useTranslations('cookies')
	const [isOpened, setIsOpened] = useState(false)
	const [showToast, setShowToast] = useState(false)

	useEffect(() => {
		setShowToast(!hasCookie('cookie-consent'))
	}, [])

	const handleAccept = () => {
		setCookie('marketing-consent', true)
		setCookie('personal-consent', true)
		setCookie('cookie-consent', true)
		setShowToast(false)
	}

	const handleReject = () => {
		setCookie('marketing-consent', false)
		setCookie('personal-consent', false)
		setCookie('cookie-consent', true)
		setShowToast(false)
	}

	return (
		showToast && (
			<>
				<section className='fixed inset-0 top-auto z-[900]'>
					<div className='container !flex-row flex-wrap gap-6 rounded-2xl bg-gray-150 p-6 duration-300 animate-in fade-in slide-in-from-top-10'>
						<p className=' '>
							{t('message')}{' '}
							<Link className='text-gray-900' href='/privacy'>
								{t('privacy-policy')}
							</Link>
						</p>
						<div className='flex-row flex-wrap items-center gap-2'>
							<button className='middle dark w-full md:w-auto' onClick={() => setIsOpened(true)}>
								{t('customize')}
							</button>
							<button className='middle dark w-full md:w-auto' onClick={handleReject}>
								{t('reject-all')}
							</button>
							<button className='middle w-full md:w-auto' onClick={handleAccept}>
								{t('accept-all')}
							</button>
						</div>
					</div>
				</section>
				{isOpened && <CookiesModal closeModal={() => setIsOpened(false)} />}
			</>
		)
	)
}
