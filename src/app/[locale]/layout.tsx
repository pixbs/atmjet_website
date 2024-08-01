import { BookingDialog } from '@/components/elements'
import { Cookies, FooterSection, HeaderSection } from '@/components/sections'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'ATM JET - Flying private made simple',
	description: '',
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
				<script
					async
					type='text/javascript'
					src='https://piper.kommo.com/pixel/js/identifier/pixel_identifier.js'
					id='kommo_pixel_identifier_js'
				/>
				<NextIntlClientProvider messages={messages}>
					<Cookies />
					<HeaderSection />
					{children}
					<FooterSection />
					<BookingDialog host={host} />
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
