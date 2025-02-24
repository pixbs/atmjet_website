interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	children: React.ReactNode[]
	label?: string
}

function Select({ children, className, label, name, id, ...rest }: SelectProps) {
	return (
		<div className='relative w-full overflow-hidden bg-gray-900 text-gray-100 md:rounded-md'>
			<label htmlFor={name} className='absolute left-7 top-4 text-xs font-semibold text-gray-500'>
				{label}
			</label>
			<select
				className={`w-full appearance-none rounded-none border-none bg-gray-900 pb-4 pl-6 pt-9 outline-none focus:outline-none focus:ring-0 ${className}`}
				name={id || name}
				{...rest}
			>
				{children}
			</select>
		</div>
	)
}

export default Select
