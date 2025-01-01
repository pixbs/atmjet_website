'use client'

import Logo from '@/assets/svg/logo.svg'
import { motion } from 'framer-motion'

interface PreloaderProps {
	isStatic?: boolean
}

export function Preloader({ isStatic = false }: PreloaderProps) {
	const backgroundAnimation = {
		hidden: {
			opacity: 1,
			height: '100%',
			display: 'flex',
		},
		visible: {
			opacity: 0,
			height: '0%',
			display: 'none',
		},
	}
	const logoAnimation = {
		hidden: {
			opacity: 0,
			y: -40,
		},
		visible: {
			opacity: [0, 1, 1, 1, 0, 0],
			y: [-40, 0, 0, -40, -40, -40],
			display: ['none', 'flex', 'flex', 'flex', 'none', 'none'],
		},
	}
	return (
		<>
			<motion.div
				className='fixed inset-0 z-[998] items-center justify-center bg-gray-150'
				initial={isStatic ? backgroundAnimation.visible : backgroundAnimation.hidden}
				animate={isStatic || backgroundAnimation.visible}
				transition={{ duration: 0.5, delay: 2 }}
			></motion.div>
			<motion.div
				className='fixed inset-0 z-[999] flex items-center justify-center'
				initial={
					isStatic
						? {
								opacity: 1,
								y: 0,
							}
						: {
								opacity: 0,
								y: -40,
							}
				}
				animate={{
					opacity: isStatic ? [1] : [0, 1, 1, 1, 0, 0],
					y: isStatic ? [0] : [-40, 0, 0, -40, -40, -40],
					display: isStatic ? ['flex'] : ['none', 'flex', 'flex', 'flex', 'none', 'none'],
				}}
				transition={{ duration: 4 }}
			>
				<Logo className='w-[60vw] max-w-sm text-gray-900' />
			</motion.div>
		</>
	)
}
