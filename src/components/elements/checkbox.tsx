import Check from '@/assets/svg/check.svg'
import { InputHTMLAttributes } from 'react'

interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox(props: CheckBoxProps) {
	const { className, ...inputProps } = props
	return (
		<div className={`relative ${className}`}>
			<input
				type='checkbox'
				className='peer relative box-border flex h-6 w-6 cursor-pointer appearance-none items-center rounded-sm border-2 border-gray-900 bg-gray-100 p-0'
				{...inputProps}
			/>
			<Check className='pointer-events-none absolute right-0 top-0 z-10 hidden h-6 w-6 text-gray-900 peer-checked:block' />
		</div>
	)
}
