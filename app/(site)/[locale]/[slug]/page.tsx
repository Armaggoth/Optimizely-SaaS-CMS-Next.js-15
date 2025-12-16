
// Import the ContentAreaMapper component, which renders a list of content blocks.
import ContentAreaMapper from '@/components/content-area/mapper'

// Import the DraftModeCmsPage component, used when the site is in draft mode (for previewing unpublished CMS pages).
import DraftModeCmsPage from '@/components/draft/draft-mode-cms-page'

// Import a loading spinner component for draft mode.
import { DraftModeLoader } from '@/components/draft/draft-mode-loader'

// Import the wrapper for visual builder experiences (for special page types).
import VisualBuilderExperienceWrapper from '@/components/visual-builder/wrapper'

// Import the optimizely GraphQL client for fetching content from the CMS.
import { optimizely } from '@/lib/optimizely/fetch'

// Import the type for safe visual builder experiences.
import { SafeVisualBuilderExperience } from '@/lib/optimizely/types/experience'

// Import utilities for locale validation and path manipulation.
import {
  getValidLocale,
  mapPathWithoutLocale,
} from '@/lib/optimizely/utils/language'

// Import a utility to generate alternate language/region metadata for SEO.
import { generateAlternates } from '@/lib/utils/metadata'

// Import the Metadata type from Next.js for typing the metadata function.
import { Metadata } from 'next'

// Import the draftMode function to check if the site is in draft/preview mode.
import { draftMode } from 'next/headers'

// Import the notFound function to show a 404 page if content is missing.
import { notFound } from 'next/navigation'

// Import Suspense from React, which allows you to show a fallback UI while loading async content.
import { Suspense } from 'react'


// This async function generates metadata (title, description, etc.) for the page, used by Next.js for SEO.
export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug?: string }>
}): Promise<Metadata> {
  // Extract the locale and slug from the route parameters (e.g., 'en', 'about').
  const { locale, slug = '' } = await props.params
  // Validate and normalize the locale.
  const locales = getValidLocale(locale)
  // Format the slug as a path (e.g., '/about').
  const formattedSlug = `/${slug}`
  // Fetch the page data for the given locale and slug from the CMS.
  const { data, errors } = await optimizely.getPageByURL({
    locales: [locales],
    slug: formattedSlug,
  })

  // If there are errors, return an empty metadata object.
  if (errors) {
    return {}
  }

  // Extract the page item from the response.
  const page = data?.CMSPage?.item
  if (!page) {
    // If no page is found, try to fetch a visual builder experience for this slug.
    const experienceData = await optimizely.GetVisualBuilderBySlug({
      locales: [locales],
      slug: formattedSlug,
    })

    const experience = experienceData.data?.SEOExperience?.item

    if (experience) {
      // If a visual builder experience is found, return its metadata.
      return {
        title: experience?.title,
        description: experience?.shortDescription || '',
        keywords: experience?.keywords ?? '',
        alternates: generateAlternates(locale, formattedSlug),
      }
    }

    // If nothing is found, return an empty metadata object.
    return {}
  }

  // Return the metadata object for Next.js to use in the <head>.
  return {
    title: page.title, // The page title
    description: page.shortDescription || '', // The meta description
    keywords: page.keywords ?? '', // The meta keywords
    alternates: generateAlternates(locale, formattedSlug), // Alternate language/region URLs for SEO
  }
}


// This async function generates all possible static paths for this page (for static site generation).
export async function generateStaticParams() {
  try {
    // Define the page types to fetch (CMS pages and visual builder experiences).
    const pageTypes = ['CMSPage', 'SEOExperience']
    // Fetch all pages of these types from the CMS.
    const pathsResp = await optimizely.AllPages({ pageType: pageTypes })
    // Extract the list of page items from the response.
    const paths = pathsResp.data?._Content?.items ?? []
    // Filter out any paths that are missing a default URL.
    const filterPaths = paths.filter(
      (path) => path && path._metadata?.url?.default !== null
    )
    // Use a Set to collect unique slugs (removes duplicates).
    const uniquePaths = new Set<string>()
    filterPaths.forEach((path) => {
      // Remove the locale prefix from the path (e.g., '/en/about' -> 'about').
      const cleanPath = mapPathWithoutLocale(
        path?._metadata?.url?.default ?? ''
      )
      uniquePaths.add(cleanPath)
    })

    // Return an array of objects with the slug property for each unique path.
    return Array.from(uniquePaths).map((slug) => ({
      slug,
    }))
  } catch (e) {
    // If there's an error, log it and return an empty array.
    console.error(e)
    return []
  }
}


// The main page component for CMS and experience pages. This is an async server component in Next.js.
export default async function CmsPage(props: {
  params: Promise<{ locale: string; slug?: string }>
}) {
  // Extract the locale and slug from the route parameters.
  const { locale, slug = '' } = await props.params
  // Validate and normalize the locale.
  const locales = getValidLocale(locale)
  // Format the slug as a path (e.g., '/about').
  const formattedSlug = `/${slug}`
  // Check if the site is in draft/preview mode (for content editors).
  const { isEnabled: isDraftModeEnabled } = await draftMode()
  if (isDraftModeEnabled) {
    // If in draft mode, show the DraftModeCmsPage component inside a Suspense boundary.
    // Suspense allows you to show a fallback (DraftModeLoader) while loading async content.
    return (
      <Suspense fallback={<DraftModeLoader />}>
        <DraftModeCmsPage locales={locales} slug={formattedSlug} />
      </Suspense>
    )
  }

  // Fetch the page data for the given locale and slug from the CMS.
  const { data, errors } = await optimizely.getPageByURL({
    locales: [locales],
    slug: formattedSlug,
  })

  // If there are errors or the page is not found/modified, try to fetch a visual builder experience.
  if (errors || !data?.CMSPage?.item?._modified) {
    const experienceData = await optimizely.GetVisualBuilderBySlug({
      locales: [locales],
      slug: formattedSlug,
    })

    // Extract the experience item from the response.
    const experience = experienceData.data?.SEOExperience?.item as
      | SafeVisualBuilderExperience
      | undefined

    if (experience) {
      // If a visual builder experience is found, render it using the wrapper component.
      return (
        <Suspense>
          <VisualBuilderExperienceWrapper experience={experience} />
        </Suspense>
      )
    }

    // If nothing is found, show a 404 Not Found page.
    return notFound()
  }

  // Extract the page item from the response.
  const page = data.CMSPage.item
  // Get the blocks array, filtering out null/undefined values.
  const blocks = (page?.blocks ?? []).filter(
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
