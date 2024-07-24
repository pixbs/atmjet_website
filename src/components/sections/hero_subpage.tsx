interface SubpageHeroSectionProps {
	title: string
	description: string
	imageUrl: string
}

export function SubpageHeroSection(props: SubpageHeroSectionProps) {
	const { title, description, imageUrl } = props

	return (
		<section>
			<div className='container gap-20 pt-32'>
				<div className='gap-4'>
					<h1 className='text-center'>{title}</h1>
					<p className='text-center'>{description}</p>
				</div>
				<div
					className='h-64 rounded-2xl bg-cover bg-center bg-no-repeat'
					style={{ backgroundImage: `url(${imageUrl})` }}
				/>
			</div>
		</section>
	)
}
