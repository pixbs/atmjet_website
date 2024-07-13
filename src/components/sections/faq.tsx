import { useTranslations } from "next-intl"

export function FaqSection() {
	const t = useTranslations('faq')
	const accordions = ["accordion1", "accordion2", "accordion3", "accordion4", "accordion5"]

	return (
		<section>
			<div className="container">
				<h2>{t('title')}</h2>
				<div>
					{accordions.map((accordion, index) => (
						<Accordion
							question={t(`question${index + 1}`)}
							answer={t(`answer${index + 1}`)}
							key={index.toString()}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

interface AccordionProps {
	question: string,
	answer: string,
}

function Accordion (props: AccordionProps) {
	const { question, answer } = props

	return (
		<div className="flex flex-col gap-3 p-6 items-stretch">
			<div className="flex flex-row content-between">
				<h3>{question}</h3>
			</div>
			<div className="flex flex-row">
				<p>{answer}</p>
			</div>
		</div>
	)
}