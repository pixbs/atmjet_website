import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function OptionsSection() {
	const t = useTranslations('options')

	return (
		<section>
			<div className='container gap-6 lg:flex-row lg:content-stretch'>
				<div
					className='relative h-64 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl bg-cover p-6'
					style={{ backgroundImage: 'url(/images/home_page/For-Business-Agents-one.webp)' }}
				>
					<Link href='/business_agents' className='z-10 gap-10'>
						<h2 className='z-10'>{t('assistant')}</h2>
						<button>{t('button')}</button>
					</Link>
					<div className='option-darkening absolute inset-0' />
				</div>
				<div
					className='relative h-64 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl bg-cover p-6'
					style={{ backgroundImage: 'url(/images/home_page/2-for-business-agents.webp)' }}
				>
					<Link href='/partners' className='z-10 gap-10'>
						<h2 className='z-10'>{t('agencies')}</h2>
						<button>{t('button')}</button>
					</Link>
					<div className='option-darkening absolute inset-0' />
				</div>
			</div>
		</section>
	)
}
