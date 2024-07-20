import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const localeMapping = {
        'en': 'en',
        'ru': 'ru',
		'uk': 'uk',
    };
    let modifiedRequest = request;

    // URL Rewrites
    for (const [srcPath, targetPath] of Object.entries(localeMapping)) {
        if (request.nextUrl.pathname.startsWith(`/${srcPath}`)) {
            const remainingPath = request.nextUrl.pathname.replace(`/${srcPath}`, '');
            const newUrl = new URL(`/${targetPath}${remainingPath}`, request.url);
            modifiedRequest = new NextRequest(newUrl, request);
            break;
        }
    }

    const locales = Object.values(localeMapping);

    // Translations middleware logic
    const defaultLocale = modifiedRequest.headers.get('x-default-locale') || 'en';
    const handleI18nRouting = createIntlMiddleware({
        locales,
        defaultLocale
    });

    const response = handleI18nRouting(modifiedRequest);
    response.headers.set('x-default-locale', defaultLocale);

    return response;
}

export const config = {
    // Skip all paths that should not be internationalized.
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};