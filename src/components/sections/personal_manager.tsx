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
				<div className='items-center gap-10 overflow-hidden rounded-2xl bg-gray-150 lg:flex-row-reverse'>
					<div className='relative aspect-video h-full w-full bg-red-50 lg:aspect-square'>
						aaa
						<Image
							src='/images/jets_dep/personal_manager.webp'
							alt='personal manager'
							className='h-full object-cover object-top'
							loading='lazy'
							fill
						/>
					</div>
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
