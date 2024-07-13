interface HeroSectionProps {
	headline: string;
}

export function HeroSection(props : HeroSectionProps) {
	const {headline} = props;
	return (
		<section>
			<div className="container">
				<h1>{headline}</h1>
			</div>
		</section>
	)
}
