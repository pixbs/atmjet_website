import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { LocaleSwitch } from '../elements'

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
						<Link href={`/${locale}/partners`}>{t('navigation.partners')}</Link>
						<Link href={`/${locale}/business_agents`}>{t('navigation.business-agents')}</Link>
						<Link href={`/${locale}/medical_aviation`}>{t('navigation.medical-aviation')}</Link>
						<Link href={`/${locale}/empty_legs`}>{t('navigation.empty-legs')}</Link>
						<Link href={`/${locale}/cargo_charter`}>{t('navigation.cargo-charter')}</Link>
						<Link href='?showBooking=Header' scroll={false} className='hidden self-start lg:block'>
							<button className='mt-4'>{t('footer.button')}</button>
						</Link>
					</div>
					<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
						<Link href='https://t.me/melentev1' className='flex items-center'>
							{t('social-media.telegram')}
							<ArrowTopRight className='size-10' />
						</Link>
						<Link href='https://wa.me/971504589926' className='flex items-center'>
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
						<Link href={`/${locale}/atm_jet_group`} className='text-right'>
							{t('navigation.atm-jet-group')}
						</Link>
						<Link href={`/${locale}/aircrafts`} className='text-right'>
							{t('navigation.aircrafts')}
						</Link>
						<Link href={`/${locale}/group_charters`} className='text-right'>
							{t('navigation.group-charters')}
						</Link>
						<Link href={`/${locale}/sales_dept`} className='text-right'>
							{t('navigation.sales-dept')}
						</Link>
						<Link href={`/${locale}/sales_yachts`} className='text-right'>
							{t('navigation.sales-yachts')}
						</Link>
						<Link href={`/${locale}/yachts`} className='text-right'>
							{t('navigation.yachts')}
						</Link>
					</div>
					<div className='flex-row justify-end gap-4 [&>*]:text-right'>
						<LocaleSwitch />
					</div>
				</div>
			</nav>
		</section>
	)
}
