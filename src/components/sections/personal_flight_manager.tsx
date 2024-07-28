'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function PersonalFlightManagerSection() {
	const t = useTranslations('personal-flight-manager')
	return (
		<>
			<section>
				<div className='container'>
					<div className='card gap-8 bg-gray-150 p-8 md:gap-10 md:p-10'>
						<div className='gap-4'>
							<h2 className='md:text-center'>{t('title')}</h2>
							<p className='md:text-center'>{t('description')}</p>
						</div>
						<div className='gap-6'>
							<hr />
							<h3 className='bg-gold bg-clip-text text-transparent lg:text-center'>
								{t('subtitle')}
							</h3>
							<hr />
						</div>
						<Link href='?showBooking' scroll={false} className='self-center'>
							<button className='big'>
								{t('button')}
							</button>
						</Link>
					</div>
				</div>
			</section>
		</>
	)
}
