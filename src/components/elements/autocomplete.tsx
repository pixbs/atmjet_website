'use client'
import { getAirport } from '@/app/actions'
import { useLocale } from 'next-intl'
import { InputHTMLAttributes, useState } from 'react'

export function AutoComplete(props: InputHTMLAttributes<HTMLInputElement>) {
	const { value, onChange, ...inputProps } = props
	const [autocomplete, setAutocomplete] = useState<string[]>([])
	const locale = useLocale()

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const res = await getAirport(e.target.value, locale)
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
					handleChange(e)
				}}
				onBlur={() => {
					setTimeout(() => {
						setAutocomplete([])
					}, 200)
				}}
				{...inputProps}
			/>
			{autocomplete.length > 1 && (
				<ul className='absolute bottom-0 z-10 mt-4 max-h-40 w-80 translate-y-full overflow-y-auto rounded-xl border bg-gray-900 shadow-lg shrink-0'>
					{autocomplete.map((suggestion, index) => (
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
					))}
				</ul>
			)}
		</div>
	)
}
