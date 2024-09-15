import { useTranslations } from 'next-intl'
import Image from 'next/image'
export function PersonalManagerSection() {
	const t = useTranslations('personal-manager')
	const chips: string[] = t('chips')
		.split(';')
		.map((item) => item.trim())

	return (
		<section>
			<div className='container'>
				<div className='gap-10 overflow-hidden rounded-2xl bg-gray-150 lg:flex-row-reverse lg:items-center'>
					<Image
						src='/images/jets_dep/personal_manager.jpg'
						alt='personal manager'
						width={1920}
						height={1080}
						className='h-64 w-full bg-cover bg-center lg:h-96'
						loading='lazy'
					/>
					<div className='w-full gap-4 px-6 pb-10 lg:items-start lg:py-10'>
						<h2 className='bg-gold bg-clip-text text-transparent'>{t('title')}</h2>
						<p>{t('description')}</p>
						<div className='flex-row flex-wrap gap-2'>
							{chips.map((chip, index) => (
								<p
									key={index}
									className='rounded-lg bg-gray-100 p-2 text-sm uppercase text-gray-800'
								>
									{chip}
								</p>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
