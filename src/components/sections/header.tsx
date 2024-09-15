'use client'

import BurgerMenu from '@/assets/svg/burger-menu.svg'
import Close from '@/assets/svg/close.svg'
import Logo from '@/assets/svg/logo.svg'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Navbar } from './navbar'

export function HeaderSection() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const [showHeader, setShowHeader] = useState(true)
	const [lastScrollY, setLastScrollY] = useState(0)
	const path = usePathname()
	const locale = useLocale()

	useEffect(() => {
		document.body.style.overflow = 'auto'
		setIsMenuOpen(false)
	}, [path])

	const handleClick = () => {
		setIsMenuOpen(!isMenuOpen)
		isMenuOpen ? (document.body.style.overflow = 'auto') : (document.body.style.overflow = 'hidden')
	}

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY

			if (currentScrollY > 50) {
				setIsScrolled(true)
			} else {
				setIsScrolled(false)
			}

			if (currentScrollY > lastScrollY) {
				setShowHeader(false) // Scrolling down
			} else {
				setShowHeader(true) // Scrolling up
			}

			setLastScrollY(currentScrollY)
		}

		window.addEventListener('scroll', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [lastScrollY])

	return (
		<>
			<section
				className={`fixed left-0 right-0 top-0 z-50 transition-all duration-700 ${isScrolled ? 'bg-gray-100 bg-opacity-20 backdrop-blur-xl' : 'bg-transparent'} ${showHeader || isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
			>
				<div className={`container !my-8`}>
					<header className='flex flex-row justify-between'>
						<button
							className={isMenuOpen ? 'p-2' : 'bg-transparent p-2 text-gray-900'}
							aria-label='Open/Close menu button'
						>
							{isMenuOpen ? (
								<Close className='h-8 animate-in spin-in' onClick={handleClick} />
							) : (
								<BurgerMenu className='h-8 animate-in spin-in' onClick={handleClick} />
							)}
						</button>
						<Link href={`/${locale}/`} aria-label='Logotype, leads to home page'>
							<Logo className='h-8 text-gray-900' />
						</Link>
					</header>
				</div>
			</section>
			{isMenuOpen && <Navbar />}
		</>
	)
}
