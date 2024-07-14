'use client'
interface HeroSectionProps {
	title: string
}

export function HeroSection(props: HeroSectionProps) {
	const { title } = props
	return (
		<section className='bg-blue-500'>
			<div className="container h-svh justify-center gap-2 !my-0 z-10">
				<p className="text-center text-sm">ATMJET</p>
				<h1 className="text-center animate-in duration-1000 fade-in slide-in-from-top-10">{title}</h1>
				<p className="absolute bottom-8 left-5 text-sm">©ATM JET</p>
				{/* <RequestForm /> */}
			</div>
			<div className='hero-darkening absolute inset-0'/>
		</section>
	)
}
