import { RequestForm } from "../form"

interface HeroSectionProps {
	"title": string
}

export function HeroSection(props: HeroSectionProps) {
	const { title } = props
	return (
		<section>
			<div className="container h-svh justify-center gap-2">
				<p className="text-center text-xs">
					ATMJET
				</p>
				<h1 className="text-center">
					{title}
				</h1>
				<p className=" absolute left-5 bottom-16 text-xs">
					©ATM JET
				</p>
				{/* <RequestForm /> */}
			</div>
		</section>
	)
}