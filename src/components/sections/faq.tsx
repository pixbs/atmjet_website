'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Accordion } from '../elements'

export function FaqSection() {
	const t = useTranslations('faq')
	const accordions = ['accordion1', 'accordion2', 'accordion3', 'accordion4', 'accordion5']
	const [expanded, setExpanded] = useState<false | number>(0)

	return (
		<section>
			<div className='container lg:flex-row'>
				<h2 className='max-w-10 shrink-0 md:min-w-80'>{t('title')}</h2>
				<div className='pt-4'>
					{accordions.map((accordion, index) => (
						<div className='gap-6 border-b border-gray-300 py-6' key={index}>
							<Accordion
								i={index}
								expanded={expanded}
								setExpanded={setExpanded}
								title={t(`question${index + 1}`)}
								className='cursor-pointer font-serif text-2xl text-gray-900'
							>
								<div className='flex flex-row overflow-hidden'>
									<p>
										{t(`answer${index + 1}`)
											.split('\\n')
											.map((answer, index) => (
												<>
													<span key={index}>{answer}</span>
													<br key={index} />
												</>
											))}
									</p>
								</div>
							</Accordion>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

interface AccordionProps {
	question: string
	answer: string[]
}

function Accordiontwo(props: AccordionProps) {
	const { question, answer } = props

	return (
		<div className='flex flex-col items-stretch gap-3 p-6'>
			<div className='flex flex-row content-between'>
				<h3>{question}</h3>
			</div>
		</div>
	)
}
