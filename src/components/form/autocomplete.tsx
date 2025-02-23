'use client'

import getAirports from '@/utils/getAiport'
import { debounce } from 'lodash'
import { useLocale } from 'next-intl'
import { useMemo, useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
}

function Autocomplete({ className, label, id, name, ...rest }: InputProps) {
	const [autocomplete, setAutocomplete] = useState<string[]>([])
	const [inputValue, setInputValue] = useState('')
	const locale = useLocale()

	const debounceSearch = useMemo(
		() =>
			debounce(async (searchTerm: string) => {
				const results = await getAirports(searchTerm, locale)
				setAutocomplete(results)
			}, 300),
		[locale],
	)

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		debounceSearch(e.target.value)
		setInputValue(e.target.value)
	}

	const handleBlur = () => {
		setTimeout(() => {
			setAutocomplete([])
		}, 200)
	}

	return (
		<div className={`relative w-full text-gray-100`}>
			<label htmlFor={name} className='absolute left-7 top-4 text-xs font-semibold text-gray-500'>
				{label}
			</label>
			<input
				className={`px-7 pb-4 pt-9 ${className}`}
				value={inputValue}
				name={id || name}
				onChange={handleChange}
				onBlur={handleBlur}
				{...rest}
			/>
			{autocomplete.length > 0 && (
				<ul className='absolute bottom-0 z-[999] mt-4 max-h-40 w-80 shrink-0 translate-y-full overflow-y-auto rounded-xl border bg-gray-900 shadow-lg'>
					{autocomplete.map(
						(suggestion, index) =>
							index > 0 && (
								<li
									key={index}
									className='cursor-pointer px-4 py-2 text-gray-100 hover:bg-gray-800'
									onClick={() => {
										setInputValue(suggestion)
										setAutocomplete([])
									}}
								>
									{suggestion}
								</li>
							),
					)}
				</ul>
			)}
		</div>
	)
}

export default Autocomplete
