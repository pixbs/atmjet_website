'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'
import Logo from '@/assets/svg/logo.svg'
import { useState } from 'react'
import { BookingModal } from './booking_modal'

export function FooterSection() {
	const [isOpened, setIsOpened] = useState(false)
	const t = useTranslations()
	const locale = useLocale()

	const year = new Date().getFullYear()

	const handleOpen = () => {
		setIsOpened(true)
		isOpened ? (document.body.style.overflow = 'auto') : (document.body.style.overflow = 'hidden')
	}

	const handleClose = () => {
		setIsOpened(false)
		document.body.style.overflow = 'auto'
	}

	return (
		<>
			<section
				className='bg-cover bg-fixed bg-top bg-no-repeat'
				style={{ backgroundImage: 'url(/images/home_page/footer.jpg)' }}
			>
				<footer className='container !static !mb-0 !mt-24 gap-8 rounded-t-2xl bg-gray-100 bg-opacity-60 py-10 backdrop-blur-lg'>
					<div className='flex-row content-between justify-between'>
						<Logo className='h-8 text-gray-900' />
						<div className='flex-row gap-4'>
							<Link href='/en' className={`text-base ${locale == 'en' && 'opacity-50'}`}>
								{t('locale.en')}
							</Link>
							<Link href='/ru' className={`text-base ${locale == 'ru' && 'opacity-50'}`}>
								{t('locale.ru')}
							</Link>
							<Link href='/uk' className={`text-base ${locale == 'uk' && 'opacity-50'}`}>
								{t('locale.uk')}
							</Link>
						</div>
					</div>
					<div className='w-full flex-row justify-between'>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href='/'>{t('navigation.home')}</Link>
							<Link href='https://atmjet.webflow.io/agencies'>{t('navigation.partners')}</Link>
							<Link href='https://atmjet.webflow.io/business-agents'>
								{t('navigation.bussines-agents')}
							</Link>
							<Link href='https://atmjet.webflow.io/medical-aviation'>
								{t('navigation.medical-aviation')}
							</Link>
							<Link href='https://atmjet.webflow.io/empty-legs'>{t('navigation.empty-legs')}</Link>
							<Link href='https://atmjet.webflow.io/cargo-charter'>
								{t('navigation.cargo-charter')}
							</Link>
						</div>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href='/' className='flex items-center'>
								{t('social-media.telegram')}
								<ArrowTopRight className='size-10' />
							</Link>
							<Link href='/' className='flex items-center'>
								{t('social-media.whats-app')}
								<ArrowTopRight className='size-10' />
							</Link>
							<Link href='/' className='flex items-center'>
								{t('social-media.instagram')}
								<ArrowTopRight className='size-10' />
							</Link>
						</div>
					</div>
					<div className='w-full flex-row justify-between'>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href='/sales_dept'>{t('navigation.sales-dept')}</Link>
							<Link href='https://atmjet.webflow.io/group-charters'>
								{t('navigation.group-charters')}
							</Link>
							<Link href='https://atmjet.webflow.io/atm-group'>{t('navigation.atmjet-group')}</Link>
							<Link href='https://atmjet.webflow.io/aircraft'>{t('navigation.aircraft')}</Link>
							<Link href='/yachts'>{t('navigation.yachts')}</Link>
						</div>
					</div>
					<div className='items-center gap-2'>
						<button onClick={handleOpen}>{t('footer.button')}</button>
						<p>{t('footer.location')}</p>
						<p>{t('footer.copyright', { year })}</p>
					</div>
				</footer>
			</section>
			{isOpened && <BookingModal closeModal={handleClose} />}
		</>
	)
}
