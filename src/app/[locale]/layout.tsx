import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FooterSection, HeaderSection } from '@/components/sections'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'ATMJET - Flying private made simple',
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

	return (
		<html lang={locale}>
			<body className={inter.className}>
				<NextIntlClientProvider messages={messages}>
					<HeaderSection />
					{children}
					<FooterSection />
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
