'use client'
import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface CounterProps {
	children: string
	className?: string
}

export function Counter({ children, className = '' }: CounterProps) {
	const controls = useAnimation()
	const [ref, inView] = useInView()
	const [count, setCount] = useState<string>(children)

	useEffect(() => {
		if (inView) {
			controls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } })
			const duration = 800
			const incrementTime = 30

			const matches = children.match(/\d+([,.]\d+)?/g)
			if (!matches) return

			const numbers = matches.map((num) => parseFloat(num.replace(/,/g, '')))
			const startNumbers = Array(numbers.length).fill(0)

			const step = (start: number[]) => {
				const newStart = start.map((num, index) => {
					const increment = numbers[index] / (duration / incrementTime)
					return num + increment
				})

				let numIndex = 0
				const formattedCount = children.replace(/\d+([,.]\d+)?/g, () => {
					const num = newStart[numIndex].toLocaleString(undefined, {
						maximumFractionDigits: 0,
					})
					numIndex++
					return num
				})

				setCount(formattedCount)

				if (newStart.every((num, index) => num >= numbers[index])) {
					setCount(children)
				} else {
					setTimeout(() => step(newStart), incrementTime)
				}
			}

			step(startNumbers)
		} else {
			controls.start({ opacity: 0, y: -20 })
			setCount(children)
		}
	}, [inView, controls, children])

	return (
		<motion.span
			ref={ref}
			className={className}
			initial={{ opacity: 0, y: -20 }}
			animate={controls}
		>
			{count}
		</motion.span>
	)
}
