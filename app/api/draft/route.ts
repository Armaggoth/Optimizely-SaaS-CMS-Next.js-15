/**
 * DRAFT MODE API ROUTE - Think of this as an ASP.NET HTTP Handler or Web API Controller
 *
 * This file creates an API endpoint that handles preview/draft functionality for a CMS.
 * In ASP.NET terms, this is like creating a controller action that responds to GET requests.
 *
 * FILE LOCATION SIGNIFICANCE:
 * - This file is located at /app/api/draft/route.ts
 * - In Next.js, this automatically creates an API endpoint at: https://yoursite.com/api/draft
 * - Think of it like having an [HttpGet] attribute on a controller method in ASP.NET
 *
 * WHAT IS "DRAFT MODE"?
 * - Similar to preview functionality in a CMS like Sitecore or Umbraco
 * - Allows content editors to see unpublished content changes before they go live
 * - Like having a staging environment but for individual pieces of content
 */

import { draftMode } from 'next/headers'        // Next.js utility to manage draft/preview state
import { notFound, redirect } from 'next/navigation'  // Similar to return NotFound() or RedirectToAction() in ASP.NET MVC
import { NextRequest, NextResponse } from 'next/server'  // Like HttpRequest and HttpResponse objects in ASP.NET

import { optimizely } from '@/lib/optimizely/fetch'  // Custom service for talking to Optimizely CMS API

/**
 * GET REQUEST HANDLER - This is like an ASP.NET Controller Action
 *
 * In ASP.NET, you might write:
 * [HttpGet]
 * public ActionResult Draft(string preview_token, string key, string ver, string loc)
 *
 * This Next.js version automatically handles GET requests to /api/draft
 * The function parameters and query string parsing happen differently but achieve the same result
 *
 * @param request - Similar to HttpRequest in ASP.NET, contains URL, headers, body, etc.
 */
