import Image from 'next/image'
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
				<Image
					src={imageUrl}
					alt={title}
					className='h-64 w-full rounded-2xl object-cover'
					loading='lazy'
					width={1920}
					height={1080}
				/>
			</div>
		</section>
	)
}
