import { BookingDialog } from '@/components/elements'
import { Cookies, FooterSection, HeaderSection } from '@/components/sections'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata() {
	const locale = await getLocale()
	const baseURL =
		process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000'

	const title = 'ATM JET - Flying private made simple'
	const description = locale === 'ru' ? 'Аренда самолета - лучшее решение для тех, кто ценит комфорт и время. ATM JET предоставляет возможность заказать частный самолет для перелета в любую точку планеты. Мы работаем для вас уже более 16 лет и имеем огромный опыт в организации полетов бизнес-авиации.' : 'Renting a plane is the best solution for those who value comfort and time. ATM JET provides the opportunity to order a private plane for a flight to any point on the planet. We have been working for you for over 16 years and have vast experience in organizing business aviation flights.'
	const metadata = {
		title: title,
		description: description,
	}
}

export default async function LocaleLayout({
	children,
	params: { locale },
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages()
	const host = headers().get('host') || 'no host'

	return (
		<html lang={locale}>
			<body className={inter.className}>
				<NextIntlClientProvider messages={messages}>
					<Cookies />
					<HeaderSection />
					{children}
					<FooterSection />
					<BookingDialog host={host} />
				</NextIntlClientProvider>
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	)
}
