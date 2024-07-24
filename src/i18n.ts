import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Can be imported from a shared config
const locales = ['en', 'uk', 'ru']

export default getRequestConfig(async ({ locale }) => {
	// Validate that the incoming `locale` parameter is valid
	if (!locales.includes(locale as any)) notFound()

	return {
		messages: {
			...(await import(`../messages/${locale}/aircraft.json`)).default,
			...(await import(`../messages/${locale}/atmjet_group.json`)).default,
			...(await import(`../messages/${locale}/business_agents.json`)).default,
			...(await import(`../messages/${locale}/cargo.json`)).default,
			...(await import(`../messages/${locale}/citizens.json`)).default,
			...(await import(`../messages/${locale}/empty_leg.json`)).default,
			...(await import(`../messages/${locale}/group_charters.json`)).default,
			...(await import(`../messages/${locale}/home_page.json`)).default,
			...(await import(`../messages/${locale}/medical_aviation.json`)).default,
			...(await import(`../messages/${locale}/misc.json`)).default,
			...(await import(`../messages/${locale}/partners.json`)).default,
			...(await import(`../messages/${locale}/sales_dept.json`)).default,
			...(await import(`../messages/${locale}/yachts.json`)).default,
		},
	}
})
