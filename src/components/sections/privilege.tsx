import Car from '@/assets/svg/car-gold.svg'
import Diamond from '@/assets/svg/diamond-gold.svg'
import Plane from '@/assets/svg/plane-gold.svg'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

// export function PrivilegeSection() {
// 	const t = useTranslations('privilege')

// 	return (
// 		<section>
// 			<div className='container'>
// 				<div className='gap-10 overflow-hidden rounded-2xl bg-gold lg:flex-row-reverse lg:items-center'>
// 					<div
// 						className='h-64 w-full bg-cover bg-center lg:h-80'
// 						style={{ backgroundImage: 'url(/images/home_page/artem.jpg)' }}
// 					/>
// 					<div className='w-full items-center gap-4 px-6 pb-10 lg:h-80 lg:items-start lg:py-10 lg:pb-0'>
// 						<h2 className='text-center text-gray-100 lg:text-left'>{t('title')}</h2>
// 						<p className='text-center text-gray-100 lg:text-left'>{t('description')}</p>
// 						<Link href='tg://resolve?domain=@atmjet1'>
// 							<button className='big'>{t('button')}</button>
// 						</Link>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	)
// }

export function PrivilegeSection() {
	const t = useTranslations('privilege')

	const iconsStyle = 'h-11 w-11 shrink-0 md:h-11 md:w-11'
	const icons = [
		<Plane className={iconsStyle} />,
		<Car className={iconsStyle} />,
		<Diamond className={iconsStyle} />,
	]

	return (
		<section className='bg-gray-150'>
			<div className='container gap-10 lg:flex-row'>
				<h2 className='top-40 flex-shrink-0 gap-6 self-start lg:sticky lg:w-72'>
					Join the <br />
					<span className='bg-gold bg-clip-text text-transparent'>ATM JET Gold</span>
				</h2>
				<div className='relative w-full gap-4 self-stretch overflow-clip'>
					<div className='overflow-clip rounded-2xl'>
						{icons.map((icon, index) => (
							<PrivilegeCard
								key={index}
								icon={icon}
								title={t(`card${index + 1}.title`)}
								topPadding={(index + 1) * 32}
								description={t(`card${index + 1}.description`)}
							/>
						))}
					</div>
					<PrivilegeContact />
				</div>
			</div>
		</section>
	)
}

interface PrivilegeCardProps {
	title: string
	description: string
	icon: React.ReactNode
	topPadding?: number
}

function PrivilegeCard(props: PrivilegeCardProps) {
	const { title, description, icon } = props

	return (
		<div
			className='card sticky -mb-16 gap-4 overflow-hidden bg-gray-150 bg-opacity-90 p-8 pb-24 backdrop-blur-lg last:mb-0 last:pb-14 md:flex-row'
			style={{ top: `${props.topPadding}px` }}
		>
			{icon}
			<div className='gap-4 md:w-full'>
				<h3 className='bg-gold bg-clip-text font-serif text-transparent'>{title}</h3>
				<p>{description}</p>
			</div>
		</div>
	)
}

function PrivilegeContact() {
	const t = useTranslations('privilege.contact')

	return (
		<div className='overflow-clip rounded-2xl bg-gold p-0.5'>
			<div
				className='rounded-2xl bg-fixed repeat-infinite lg:flex-row-reverse'
				style={{
					backgroundColor: 'rgba(23, 22, 20, 1)',
					backgroundImage: 'url(/images/home_page/pattern.png)',
				}}
			>
				<div
					className='h-64 w-full bg-cover bg-center lg:h-80'
					style={{ backgroundImage: 'url(/images/home_page/artem.jpg)' }}
				/>
				<div className='w-full justify-center p-6 md:p-10'>
					<h3 className='bg-gold bg-clip-text font-serif text-transparent'>{t('title')}</h3>
					<p className='pt-4'>{t('description')}</p>
					<Link href='tg://resolve?domain=@atmjet1' className='p-0 pt-6'>
						<button className='big bg-gold'>{t('button')}</button>
					</Link>
				</div>
			</div>
		</div>
	)
}
