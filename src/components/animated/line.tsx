'use client'

import { motion } from 'framer-motion'

interface LineProps extends React.HTMLAttributes<HTMLDivElement> {
	isVertical?: boolean
}

function Line({ className, isVertical }: LineProps) {
	if (isVertical) {
		return (
			<motion.div
				initial={{ height: 0 }}
				whileInView={{ height: '100%' }}
				transition={{ duration: 1 }}
				className={`w-[1px] bg-gray-300 ${className}`}
			/>
		)
	} else {
		return (
			<motion.div
				initial={{ width: 0 }}
				whileInView={{ width: '100%' }}
				transition={{ duration: 1 }}
				className={`h-[1px] bg-gray-300 ${className}`}
			/>
		)
	}
}

export default Line
