interface TestimonialsCardProps {
	description: string
	name: string
	title: string
}

export function TestimonialsCard(props: TestimonialsCardProps) {
	const { description, name, title } = props

	return (
		<div className="embla__slide relative mr-8 flex w-5/6 flex-shrink-0 flex-col items-stretch justify-between gap-3 rounded-xl bg-gray-100 p-8">
			<p className="h-64 pr-12 text-gray-900">“{description}”</p>
			<div className="relative -mx-4 -mb-4 flex flex-col gap-1 rounded-xl bg-gray-150 p-4 pr-40">
				<p className="font-serif text-xl text-gray-900">{name}</p>
				<p>{title}</p>
				<div className="absolute bottom-3 right-0 right-4 size-32 rounded-2xl bg-blue-100" />
			</div>
		</div>
	)
}