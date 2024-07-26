'use client'
import { InputHTMLAttributes, useEffect, useState } from 'react'

interface AutoCompleteProps extends InputHTMLAttributes<HTMLInputElement> {
	suggestionsFile?: string
}

export function AutoComplete(props: AutoCompleteProps) {
	const { value, onChange, suggestionsFile = 'data/autocomplete.json', ...inputProps } = props
	const [suggestions, setSuggestions] = useState<string[]>([])
	const [showSuggestions, setShowSuggestions] = useState(false)

	useEffect(() => {
		// Fetch suggestions from the JSON file
		fetch(suggestionsFile)
			.then((res) => res.json())
			.then((data) => setSuggestions(data))
			.catch((err) => console.error(err))
	}, [suggestionsFile])

	const filteredSuggestions = suggestions
		.filter((suggestion) => suggestion.toLowerCase().includes((value as string).toLowerCase()))
		.slice(0, 10)

	return (
		<div className='relative'>
			<input
				type='text'
				value={value}
				onChange={(e) => {
					if (onChange) {
						onChange(e)
					}
					setShowSuggestions(true)
				}}
				onBlur={() => {
					setTimeout(() => {
						setShowSuggestions(false)
					}, 200)
				}}
				{...inputProps}
			/>
			{showSuggestions && filteredSuggestions.length > 0 && (
				<ul className='absolute bottom-0 z-10 mt-4 max-h-40 w-full translate-y-full overflow-y-auto rounded-xl border bg-gray-900 shadow-lg'>
					{filteredSuggestions.map((suggestion, index) => (
						<li
							key={index}
							className='cursor-pointer px-4 py-2 text-gray-100 hover:bg-gray-800'
							onClick={() => {
								if (onChange) {
									onChange({ target: { value: suggestion } } as any)
								}
								setShowSuggestions(false)
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
