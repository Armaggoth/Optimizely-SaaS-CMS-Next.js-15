
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


// This async function generates metadata (title, description, etc.) for the page, used by Next.js for SEO.
export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  // Extract the locale from the route parameters (e.g., 'en', 'pl', 'sv').
  const { locale } = await props.params
  // Validate and normalize the locale.
  const locales = getValidLocale(locale)
  // Fetch the start page data for the given locale from the CMS.
  const pageResp = await optimizely.GetStartPage({ locales })
  // Extract the page item from the response.
  const page = pageResp.data?.StartPage?.item
  // If no page is found, return an empty metadata object.
  if (!page) {
    return {}
  }

  // Return the metadata object for Next.js to use in the <head>.
  return {
    title: page.title, // The page title
    description: page.shortDescription || '', // The meta description
    keywords: page.keywords ?? '', // The meta keywords
    alternates: generateAlternates(locale, '/'), // Alternate language/region URLs for SEO
  }
}


// The main page component for the home/start page. This is an async server component in Next.js.
export default async function HomePage(props: {
  params: Promise<{ locale: string }>
}) {
  // Extract the locale from the route parameters.
  const { locale } = await props.params
  // Validate and normalize the locale.
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
  const pageResponse = await optimizely.GetStartPage({ locales })

  // Extract the start page item from the response.
  const startPage = pageResponse.data?.StartPage?.item
  // Get the blocks array, filtering out null/undefined values.
  const blocks = (startPage?.blocks ?? []).filter(
    (block) => block !== null && block !== undefined
  )

  // Render the content blocks using ContentAreaMapper inside a Suspense boundary.
  return (
    <>
      <Suspense>
        <ContentAreaMapper blocks={blocks} />
      </Suspense>
    </>
  )
}
