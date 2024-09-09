'use client'

import { useController, useFormContext } from 'react-hook-form'

export function CounterInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
	const { control } = useFormContext()
	const {
		field: { value, onChange, onBlur },
	} = useController({
		name: props.name || 'passengers',
		control,
		defaultValue: 1,
	})

	const { placeholder, className, ...inputProps } = props

	const increment = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		const newCount = Math.min(25, value + 1)
		onChange(newCount)
	}

	const decrement = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		const newCount = Math.max(1, value - 1)
		onChange(newCount)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(e.target.value)
		if (!Number.isNaN(newValue)) {
			onChange(Math.min(25, Math.max(1, newValue)))
		}
	}

	return (
		<div
			className={`flex-row items-center rounded-sm bg-gray-900 px-4 py-2.5 text-sm font-normal text-gray-100 ${className}`}
		>
			<label 
				className='pr-4'
				htmlFor='passengers'
			>
				{placeholder}

			</label>
			<button
				className={`size-8 rounded-lg border border-gray-700 p-0 ${value <= 1 ? 'cursor-not-allowed opacity-50' : ''}`}
				onClick={decrement}
			>
				-
			</button>
			<input
				className='w-10 border-none bg-transparent stroke-none p-0 py-1 text-center focus:stroke-none'
				id='passengers'
				value={value}
				onChange={handleChange}
				onBlur={onBlur}
				{...inputProps}
			/>
			<button
				className={`size-8 rounded-lg border border-gray-700 p-0 ${value >= 25 ? 'cursor-not-allowed opacity-50' : ''}`}
				onClick={increment}
			>
				+
			</button>
		</div>
	)
}
