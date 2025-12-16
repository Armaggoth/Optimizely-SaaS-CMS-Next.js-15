
// This file provides utility functions for handling language/localization in the app.

// Import the Locales type, which is a union of allowed locale strings (e.g., 'en', 'pl', 'sv').
import { Locales } from '../types/generated'

// The default locale to use if none is specified or if an invalid locale is provided.
export const DEFAULT_LOCALE = 'en'

// The list of supported locale codes for the site.
export const LOCALES = ['en', 'pl', 'sv']

// Returns a valid locale: if the input is not in the supported list, returns the default.
// The return type is explicitly Locales, so TypeScript knows it's always a valid locale.
export const getValidLocale = (locale: string): Locales => {
  // If the locale is in the list, use it; otherwise, use the default.
  const validLocale = getLocales().includes(locale) ? locale : DEFAULT_LOCALE
  // Type assertion: tell TypeScript this is a valid Locales value.
  return validLocale as Locales
}

// Returns the array of supported locales.
export const getLocales = () => {
  return LOCALES
}

// Removes the locale prefix from a URL path, if present.
// For example, '/en/about' becomes 'about', '/pl/contact' becomes 'contact'.
export const mapPathWithoutLocale = (path: string): string => {
  // Split the path into parts by '/', and remove empty strings (from leading/trailing slashes).
  const parts = path.split('/').filter(Boolean)
  // If the first part is a supported locale, remove it.
  if (LOCALES.includes(parts[0] ?? '')) {
    parts.shift()
  }

  // Join the remaining parts back into a path string.
  return `${parts.join('/')}`
}
