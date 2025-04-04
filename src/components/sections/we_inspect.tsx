import { useTranslations } from 'next-intl'
import { TestimonialsCarousel } from '../elements'
import Image from 'next/image'

export function WeInspectSection() {
	const t = useTranslations('we-incpect')
	const cards = ['card1', 'card2', 'card3', 'card4', 'card5']
	const images = [
		'/images/yachts/image_01.svg',
		'/images/yachts/image_02.svg',
		'/images/yachts/image_03.svg',
		'/images/yachts/image_04.svg',
		'/images/yachts/image_05.svg',
	]

	return (
		<section className='overflow-hidden'>
			<div className='container static gap-8'>
				<h2>{t('title')}</h2>
				<TestimonialsCarousel>
					{cards.map((card, index) => (
						<WeInspectCard
							description={t(`${card}.description`)}
							title={t(`${card}.title`)}
							key={index.toString()}
							imageSrc={images[index]}
						/>
					))}
				</TestimonialsCarousel>
			</div>
		</section>
	)
}

interface WeInspectCardProps {
	title: string
	description: string
	imageSrc: string
}

function WeInspectCard(props: WeInspectCardProps) {
	const { title, description, imageSrc } = props
	return (
		<div className='embla__slide mr-8 w-4/5 flex-shrink-0 justify-between gap-3 overflow-hidden rounded-xl bg-gray-150 bg-cover bg-center pt-8 last:mr-0 md:w-2/3 lg:w-1/3'>
			<div className='gap-3 px-8'>
				<h3 className=''>{title}</h3>
				<p className=''>{description}</p>
			</div>
			<Image
				src={imageSrc}
				alt={title}
				width={560}
				height={320}
				className='h-52 w-full object-cover object-center'
				loading='lazy'
			/>
		</div>
	)
}
