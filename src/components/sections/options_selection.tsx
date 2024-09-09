import Image from 'next/image'
interface OptionsSelectionSectionProps {
	title: string
	card1: {
		title: string
		description: string
		list: string[]
		imageSrc: string
	}
	card2: {
		title: string
		description: string
		list: string[]
		imageSrc: string
	}
}

export function OptionsSelectionSection(props: OptionsSelectionSectionProps) {
	const { title, card1, card2 } = props
	return (
		<section>
			<div className='container gap-8'>
				<h2 className='text-center'>{title}</h2>
				<div className='gap-8 lg:flex-row'>
					<OptionCard {...card1} />
					<OptionCard {...card2} />
				</div>
			</div>
		</section>
	)
}

interface OptionCardProps {
	title: string
	description: string
	list: string[]
	imageSrc: string
}

function OptionCard(props: OptionCardProps) {
	const { title, description, list, imageSrc } = props
	return (
		<div className='card sticky w-full gap-4 overflow-hidden bg-gray-150'>
			<Image 
				src={imageSrc}
				alt={title}
				className='h-48 bg-cover bg-center' 
				loading='lazy'
				width={564}
				height={100}
			/>
			<div className='gap-4 p-8'>
				<h3 className='bg-gold bg-clip-text text-transparent'>{title}</h3>
				<p>{description}</p>
			</div>
			<div className='gap-1 p-8 pt-0'>
				{list.map((item, index) => (
					<div key={index} className='rounded-lg bg-gray-100 px-6 py-4 text-gray-800'>
						<p className='bg-gold bg-clip-text text-transparent'>{item}</p>
					</div>
				))}
			</div>
		</div>
	)
}
