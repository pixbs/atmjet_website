import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
	// A list of all locales that are supported
	locales: ['en', 'uk', 'ru'],

	// Used when no locale matches
	defaultLocale: 'en',
})

export const config = {
	matcher: '/((?!api|static|.*\\..*|_next).*)',
}
