
/**
 * =====================================================================================
 * HOME PAGE COMPONENT WITH SEO METADATA GENERATION
 * =====================================================================================
 * 
 * This file demonstrates how to implement comprehensive SEO metadata in a Next.js 15 
 * App Router application with internationalization support.
 * 
 * SEO METADATA IMPLEMENTATION:
 * ---------------------------
 * The file uses Next.js's generateMetadata function to create SEO-friendly metadata:
 * 
 * 1. **Dynamic Metadata Generation**: The generateMetadata function runs at build time
 *    (for static pages) or request time (for dynamic pages) to fetch content from the CMS
 *    and generate appropriate meta tags.
 * 
 * 2. **International SEO with Alternate URLs**: Uses the generateAlternates helper to create
 *    hreflang alternate URLs for all supported locales. This tells search engines which
 *    version of the page to show users based on their language/location preferences.
 * 
 * 3. **CMS-Driven Content**: Fetches title, description, and keywords directly from the
 *    Optimizely CMS, ensuring content editors can control SEO metadata without code changes.
 * 
 * ALTERNATE URL GENERATION:
 * ------------------------
 * The generateAlternates helper (from lib/utils/metadata.ts) creates:
 * - Canonical URL: The primary URL for the current locale (e.g., "/en/")
 * - Language alternates: URLs for all supported locales (e.g., "/en/", "/pl/", "/sv/")
 * 
 * This generates HTML like:
 * <link rel="canonical" href="/en/" />
 * <link rel="alternate" hreflang="en" href="/en/" />
 * <link rel="alternate" hreflang="pl" href="/pl/" />
 * <link rel="alternate" hreflang="sv" href="/sv/" />
 * 
 * WHY THIS MATTERS FOR SEO:
 * -------------------------
 * - Prevents duplicate content penalties across language versions
 * - Helps search engines serve the correct language to users
 * - Improves international search rankings
 * - Enhances user experience by directing users to their preferred language
 * 
 * =====================================================================================
 */

// Import the ContentAreaMapper component, which renders a list of content blocks.
import ContentAreaMapper from '@/components/content-area/mapper'

// Import the DraftModeHomePage component, used when the site is in draft mode (for previewing unpublished content).
import DraftModeHomePage from '@/components/draft/draft-mode-homepage'

// Import a loading spinner component for draft mode.
import { DraftModeLoader } from '@/components/draft/draft-mode-loader'

// Import the optimizely GraphQL client for fetching content from the CMS.
import { optimizely } from '@/lib/optimizely/fetch'

// Import a utility to validate and normalize locale codes.
import { getValidLocale } from '@/lib/optimizely/utils/language'

// Import a utility to generate alternate language/region metadata for SEO.
import { generateAlternates } from '@/lib/utils/metadata'

// Import the Metadata type from Next.js for typing the metadata function.
import { Metadata } from 'next'

// Import the draftMode function to check if the site is in draft/preview mode.
import { draftMode } from 'next/headers'

// Import Suspense from React, which allows you to show a fallback UI while loading async content.
import { Suspense } from 'react'


/**
 * GENERATE METADATA FOR SEO
 * =========================
 * 
 * This function implements Next.js's generateMetadata API to create SEO-optimized 
 * metadata for the home page. It demonstrates several key SEO concepts:
 * 
 * 1. **Dynamic Content from CMS**: Fetches SEO data (title, description, keywords) 
 *    directly from the Optimizely CMS, allowing content editors to manage SEO 
 *    without developer involvement.
 * 
 * 2. **Locale-Aware Metadata**: Uses the locale from the URL ([locale] segment) 
 *    to fetch content in the appropriate language and generate locale-specific metadata.
 * 
 * 3. **Alternate URLs Generation**: Calls generateAlternates(locale, '/') to create 
 *    hreflang alternate URLs for international SEO. This helper function:
 *    - Takes the current locale (e.g., 'en') and path ('/' for home page)
 *    - Generates alternate URLs for all supported locales
 *    - Creates both canonical and language alternate links
 * 
 * Example output for locale 'en':
 * - canonical: "/en/"
 * - languages: { en: "/en/", pl: "/pl/", sv: "/sv/" }
 * 
 * This results in HTML head tags like:
 * <link rel="canonical" href="/en/" />
 * <link rel="alternate" hreflang="en" href="/en/" />
 * <link rel="alternate" hreflang="pl" href="/pl/" />
 * <link rel="alternate" hreflang="sv" href="/sv/" />
 * 
 * @param props - Contains the route parameters, specifically the locale
 * @returns Promise<Metadata> - SEO metadata object used by Next.js
 */
