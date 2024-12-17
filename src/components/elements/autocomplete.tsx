'use client'
import getAirports from '@/utils/getAiport'
import { debounce } from 'lodash'
import { useLocale } from 'next-intl'
import { InputHTMLAttributes, useMemo, useState } from 'react'

export function AutoComplete(props: InputHTMLAttributes<HTMLInputElement>) {
	const { value, onChange, ...inputProps } = props
	const [autocomplete, setAutocomplete] = useState<string[]>([])
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
		const res = await getAirports(e.target.value, locale)
		setAutocomplete(res)
	}

	return (
		<div className='relative'>
			<input
				type='text'
				value={value}
				onChange={(e) => {
					if (onChange) {
						onChange(e)
					}
					debounceSearch(e.target.value)
				}}
				onBlur={() => {
					setTimeout(() => {
						setAutocomplete([])
					}, 200)
				}}
				{...inputProps}
			/>
			{autocomplete.length > 1 && (
				<ul className='absolute bottom-0 z-50 mt-4 max-h-40 w-80 shrink-0 translate-y-full overflow-y-auto rounded-xl border bg-gray-900 shadow-lg'>
					{autocomplete.map(
						(suggestion, index) =>
							index > 0 && (
								<li
									key={index}
									className='cursor-pointer px-4 py-2 text-gray-100 hover:bg-gray-800'
									onClick={() => {
										if (onChange) {
											onChange({ target: { value: suggestion } } as any)
										}
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
