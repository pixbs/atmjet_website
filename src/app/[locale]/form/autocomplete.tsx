'use client'
import { getAirport } from '@/app/actions'
import { useLocale } from 'next-intl'
import { InputHTMLAttributes, useState } from 'react'
import { Input } from './input'

export function AutoComplete(props: InputHTMLAttributes<HTMLInputElement>) {
	const listId = `${props.id}-list`
	const [autocomplete, setAutocomplete] = useState<string[]>([])
    const locale = useLocale()

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const str = e.target.value
		let res = await getAirport(str, locale)
		setAutocomplete(
			str.toLocaleLowerCase().includes('saint') ? res.map((res) => res.replace(/st\b/gi, 'Saint')) : res,
		)
	}

	return (
		<>
			<Input {...props} list={listId} onChange={handleChange} />
			<datalist id={listId}>
				{autocomplete.map((suggestion, index) => (
					<option key={index} value={suggestion} />
				))}
			</datalist>
		</>
	)
}