export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  // Extract the locale from the route parameters (e.g., 'en', 'pl', 'sv').
  const { locale } = await props.params
  
  // Validate and normalize the locale using our helper function.
  // This ensures we always have a valid locale, falling back to 'en' if invalid.
  const locales = getValidLocale(locale)
  
  // Fetch the start page data for the given locale from the Optimizely CMS.
  // This GraphQL query retrieves SEO-relevant fields like title, description, and keywords.
  const pageResp = await optimizely.GetStartPage({ locales })
  
  // Extract the page item from the response.
  const page = pageResp.data?.StartPage?.item
  
  // If no page is found, return an empty metadata object.
  // This provides graceful fallback behavior if the CMS content is unavailable.
  if (!page) {
    return {}
  }

  // Return the metadata object for Next.js to use in the <head> section.
  return {
    title: page.title, // The page title (<title> tag)
    description: page.shortDescription || '', // The meta description for search results
    keywords: page.keywords ?? '', // Meta keywords (less important for modern SEO but still supported)
    alternates: generateAlternates(locale, '/'), // Critical for international SEO - generates hreflang alternate URLs
  }
}


/**
 * HOME PAGE COMPONENT
 * ==================
 * 
 * This is the main page component for the home/start page. It's an async server 
 * component in Next.js 15 that handles both regular rendering and draft mode.
 * 
 * KEY FEATURES:
 * - Locale-aware content fetching
 * - Draft mode support for content editors
 * - Block-based content rendering through ContentAreaMapper
 * 
 * The SEO metadata for this component is handled by the generateMetadata function above,
 * which runs separately and provides the metadata to Next.js before this component renders.
 */
export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  // Extract the locale from the route parameters.
  const { locale } = await props.params
  
  // Validate and normalize the locale using the same helper as generateMetadata.
  // This ensures consistency between metadata generation and content rendering.
  const locales = getValidLocale(locale)
  
  // Check if the site is in draft/preview mode (for content editors).
  const { isEnabled: isDraftModeEnabled } = await draftMode()
  if (isDraftModeEnabled) {
    // If in draft mode, show the DraftModeHomePage component inside a Suspense boundary.
    // Suspense allows you to show a fallback (DraftModeLoader) while loading async content.
    return (
      <Suspense fallback={<DraftModeLoader />}>
        <DraftModeHomePage locales={locales} />
      </Suspense>
    )
  }

  // Fetch the start page data for the given locale from the CMS.
  // Note: This is the same data source used in generateMetadata, but fetched separately
  // since generateMetadata runs before the component renders.
  const pageResponse = await optimizely.GetStartPage({ locales })

  // Extract the start page item from the response.
  const startPage = pageResponse.data?.StartPage?.item
  
  // Get the blocks array, filtering out null/undefined values.
  // These blocks represent the content sections that will be rendered on the page.
  const blocks = (startPage?.blocks ?? []).filter(
    (block) => block !== null && block !== undefined
  )

  // Render the content blocks using ContentAreaMapper inside a Suspense boundary.
  // ContentAreaMapper handles the dynamic rendering of different block types.
  return (
    <>
      <Suspense>
        <ContentAreaMapper blocks={blocks} />
      </Suspense>
    </>
  )
}
