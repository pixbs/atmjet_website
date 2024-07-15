'use client'

import { useState, useEffect } from 'react'
import { useController, useFormContext } from 'react-hook-form'

interface CounterInputProps {
	label: string
	id: string
}

export function CounterInput(props: CounterInputProps) {
	const { control } = useFormContext()
	const {
		field: { value, onChange, onBlur },
	} = useController({
		name: props.id,
		control,
		defaultValue: 1,
	})

	const { label, id } = props

	// Sync internal state with the form state
	useEffect(() => {
		setCount(value)
	}, [value])

	const [count, setCount] = useState(value)

	const increment = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (count >= 25) {
			setCount(25)
			onChange(25)
			return
		}
		const newCount = count + 1
		setCount(newCount)
		onChange(newCount)
	}

	const decrement = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (count <= 1) {
			setCount(1)
			onChange(1)
			return
		}
		const newCount = count - 1
		setCount(newCount)
		onChange(newCount)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		const value = Number(e.target.value)
		if (Number.isNaN(value)) {
			return
		}
		if (value < 1) {
			setCount(1)
			onChange(1)
			return
		}
		if (value > 25) {
			setCount(25)
			onChange(25)
			return
		}
		setCount(value)
		onChange(value)
	}

	return (
		<div className="flex-row items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-normal text-gray-100">
			<label className="pr-4">{label}</label>
			<button
				className={`size-8 rounded-lg border border-gray-700 p-0 ${count <= 1 ? 'cursor-not-allowed opacity-50' : ''}`}
				children="-"
				onClick={decrement}
			/>
			<input
				className="w-10 border-none bg-transparent stroke-none p-0 py-1 text-center focus:stroke-none"
				onChange={handleChange}
				value={count}
				onBlur={onBlur}
			/>
			<button
				className={`size-8 rounded-lg border border-gray-700 p-0 ${count >= 25 ? 'cursor-not-allowed opacity-50' : ''}`}
				children="+"
				onClick={increment}
			/>
		</div>
	)
}
