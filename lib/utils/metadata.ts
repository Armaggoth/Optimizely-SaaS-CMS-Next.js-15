// =====================================================================================
// SEO Metadata Helpers for Next.js
// =====================================================================================
//
// This file provides utility functions to help generate SEO-friendly metadata for your site.
//
// In Next.js, the generateMetadata function is used to set metadata for each page, including:
//   - The canonical URL (the main URL for a page)
//   - Alternate URLs for different languages/locales (hreflang links)
//
// Why is this important?
//   - Search engines use canonical and alternate URLs to understand which version of a page to index for each language.
//   - Proper alternate URLs improve international SEO and user experience.
//
// How do these helpers fit in?
//   - normalizePath: Cleans up a URL path so it is consistent and safe to use in metadata.
//   - generateAlternates: Given a locale and a path, returns an object with the canonical URL and all alternate URLs for every supported locale.
//   - The result matches what Next.js expects for alternate URLs in generateMetadata, so you can use it directly in your page components.
//
// Example usage in a Next.js page:
//
//   import { generateAlternates } from '@/lib/utils/metadata'
//
//   export async function generateMetadata({ params }) {
//     return {
//       alternates: generateAlternates(params.locale, '/about'),
//       // ...other metadata
//     }
//   }
//
// =====================================================================================
// Import the LOCALES constant from the specified file path.
// This is likely an array of supported language codes (like ['en', 'fr', ...]).
import { LOCALES } from '@/lib/optimizely/utils/language'

// Import the AlternateURLs type from Next.js's internal types.
// This type describes the structure of alternate URLs for different languages.
import { AlternateURLs } from 'next/dist/lib/metadata/types/alternative-urls-types'

// This function takes a URL path as input and returns a 'normalized' version of it.
// Normalizing means making the path lowercase, removing leading/trailing slashes, and converting '/' to an empty string.
// For example: '/About/' becomes 'about'
export function normalizePath(path: string): string {
  // Convert the path to all lowercase letters.
  path = path.toLowerCase()

  // If the path is exactly '/', treat it as the root and return an empty string.
  if (path === '/') {
    return ''
  }

  // If the path ends with a '/', remove the last character.
  if (path.endsWith('/')) {
    path = path.substring(0, path.length - 1)
  }

  // If the path starts with a '/', remove the first character.
  if (path.startsWith('/')) {
    path = path.substring(1)
  }

  // Return the cleaned-up path.
  return path
}

// This function generates alternate URLs for different languages/locales for a given path.
//
// Parameters:
//   locale: the current language code (like 'en' or 'fr')
//   path: the URL path to generate alternates for
// Returns:
//   An object with:
//     - canonical: the main URL for the current locale
//     - languages: an object mapping each locale to its URL
export function generateAlternates(
  locale: string, // The current language code
  path: string    // The URL path to generate alternates for
): AlternateURLs {
  // Normalize the path using the helper above.
  path = normalizePath(path)

  // Return an object with canonical and languages properties.
  return {
    // The canonical URL for the current locale and path.
    canonical: `/${locale}/${path}`,

    // The languages object maps each locale to its URL.
    // Object.assign({}, ...array) merges all objects in the array into one object.
    // LOCALES.map(...) creates an array of objects like { en: '/en/path' }, { fr: '/fr/path' }, etc.
    languages: Object.assign(
      {},
      ...LOCALES.map((l) => ({ [l]: `/${l}/${path}` }))
    ),
  }
}
