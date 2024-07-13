import { RequestForm } from "../form"

interface HeroSectionProps {
	"title": string
}

export function HeroSection(props: HeroSectionProps) {
	const { title } = props
	return (
		<section>
			<div className="container">
				<h1>{title}</h1>
				<RequestForm />
			</div>
		</section>
	)
}
