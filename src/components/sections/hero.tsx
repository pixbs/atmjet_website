import { RequestForm } from '../form'

interface HeroSectionProps {
	title: string
}

export function HeroSection(props: HeroSectionProps) {
	const { title } = props
	return (
		<section>
			<div className="container h-svh justify-center gap-2">
				<p className="text-center text-sm">ATMJET</p>
				<h1 className="text-center">{title}</h1>
				<p className="absolute bottom-16 left-5 text-sm">©ATM JET</p>
				{/* <RequestForm /> */}
			</div>
		</section>
	)
}
