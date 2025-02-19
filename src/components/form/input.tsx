interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
}

function Input({ className, label, id, name, ...rest }: InputProps) {
	return (
		<div className={`relative w-full bg-gray-900 text-gray-100 ${className}`}>
			<label htmlFor={name} className='absolute left-7 top-4 text-xs font-semibold text-gray-500'>
				{label}
			</label>
			<input className={`px-7 pb-4 pt-9 ${className}`} name={id || name} {...rest} />
		</div>
	)
}

export default Input
