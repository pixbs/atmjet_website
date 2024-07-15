'use client'

import { useState } from 'react'

interface CounterInputProps {
	placeholder: string
}

export function CounterInput(props: CounterInputProps) {
	const { placeholder } = props
	const [count, setCount] = useState(1)

	const increment = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (count >= 25) {
			setCount(25)
			return
		}
		setCount(count + 1)
	}

	const decrement = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (count <= 1) {
			setCount(1)
			return
		}
		setCount(count - 1)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		// Assuming e.target.value is a string, convert it to a number first
		const value = Number(e.target.value)
		if (Number.isNaN(value)) {
			return
		}
		if (value < 1) {
			setCount(1)
			return
		}
		if (value > 25) {
			setCount(25)
			return
		}
		setCount(value)
	}

	return (
		<div className="flex-row items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-normal text-gray-100">
			<label className="pr-4">{placeholder}</label>
			<button
				className={`size-8 rounded-lg border border-gray-700 p-0 ${count <= 1 ? 'cursor-not-allowed opacity-50' : ''}`}
				children="-"
				onClick={decrement}
			/>
			<input
				className="w-10 border-none bg-transparent stroke-none p-0 py-1 text-center focus:stroke-none"
				defaultValue={count}
				onChange={handleChange}
				value={count}
			/>
			<button
				className={`size-8 rounded-lg border border-gray-700 p-0 ${count >= 25 ? 'cursor-not-allowed opacity-50' : ''}`}
				children="+"
				onClick={increment}
			/>
		</div>
	)
}
