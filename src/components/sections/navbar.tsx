import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'

export function Navbar() {
    const t = useTranslations()
    const locale = useLocale()

    return (
        <section className='z-40 fixed top-0 bottom-0 left-0 right-0 flex-col bg-opacity-80 bg-gray-100 backdrop-blur-xl animate-in fade-in duration-200'>
            <nav className='flex container h-full pt-36 pb-10 !flex-row !m-0 content-stretch'>
                <div className='flex-col justify-between w-full'>
                    <div className='[&>*]:animate-in [&>*]:fade-in [&>*]:duration-600'>
                        <Link href='/'>
                            {t('navigation.home')}
                        </Link>
                        <Link href='partners'>
                            {t('navigation.partners')}
                        </Link>
                        <Link href='/bussines_agents'>
                            {t('navigation.bussines-agents')}
                        </Link>
                        <Link href='/medical_aviation'>
                            {t('navigation.medical-aviation')}
                        </Link>
                        <Link href='/empty_legs'>
                            {t('navigation.empty-legs')}
                        </Link>
                        <Link href='/cargo_charter'>
                            {t('navigation.cargo-charter')}
                        </Link>
                    </div>
                    <div className='[&>*]:animate-in [&>*]:fade-in [&>*]:duration-600'>
                        <Link href='/' className='flex items-center'>
                            {t('social-media.telegram')}
                            <ArrowTopRight className='size-10'/>
                        </Link>
                        <Link href='/' className='flex items-center'>
                            {t('social-media.whats-app')}
                            <ArrowTopRight className='size-10'/>
                        </Link>
                        <Link href='/' className='flex items-center'>
                            {t('social-media.instagram')}
                            <ArrowTopRight className='size-10'/>
                        </Link>
                        <button className='mt-4 self-start'>
                            {t('footer.button')}
                        </button>
                    </div>
                </div>
                <div className='flex-col justify-between w-full'>
                    <div className='[&>*]:animate-in [&>*]:fade-in [&>*]:duration-600'>
                        <Link href='/sales_dept' className='text-right'>
                            {t('navigation.sales-dept')}
                        </Link>
                        <Link href='/group_charters' className='text-right'>
                            {t('navigation.group-charters')}
                        </Link>
                        <Link href='/atmjet_group' className='text-right'>
                            {t('navigation.atmjet-group')}
                        </Link>
                        <Link href='/aircraft' className='text-right'>
                            {t('navigation.aircraft')}
                        </Link>
                        <Link href='/yachts' className='text-right'>
                            {t('navigation.yachts')}
                        </Link>
                    </div>
                </div>
            </nav>
        </section>
    )
}