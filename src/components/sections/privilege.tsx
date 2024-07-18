import { useTranslations } from 'next-intl'

export function PrivilegeSection() {
	const t = useTranslations('privilege')

	return (
		<section>
			<div className='container'>
				<div className='gap-10 overflow-hidden rounded-2xl bg-gold lg:flex-row-reverse lg:items-center'>
					<div
						className='h-64 w-full bg-cover bg-center lg:h-80'
						style={{ backgroundImage: 'url(images/home_page/why_us_clients.jpg)' }}
					/>
					<div className='w-full items-center gap-4 px-6 pb-10 lg:h-80 lg:items-start lg:py-10 lg:pb-0'>
						<h2 className='text-center text-gray-100 lg:text-left'>{t('title')}</h2>
						<p className='text-center text-gray-100 lg:text-left'>{t('description')}</p>
						<button className='big'>{t('button')}</button>
					</div>
				</div>
			</div>
		</section>
	)
}
