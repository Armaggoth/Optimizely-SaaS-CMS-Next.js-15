
// This middleware handles locale (language) detection and URL rewriting for internationalization in Next.js.

// Import the default locale and list of supported locales.
import { DEFAULT_LOCALE, LOCALES } from '@/lib/optimizely/utils/language'

// Import utility functions for URL manipulation.
import { createUrl, leadingSlashUrlPath } from '@/lib/utils'

// Import types and helpers from Next.js for handling requests and responses.
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Import the Negotiator library, which helps parse the Accept-Language header.
import Negotiator from 'negotiator'

// Name of the cookie used to store the user's locale preference.
const COOKIE_NAME_LOCALE = '__LOCALE_NAME'
// Name of the custom header used to pass the locale.
const HEADER_KEY_LOCALE = 'X-Locale'

// Determines if a path should be excluded from locale handling (e.g., static files, API routes).
function shouldExclude(path: string) {
  return (
    path.startsWith('/static') || path.includes('/api/') || path.includes('.')
  )
}

// Determines the user's preferred language from the Accept-Language header.
function getBrowserLanguage(
  request: NextRequest,
  locales: string[]
): string | undefined {
  const headerLanguage = request.headers.get('Accept-Language')
  if (!headerLanguage) {
    return undefined // No language header present
  }

  // Use Negotiator to parse the Accept-Language header and get a list of preferred languages.
  const languages = new Negotiator({
    headers: { 'accept-language': headerLanguage },
  }).languages()

  // Find the first language that matches our supported locales.
  for (const lang of languages) {
    // Check for exact match (e.g., 'en', 'pl')
    if (locales.includes(lang)) {
      return lang
    }

    // Check for language match without region (e.g., 'pl-PL' should match 'pl')
    const langPrefix = lang.split('-')[0]
    if (locales.includes(langPrefix)) {
      return langPrefix
    }
  }

  return undefined // No matching language found
}

// Determines the locale to use for the request, based on cookie, browser language, or default.
function getLocale(request: NextRequest, locales: string[]): string {
  // First, check if there's a locale cookie set by the user.
  const cookieLocale = request.cookies.get(COOKIE_NAME_LOCALE)?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // If no cookie, try to use the browser's preferred language.
  const browserLang = getBrowserLanguage(request, locales)
  if (browserLang && locales.includes(browserLang)) {
    return browserLang
  }

  // Fall back to the default locale if nothing else matches.
  return DEFAULT_LOCALE
}

// Updates the locale cookie and header in the response, if needed.
function updateLocaleCookies(
  request: NextRequest,
  response: NextResponse,
  locale?: string
): void {
  const cookieLocale = request.cookies.get(COOKIE_NAME_LOCALE)?.value
  const newLocale = locale || null

  // If the locale has changed, update the cookie.
  if (newLocale !== cookieLocale) {
    if (newLocale) {
      response.cookies.set(COOKIE_NAME_LOCALE, newLocale)
    } else {
      response.cookies.delete(COOKIE_NAME_LOCALE)
    }
  }

  // Set or remove the custom locale header.
  if (newLocale) {
    response.headers.append(HEADER_KEY_LOCALE, newLocale)
  } else {
    response.headers.delete(HEADER_KEY_LOCALE)
  }
}

// The main middleware function, called for every incoming request.
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname // The path of the request URL
  let response = NextResponse.next() // Default response (no rewrite/redirect)

  // Exclude static files, API routes, etc. from locale handling.
  if (shouldExclude(pathname)) {
    return response
  }

  // Check if the path already includes a locale prefix (e.g., '/en/about').
  const localeInPathname = LOCALES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (localeInPathname) {
    // Remove the locale prefix from the path.
    const pathnameWithoutLocale = pathname.replace(`/${localeInPathname}`, '')
    // Rebuild the URL with the locale prefix and any query parameters.
    const newUrl = createUrl(
      `/${localeInPathname}${leadingSlashUrlPath(pathnameWithoutLocale)}`,
      request.nextUrl.searchParams
    )

    // Rewrite the request to the new URL (internal rewrite, not a redirect).
    response = NextResponse.rewrite(new URL(newUrl, request.url))
    // Update cookies and headers with the locale.
    updateLocaleCookies(request, response, localeInPathname)
    return response
  }

  // If no locale in the path, determine the best locale to use.
  const locale = getLocale(request, LOCALES)
  // Build the new URL with the locale prefix.
  const newUrl = createUrl(
    `/${locale}${leadingSlashUrlPath(pathname)}`,
    request.nextUrl.searchParams
  )
  // If the locale is the default, rewrite the request; otherwise, redirect to the new URL.
  response =
    locale === DEFAULT_LOCALE
      ? NextResponse.rewrite(new URL(newUrl, request.url))
      : NextResponse.redirect(new URL(newUrl, request.url))

  // Update cookies and headers with the locale.
  updateLocaleCookies(request, response, locale)

  return response
}

// Configuration for the middleware: only run on non-API, non-static, non-image, non-favicon routes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
