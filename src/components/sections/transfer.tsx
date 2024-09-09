import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { RequestForm } from '../form'

export function TransferSection() {
	const t = useTranslations('transfer')
	return (
		<section>
			<div className='container'>
				<div className='gap-6 rounded-2xl bg-gray-200 p-8'>
					<div className='gap-8 md:flex-row-reverse'>
						<div
							className='relative -mx-8 -mt-8 h-48 items-center justify-center overflow-hidden rounded-t-2xl bg-cover bg-center md:m-0 md:w-full'
						>
							<Image 
								src='/images/home_page/transfer.jpg'
								alt='Image of black car'
								className='object-cover absolute'
								layout='fill'
							/>
							<div className='absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-b from-transparent from-50% to-black' />
							{/* <p className='font-serif text-3x z-10 shrink-0 text-gray-900'>{t('subtitle')}</p> */}
						</div>
						<h2>{t('title')}</h2>
					</div>
					<RequestForm />
				</div>
			</div>
		</section>
	)
}