export async function GET(request: NextRequest) {
  // QUERY STRING PARAMETER EXTRACTION
  // In ASP.NET, you might use: Request.QueryString["preview_token"]
  // Here we use the URL API to parse query parameters from the request URL
  const { searchParams } = new URL(request.url)

  // Extract required parameters (like method parameters in ASP.NET controller)
  const token = searchParams.get('preview_token')  // Security token to authorize preview access
  const key = searchParams.get('key')              // Unique identifier for the content item
  const ver = searchParams.get('ver')              // Version number of the content (like a revision ID)
  const loc = searchParams.get('loc')              // Locale/language code (e.g., 'en', 'sv', 'fr')

  // PARAMETER VALIDATION - Like model validation in ASP.NET MVC
  // If any required parameters are missing, return a 404 response
  // In ASP.NET: if (string.IsNullOrEmpty(ver)) return NotFound();
  if (!ver || !token || !key) {
    return notFound()  // Returns HTTP 404 Not Found response
  }

  // API CALL TO OPTIMIZELY CMS
  // This is like calling a WCF service or Web API in .NET Framework
  // We're asking Optimizely: "Give me the specific version of content with this key"
  // The 'preview: true' flag tells Optimizely to include unpublished/draft content
  const response = await optimizely.GetContentByKeyAndVersion(
    { key, ver },           // Parameters: which content and which version
    { preview: true }       // Options: include draft/unpublished content
  )

  // ERROR HANDLING - Like try/catch blocks in ASP.NET
  // Check if the API call returned any errors (similar to checking response.IsSuccessStatusCode)
  if (response.errors) {
    // Combine all error messages into a single string (like StringBuilder in C#)
    const errorsMessage = response.errors
      .map((error) => error.message)  // Extract message from each error object
      .join(', ')                     // Join with commas (like string.Join in C#)

    // Return an HTTP 401 Unauthorized response with the error messages
    // In ASP.NET: return new HttpResponseMessage(HttpStatusCode.Unauthorized) { Content = ... }
    return new NextResponse(errorsMessage, { status: 401 })
  }

  // EXTRACT CONTENT FROM API RESPONSE
  // Similar to deserializing JSON response in .NET: JsonConvert.DeserializeObject<T>()
  // We're drilling down into the response object to get the actual content item
  const content = response.data?._Content?.item

  // VALIDATE CONTENT EXISTS
  // If no content was returned, send HTTP 400 Bad Request
  // In ASP.NET: if (content == null) return BadRequest();
  if (!content) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // ENABLE DRAFT MODE - This is Next.js specific functionality
  // Think of this like setting a session variable or authentication cookie in ASP.NET
  // It tells the website: "This user should see draft/preview content"
  // The semicolon at the start is intentional - it prevents automatic semicolon insertion issues
  ;(await draftMode()).enable()

  // START BUILDING REDIRECT URL
  // We need to redirect the user to the appropriate preview URL based on content type
  let newUrl = ''
  // CONTENT TYPE DETECTION AND URL ROUTING
  // This is like a switch statement in C# that determines how to handle different object types
  // In Optimizely, content can be different types: pages, blocks, experiences, etc.
  // Each type needs to be previewed at a different URL pattern

  if (content.__typename === '_Experience') {
    // VISUAL BUILDER EXPERIENCES
    // Think of this like a page template or master page in ASP.NET
    // Experiences are used for A/B testing and personalization
    // URL pattern: /en/draft/123/experience/content-key-abc
    newUrl = `/${loc}/draft/${ver}/experience/${key}`

  } else if (content.__typename === '_Component') {
    // CONTENT BLOCKS/COMPONENTS
    // Similar to user controls (.ascx) in ASP.NET WebForms
    // These are reusable pieces of content that can be embedded in pages
    // URL pattern: /en/draft/123/block/content-key-abc
    newUrl = `/${loc}/draft/${ver}/block/${key}`

  } else {
    // REGULAR PAGES (Most common content type)
    // This handles standard CMS pages like Home, About, Contact, etc.

    // URL NORMALIZATION LOGIC
    // In hierarchical routing, the Start Page in Optimizely does not use "/" as its URL
    // but instead has a path like "/start-page". To normalize the URL and make it relative
    // to the Start Page, we remove the OPTIMIZELY_START_PAGE_URL prefix from the hierarchical URL.

    // Example: If hierarchical URL is "/start-page/about/team"
    // and OPTIMIZELY_START_PAGE_URL is "/start-page"
    // Result after replace: "/about/team"
    const hierarchicalUrl = content?._metadata?.url?.hierarchical?.replace(
      process.env.OPTIMIZELY_START_PAGE_URL ?? '',  // Environment variable (like web.config appSetting)
      ''
    )

    // REMOVE LOCALE PREFIX FROM URL
    // If URL is "/en/about/team", this removes "/en/" to get "about/team"
    // This is because we're going to add the locale back in a different format
    const hierarchicalUrlWithoutLocale = hierarchicalUrl?.replace(
      `/${loc}/`,    // Pattern to remove: "/en/" or "/sv/" etc.
      ''             // Replace with empty string
    )

    // BUILD FINAL DRAFT URL FOR PAGES
    // Final URL pattern: /en/draft/123/about/team
    // This tells the website: "Show the draft version 123 of the about/team page in English"
    newUrl = `/${loc}/draft/${ver}/${hierarchicalUrlWithoutLocale}`
  }

  // PERFORM REDIRECT
  // Similar to Response.Redirect() in ASP.NET WebForms or RedirectToAction() in MVC
  // This sends an HTTP 302 redirect response to the client's browser
  // The browser will then navigate to the new URL where they can see the draft content
  redirect(`${newUrl}`)
}

/**
 * HOW THIS ALL WORKS TOGETHER:
 *
 * 1. Content editor clicks "Preview" button in Optimizely CMS
 * 2. CMS sends them to: /api/draft?preview_token=abc&key=xyz&ver=123&loc=en
 * 3. This function validates the parameters and fetches the content
 * 4. Based on content type, it builds the appropriate preview URL
 * 5. It enables "draft mode" so the site shows unpublished content
 * 6. It redirects the user to the preview URL where they see their changes
 *
 * COMPARISON TO ASP.NET:
 * - This is like having a Generic Handler (.ashx) or Web API controller
 * - The file-based routing in Next.js is similar to URL routing in ASP.NET MVC
 * - Draft mode is like using session state or authentication cookies
 * - The redirect is like Response.Redirect() or RedirectToAction()
 *
 * KEY DIFFERENCES FROM ASP.NET:
 * - No web.config - configuration comes from environment variables
 * - No Global.asax - routing is determined by file/folder structure
 * - Async/await works the same way as in modern .NET
 * - TypeScript provides compile-time type checking (like C#)
 */
