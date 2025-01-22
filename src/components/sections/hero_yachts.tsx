import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

interface HeroYachtsSectionProps {
	overline?: string
	title?: string
	description?: string
	description2?: string
	button?: string
	isButtonHidden?: boolean
}

export function HeroYachtsSection(props: HeroYachtsSectionProps) {
	const t = useTranslations('yachts-hero')
	const {
		overline = t('overline'),
		title = t('title'),
		description = t('description'),
		description2 = t('description2'),
		button = t('button'),
		isButtonHidden = false,
	} = props

	return (
		<section className='min-h-[680]'>
			<div className='container z-20 !my-0 h-svh items-start justify-end gap-2 pb-14 md:justify-center'>
				<p className='text-sm uppercase'>{overline}</p>
				<h1 className='duration-1000 animate-in fade-in slide-in-from-top-10'>{title}</h1>
				<p className='max-w-lg pt-4 text-gray-900'>{description}</p>
				<p className='max-w-lg pt-4 text-gray-900'>{description2}</p>
				{isButtonHidden || (
					<Link href='?showBooking=Hero_yachts' scroll={false}>
						<button className='big mt-8'>{button}</button>
					</Link>
				)}
				<p className='absolute bottom-8 left-5 z-20 hidden text-sm md:block'>©ATM JET</p>
			</div>
			<div className='hero-darkening absolute inset-0 z-10' />
			<Image
				className='absolute inset-0 z-0 h-full w-full object-cover'
				loading='lazy'
				src='/images/yachts/yacht_page_firstscreen_mainpic.webp'
				alt='yacht'
				width={1920}
				height={1080}
			/>
		</section>
	)
}
