'use client'

import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'
import Close from '@/assets/svg/close.svg'
import Plane from '@/assets/svg/plane.svg'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { LocaleSwitch } from '../elements'

export function AngleBar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const handleClick = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	return (
		<section className='pointer-events-none fixed bottom-0 left-0 right-0 z-30 bg-blend-difference'>
			<div className='container items-end'>
				<div
					className={`relative z-40 rounded-full p-4 bg-blend-difference backdrop-blur-2xl ${isMenuOpen ? 'bg-gray-800' : 'bg-gray-150 bg-opacity-10'}`}
				>
					{isMenuOpen ? (
						<Close
							className='pointer-events-auto z-10 size-9 cursor-pointer text-gray-150 bg-blend-difference animate-in spin-in'
							onClick={handleClick}
						/>
					) : (
						<Plane
							className='pointer-events-auto z-10 size-9 cursor-pointer bg-blend-difference animate-in spin-in'
							onClick={handleClick}
						/>
					)}
				</div>
				{isMenuOpen && <MenuBar />}
			</div>
		</section>
	)
}

export function MenuBar() {
	const t = useTranslations()
	const locale = useLocale()
	return (
		<div className='pointer-events-auto absolute bottom-0 right-10 -mb-1.5 -mr-1.5 flex-row rounded-2xl bg-gray-900 px-7 py-5 text-gray-150 lg:right-16'>
			<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
				<Link href='https://t.me/melentev1' className='flex items-center'>
					{t('social-media.telegram')}
					<ArrowTopRight className='size-10 text-gray-500' />
				</Link>
				<Link href='https://wa.me/+79602312584' className='flex items-center'>
					{t('social-media.whats-app')}
					<ArrowTopRight className='size-10 text-gray-500' />
				</Link>
				<Link href='https://www.instagram.com/atmjet/' className='flex items-center'>
					{t('social-media.instagram')}
					<ArrowTopRight className='size-10 text-gray-500' />
				</Link>
				{locale == 'ru' && (
					<Link href='/citizens' className='pt-10'>
						{t('navigation.citizens')}
					</Link>
				)}
				<Link href='?showBooking=Angle_bar' className='mr-16 mt-4 self-start' scroll={false}>
					<button className='bg-gray-150 text-gray-900'>{t('footer.button')}</button>
				</Link>
			</div>
			<div className='h-full items-start justify-end'>
				<LocaleSwitch />
			</div>
		</div>
	)
}
