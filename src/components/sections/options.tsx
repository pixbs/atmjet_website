import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

export function OptionsSection() {
	const t = useTranslations('options')

	return (
		<section>
			<div className='container gap-6 py-10 lg:flex-row lg:content-stretch'>
				<div className='relative h-80 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl bg-cover p-12'>
					<Link
						href='/business_agents'
						className='z-10 flex h-full flex-col items-start justify-between gap-8'
					>
						<h2 className='z-10'>{t('assistant')}</h2>
						<button>{t('button')}</button>
					</Link>
					<div className='option-darkening absolute inset-0' />
					<Image
						src='/images/home_page/For-Business-Agents-one.webp'
						alt='For Business Agents'
						className='-z-10 object-cover object-center'
						fill
						loading='lazy'
					/>
				</div>
				<div className='relative h-80 w-full items-start justify-center gap-6 overflow-hidden rounded-2xl bg-cover p-12'>
					<Link
						href='/partners'
						className='z-10 flex h-full flex-col items-start justify-between gap-8'
					>
						<h2 className='z-10'>{t('agencies')}</h2>
						<button>{t('button')}</button>
					</Link>
					<div className='absolute inset-0 -z-10 bg-gray-100 opacity-60' />
					<div className='option-darkening absolute inset-0 -z-10' />
					<Image
						src='/images/home_page/2-for-business-agents.webp'
						alt='For Business Agents'
						className='-z-20 object-cover object-center'
						fill
						loading='lazy'
					/>
				</div>
			</div>
		</section>
	)
}
