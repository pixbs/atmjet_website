import { BookingDialog } from '@/components/elements'
import { Cookies, FooterSection, HeaderSection } from '@/components/sections'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'ATM JET - Flying private made simple',
	description:
		'Renting a plane is the best solution for those who value comfort and time. ATM JET provides the opportunity to order a private plane for a flight to any point on the planet. We have been working for you for over 16 years and have vast experience in organizing business aviation flights.',
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
