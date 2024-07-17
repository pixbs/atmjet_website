'use client'

import BurgerMenu from '@/assets/svg/burger-menu.svg'
import Close from '@/assets/svg/close.svg'
import Logo from '@/assets/svg/logo.svg'
import { useState } from 'react'

export function HeaderSection() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const handleClick = () => setIsMenuOpen(!isMenuOpen)

	return (
		<section className='fixed left-0 right-0 top-0 z-50'>
			<div className='container'>
				<header className='flex flex-row justify-between'>
					<button className={isMenuOpen ? 'p-2' : 'bg-transparent p-2 text-gray-900'}>
						{isMenuOpen ? (
							<Close className='h-8 animate-in spin-in' onClick={handleClick} />
						) : (
							<BurgerMenu className='h-8 animate-in spin-in' onClick={handleClick} />
						)}
					</button>
					<Logo className='h-8 text-gray-900' />
				</header>
			</div>
		</section>
	)
}
