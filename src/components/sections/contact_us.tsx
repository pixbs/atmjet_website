import Link from 'next/link'

interface ContactUsSectionProps {
	title: string
	description?: string
	buttonText: string
	imageSrc: string
}

export function ContactUsSection(props: ContactUsSectionProps) {
	const { title, description, buttonText } = props

	return (
		<>
			<section
				className='bg-cover md:bg-fixed bg-center'
				style={{ backgroundImage: `url(${props.imageSrc})` }}
			>
				<div className='hero-darkening absolute inset-0' />
				<div className='container min-h-svh content-center items-center justify-center lg:min-h-[50svh]'>
					<h2 className='text-center'>{title}</h2>
					<p className='pt-4'>{description}</p>
					<Link href='?showBooking=Contact_us' scroll={false}>
						<button className='big mt-10'>{buttonText}</button>
					</Link>
				</div>
			</section>
		</>
	)
}
