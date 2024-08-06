import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

export function Navbar() {
	const t = useTranslations()
	const locale = useLocale()

	return (
		<section className='fixed inset-0 bottom-0 z-40 flex-col overflow-y-auto bg-gray-100 bg-opacity-80 backdrop-blur-xl duration-200 animate-in fade-in lg:bottom-auto'>
			<nav className='container !m-0 flex h-full !flex-row content-stretch pb-10 pt-36'>
				<div className='w-full flex-col justify-between lg:flex-row'>
					<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
						<Link href='/' legacyBehavior passHref>
							{t('navigation.home')}
						</Link>
						<Link href='/partners'>{t('navigation.partners')}</Link>
						<Link href='/business_agents'>{t('navigation.business-agents')}</Link>
						<Link href='/medical_aviation'>{t('navigation.medical-aviation')}</Link>
						<Link href='/empty_legs'>{t('navigation.empty-legs')}</Link>
						<Link href='/cargo_charter'>{t('navigation.cargo-charter')}</Link>
						<Link href='?showBooking=Header' scroll={false} className='hidden self-start lg:block'>
							<button className='mt-4'>{t('footer.button')}</button>
						</Link>
					</div>
					<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
						<Link href='tg://resolve?domain=@atmjet1' className='flex items-center'>
							{t('social-media.telegram')}
							<ArrowTopRight className='size-10' />
						</Link>
						<Link
							href='https://m.sitehelp.me/whatsappOfficial?siteId=kdjz1r9wpcb00x6o5ksiqxahidz566ll&clientId=kG1xsAPIwQrDwTJfGPC3vMikfU3QrfWo&url=whatsapp%3A%2F%2Fsend%3Fphone%3D971585940112'
							className='flex items-center'
						>
							{t('social-media.whats-app')}
							<ArrowTopRight className='size-10' />
						</Link>
						<Link href='https://www.instagram.com/atmjet/' className='flex items-center'>
							{t('social-media.instagram')}
							<ArrowTopRight className='size-10' />
						</Link>
						<Link href='?showBooking=Header' scroll={false} className='flex self-start lg:hidden'>
							<button className='mt-4'>{t('footer.button')}</button>
						</Link>
					</div>
				</div>
				<div className='w-full flex-col justify-between'>
					<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
						<Link href={`/sales_dept`} className='text-right'>
							{t('navigation.sales-dept')}
						</Link>
						<Link href='/group_charters' className='text-right'>
							{t('navigation.group-charters')}
						</Link>
						<Link href='/atm_jet_group' className='text-right'>
							{t('navigation.atm-jet-group')}
						</Link>
						<Link href='/aircraft' className='text-right'>
							{t('navigation.aircraft')}
						</Link>
						<Link href={`/yachts`} className='text-right'>
							{t('navigation.yachts')}
						</Link>
					</div>
					<div className='flex-row justify-end gap-4'>
						<Link href='/en' className={`text-right text-base ${locale == 'en' && 'opacity-50'}`}>
							{t('locale.en')}
						</Link>
						<Link href='/ru' className={`text-right text-base ${locale == 'ru' && 'opacity-50'}`}>
							{t('locale.ru')}
						</Link>
						<Link href='/uk' className={`text-right text-base ${locale == 'uk' && 'opacity-50'}`}>
							{t('locale.uk')}
						</Link>
					</div>
				</div>
			</nav>
		</section>
	)
}
