/**
 * DRAFT CONTENT PAGE COMPONENT - Think of this as a Web Page in ASP.NET WebForms
 *
 * This file creates content pages that show draft/preview content for specific URLs (slugs).
 * In ASP.NET terms, this is similar to:
 * - A dynamic page that handles any URL pattern like /products/*, /about/*, /services/*
 * - An MVC controller action that accepts a slug parameter and renders content
 * - A page that loads CMS content dynamically based on the requested URL
 *
 * ================================================================================
 * WHERE THIS PAGE IS ACCESSED - URL Routing and File Dependencies
 * ================================================================================
 *
 * URL PATTERN THIS PAGE HANDLES:
 * /{locale}/draft/{version}/{slug}/
 * Examples:
 * - /en/draft/123/about/           (English "About" page, draft version 123)
 * - /sv/draft/456/services/web/    (Swedish "Services > Web" page, draft version 456)
 * - /fr/draft/789/contact/         (French "Contact" page, draft version 789)
 * - /en/draft/123/products/mobile/ (English "Products > Mobile" page, draft version 123)
 *
 * HOW USERS REACH THIS PAGE:
 * └── From app/api/draft/route.ts (Draft Mode API)
 *     ├── When content editor clicks "Preview" for any content page (not home page)
 *     ├── API validates preview token and redirects here based on page URL
 *     └── URL format: /{locale}/draft/{version}/{hierarchical-url}/
 *
 * DOCUMENTATION REFERENCES:
 * └── docs/draft-mode.md (Draft Mode Documentation)
 *     ├── Line 339 - Example usage: await optimizely.getPreviewPageByURL(...)
 *     ├── Line 367 - File reference: lib/optimizely/queries/draft/GetPreviewPageByUrl.graphql
 *     └── Purpose: Implementation guide for draft content pages
 *
 * RELATIVE PATHS FROM PROJECT ROOT:
 * - Current file: app/(draft)/[locale]/draft/[version]/[slug]/page.tsx
 * - Layout that wraps this page: app/(draft)/[locale]/layout.tsx
 * - API that redirects here: app/api/draft/route.ts
 * - Content area mapper: components/content-area/mapper.tsx
 * - On-page edit component: components/draft/on-page-edit.tsx
 * - GraphQL query: lib/optimizely/queries/draft/GetPreviewPageByUrl.graphql
 * - Optimizely utilities: lib/optimizely/fetch.ts
 *
 * COMPONENT DEPENDENCY TREE:
 * CmsPage (this file)
 * ├── Uses: optimizely.getPreviewPageByURL (GraphQL query)
 * ├── Renders: OnPageEdit (draft editing controls)
 * ├── Renders: ContentAreaMapper (displays content blocks)
 * ├── Wrapped by: app/(draft)/[locale]/layout.tsx
 * └── Data from: Optimizely CMS via GraphQL API (specific page by URL)
 *
 * IN ASP.NET TERMS:
 * This is like a dynamic page that:
 * - Accepts a wildcard route parameter (like /Pages/{*slug}.aspx)
 * - Checks if user is authenticated for preview mode
 * - Looks up content in CMS database by URL and version
 * - Dynamically renders content blocks/controls for that page
 * - Includes special editing controls for content management
 *
 * FOLDER STRUCTURE SIGNIFICANCE:
 * - (draft): Only used for draft/preview pages, not live site
 * - [locale]: Dynamic route segment for language (en, sv, fr, etc.)
 * - draft: Literal path segment identifying this as draft mode
 * - [version]: Dynamic route segment for content version number
 * - [slug]: Dynamic route segment for page URL (catch-all route)
 * - page.tsx: Next.js convention for page components
 *
 * DIFFERENCE FROM HOME PAGE:
 * - Home page: app/(draft)/[locale]/draft/[version]/page.tsx (no slug)
 * - Content pages: app/(draft)/[locale]/draft/[version]/[slug]/page.tsx (with slug)
 * - Home page uses GetPreviewStartPage query
 * - Content pages use getPreviewPageByURL query
 *
 * ================================================================================
 *
 * WHAT IS A NEXT.JS PAGE COMPONENT?
 * - A React component that represents a complete web page
 * - Like a code-behind class for an ASP.NET page that handles requests
 * - Automatically becomes accessible at a URL based on folder structure
 * - Can fetch data, render content, and handle user interactions
 *
 * SLUG PARAMETER EXPLANATION:
 * - [slug] in the folder name creates a catch-all route parameter
 * - Captures any URL path after /draft/{version}/
 * - Examples: "about", "services/web", "products/mobile/apps"
 * - Similar to using {*path} in ASP.NET MVC routing
 *
 * FILE EXTENSION: .tsx
 * - TSX = TypeScript + JSX (JavaScript XML)
 * - JSX allows writing HTML-like syntax inside JavaScript/TypeScript
 * - TypeScript provides compile-time type checking (like C#)
 * - Similar to how Razor syntax mixes C# and HTML in .cshtml files
 */

// IMPORT STATEMENTS - Like 'using' statements in C#
import ContentAreaMapper from '@/components/content-area/mapper'     // Component that renders content blocks
import OnPageEdit from '@/components/draft/on-page-edit'           // Draft mode editing controls
import { optimizely } from '@/lib/optimizely/fetch'                // GraphQL client for CMS data
import { getValidLocale } from '@/lib/optimizely/utils/language'   // Language/locale validation utilities
import { checkDraftMode } from '@/lib/utils/draft-mode'            // Draft mode validation utility
import { notFound } from 'next/navigation'                         // Next.js 404 response function
import { Suspense } from 'react'                                   // React component for loading states

/**
 * NEXT.JS PAGE CONFIGURATION
 *
 * These exports configure how Next.js handles this page
 * Think of these like page directives or web.config settings in ASP.NET
 */

// CACHE REVALIDATION - Never cache this page
// In ASP.NET: like setting Cache-Control: no-cache headers
// Draft content changes frequently, so we always want fresh data
export const revalidate = 0

// DYNAMIC RENDERING - Force server-side rendering on every request
// In ASP.NET: like having no output caching, always regenerate the page
// Ensures draft content is always up-to-date with latest changes
export const dynamic = 'force-dynamic'

/**
 * CMS PAGE COMPONENT FUNCTION - The Main Method for This Page
 *
 * This is the main function that gets executed when someone visits any content page URL.
 * In ASP.NET terms, this is like:
 * - The Page_Load method in a WebForms code-behind file that handles dynamic pages
 * - An MVC controller action that accepts a slug and returns a view
 * - A method that fetches CMS content by URL and renders HTML
 *
 * FUNCTION SIGNATURE EXPLANATION:
 * - 'async' = This function can perform asynchronous operations (like async/await in C#)
 * - 'function CmsPage' = The component name (like a class name in C#)
 * - 'props' parameter = Data passed to this page from the routing system
 *
 * PROPS PARAMETER BREAKDOWN:
 * - params: URL route parameters extracted from the file path structure
 * - Promise<{ locale: string; version: string; slug?: string }> = Async data containing:
 *   - locale: Language code from [locale] folder (en, sv, fr, etc.)
 *   - version: Content version from [version] folder (123, 456, etc.)
 *   - slug?: Page URL path from [slug] folder (about, services/web, etc.) - Optional with ?
 *
 * TYPESCRIPT TYPES EXPLANATION:
 * - Promise<T> = Async result (like Task<T> in modern .NET)
 * - string = Text data type (same as C# string)
 * - slug?: string = Optional parameter (like nullable string in C#)
 * - The type definition ensures we get the right data structure
 */
export default async function CmsPage(props: {
  params: Promise<{ locale: string; version: string; slug?: string }>
}) {
  // DRAFT MODE SECURITY CHECK
  // Verify that the user is authorized to see draft content
  // In ASP.NET: like checking if user is authenticated or has preview permissions
  const isDraftModeEnabled = await checkDraftMode()
  if (!isDraftModeEnabled) {
    return notFound()  // Return 404 if user shouldn't see draft content
  }

  /**
   * SECURITY EXPLANATION:
   * - checkDraftMode() verifies draft mode is active for this user
   * - Similar to checking Session["DraftMode"] or User.IsInRole("ContentEditor")
   * - Prevents unauthorized access to unpublished content
   * - If check fails, returns 404 (not 401) to avoid revealing page existence
   */

  // EXTRACT URL PARAMETERS WITH DEFAULT VALUES
  // Get the language, version, and page slug from the URL path
  // In ASP.NET: like accessing RouteData.Values["locale"], RouteData.Values["version"], RouteData.Values["slug"]
  const { locale, slug = '', version } = await props.params

  // VALIDATE AND NORMALIZE LOCALE
  // Ensure the locale is supported and get proper format
  // In ASP.NET: like validating and normalizing user input
  const locales = getValidLocale(locale)

  // FORMAT SLUG FOR OPTIMIZELY QUERY
  // Add leading slash to match URL format expected by CMS
  // In ASP.NET: like normalizing URL paths for database queries
  const formattedSlug = `/${slug}`

  /**
   * URL PARAMETER PROCESSING:
   * - locale comes from URL: /en/draft/123/about/ -> locale = "en"
   * - version comes from URL: /en/draft/123/about/ -> version = "123"
   * - slug comes from URL: /en/draft/123/about/ -> slug = "about"
   * - slug defaults to empty string if not provided
   * - formattedSlug adds leading slash: "/about" (matches CMS URL format)
   *
   * SIMILAR TO ASP.NET:
   * var locale = RouteData.Values["locale"]?.ToString() ?? "";
   * var version = RouteData.Values["version"]?.ToString() ?? "";
   * var slug = RouteData.Values["slug"]?.ToString() ?? "";
   * var formattedSlug = "/" + slug;
   */

  // FETCH DRAFT CONTENT FROM OPTIMIZELY CMS BY URL
  // Make a GraphQL query to get the specific version of the page matching the slug
  // In ASP.NET: like calling a web service, WCF service, or database query with WHERE clause
  const pageResponse = await optimizely.getPreviewPageByURL(
    { locales, slug: formattedSlug, version },  // Query parameters: language, URL, and version
    { preview: true }                           // Options: include draft/unpublished content
  )

  /**
   * GRAPHQL QUERY EXPLANATION:
   * - getPreviewPageByURL is defined in: lib/optimizely/queries/draft/GetPreviewPageByUrl.graphql
   * - It fetches a CMS page that matches the specific URL slug and version
   * - Similar to: SELECT * FROM Pages WHERE URL = @slug AND Version = @version AND Locale = @locale
   * - The query returns content blocks that make up the page
   *
   * IN ASP.NET EQUIVALENT:
   * var pageData = await cmsService.GetPageByUrlAsync(formattedSlug, version, locale);
   * or
   * using (var context = new CmsDbContext())
   * {
   *     var page = await context.Pages
   *         .Where(p => p.Url == formattedSlug && p.Version == version && p.Locale == locale)
   *         .Include(p => p.ContentBlocks)
   *         .FirstOrDefaultAsync();
   * }
   *
   * QUERY PARAMETERS:
   * - locales: Language codes array (e.g., ["en"])
   * - slug: Formatted page URL (e.g., "/about", "/services/web")
   * - version: Content version identifier (e.g., "123")
   * - preview: true = Include draft/unpublished content
   */

  // EXTRACT PAGE DATA AND CONTENT BLOCKS
  // Navigate through the response structure to get the actual content
  const page = pageResponse.data?.CMSPage?.item
  const blocks = (page?.blocks ?? []).filter(
    (block) => block !== null && block !== undefined
  )

  /**
   * DATA EXTRACTION EXPLANATION:
   * - pageResponse.data?.CMSPage?.item: Safe navigation (like ?. operator in C# 8+)
   * - page?.blocks ?? []: Null coalescing (like ?? operator in C#)
   * - .filter(): Removes null/undefined blocks (like LINQ Where() in C#)
   *
   * SIMILAR TO ASP.NET:
   * var page = pageResponse?.Data?.CmsPage?.Item;
   * var blocks = page?.ContentBlocks?.Where(b => b != null).ToList() ?? new List<ContentBlock>();
   *
   * WHY WE FILTER:
   * - GraphQL can return null values for optional fields
   * - We want a clean array of valid content blocks
   * - Prevents errors when rendering the blocks later
   *
   * DIFFERENCE FROM HOME PAGE:
   * - Home page response: pageResponse.data?.StartPage?.item
   * - Content page response: pageResponse.data?.CMSPage?.item
   * - Different content types in Optimizely CMS
   */

  // RENDER THE PAGE HTML
  // Return the JSX that generates the final HTML sent to browser
  // In ASP.NET: like the HTML markup in .aspx file or Razor view

  return (
    // MAIN CONTAINER DIV WITH OPTIMIZELY EDITING METADATA AND STYLING
    // The data-epi-edit attribute tells Optimizely this area contains editable content
    // The className applies styling (container, padding, etc.)
    <div className="container py-10" data-epi-edit="blocks">
      {/*
      CONTAINER STYLING EXPLANATION:
      - className="container py-10": Tailwind CSS utility classes
      - container: Centers content with max-width constraints
      - py-10: Adds vertical padding (top and bottom)
      - Similar to: <div class="container" style="padding-top: 2.5rem; padding-bottom: 2.5rem;">

      OPTIMIZELY EDITING ATTRIBUTE:
      - data-epi-edit="blocks": Tells Optimizely CMS this div contains content blocks
      - Enables inline editing when content editors are previewing
      - Similar to adding custom data attributes in ASP.NET for JavaScript functionality
      */}

      {/* ON-PAGE EDITING CONTROLS
          Component that provides draft-specific editing functionality
          In ASP.NET: like including a UserControl that handles editing features */}
      <OnPageEdit
        version={version}
        currentRoute={`/${locale}/draft/${version}/${slug}`}
      />
      {/*
      ON-PAGE EDIT PROPS EXPLANATION:
      - version: The content version being previewed (from URL)
      - currentRoute: The full URL path for this specific page
      - This component likely provides save, publish, or navigation controls
      - Similar to admin controls that only appear for authorized users

      ROUTE CONSTRUCTION:
      - Template: `/${locale}/draft/${version}/${slug}`
      - Example: "/en/draft/123/about" for English About page version 123
      - Used for navigation and API calls within the editing interface
      */}

      {/* CONTENT AREA MAPPER WITH SUSPENSE
          Suspense provides loading state while content blocks are being rendered
          ContentAreaMapper dynamically renders all the content blocks */}
      <Suspense>
        <ContentAreaMapper blocks={blocks} preview />
      </Suspense>
      {/*
      SUSPENSE AND CONTENT MAPPER EXPLANATION:

      SUSPENSE:
      - React feature that shows loading state while child components load
      - Similar to showing "Loading..." message while database query executes
      - In ASP.NET: like using UpdatePanels with progress indicators

      CONTENTAREAMAPPER:
      - Component that takes the array of content blocks and renders them
      - blocks: The content data we fetched from Optimizely for this specific page
      - preview: Flag indicating this is preview mode (may show draft content differently)

      SIMILAR TO ASP.NET:
      foreach (var block in blocks)
      {
          var userControl = LoadControl($"~/Controls/{block.Type}.ascx") as IContentBlock;
          userControl.Data = block;
          PlaceHolder1.Controls.Add(userControl);
      }

      OR IN MVC:
      @foreach (var block in Model.Blocks)
      {
          @Html.Partial(block.ViewName, block)
      }
      */}
    </div>
  )
}

/**
 * HOW THIS PAGE WORKS - COMPLETE FLOW EXPLANATION
 *
 * TYPICAL USER WORKFLOW:
 *
 * 1. CONTENT EDITOR SCENARIO
 *    - Editor clicks "Preview" button in Optimizely CMS for a specific page (e.g., About page version 123)
 *    - CMS redirects to: /api/draft?key=about-page&ver=123&loc=en&preview_token=xyz
 *    - Draft API validates token and redirects to: /en/draft/123/about/
 *    - This page component executes to show the draft About page
 *    - Editor sees preview with special editing controls and current content
 *
 * 2. TECHNICAL EXECUTION FLOW
 *    Step 1: Next.js routing system matches URL pattern /{locale}/draft/{version}/{slug}/
 *    Step 2: This CmsPage component function gets called with extracted parameters
 *    Step 3: Check if user is authorized for draft mode
 *    Step 4: Extract locale, version, and slug from URL parameters
 *    Step 5: Format slug for GraphQL query and validate locale
 *    Step 6: Fetch draft content from Optimizely CMS using GraphQL with URL matching
 *    Step 7: Extract content blocks from response
 *    Step 8: Render HTML with container styling, editing controls, and content blocks
 *    Step 9: Browser displays the draft page with preview functionality
 *
 * COMPARISON TO ASP.NET PATTERNS:
 *
 * ASP.NET WebForms with Dynamic Pages:
 * public partial class DynamicPage : System.Web.UI.Page
 * {
 *     protected async void Page_Load(object sender, EventArgs e)
 *     {
 *         if (!CheckDraftModeAuthorization())
 *         {
 *             Response.StatusCode = 404;
 *             return;
 *         }
 *
 *         var locale = RouteData.Values["locale"].ToString();
 *         var version = RouteData.Values["version"].ToString();
 *         var slug = RouteData.Values["slug"].ToString();
 *
 *         var pageData = await cmsService.GetPreviewPageByUrlAsync($"/{slug}", locale, version);
 *
 *         foreach (var block in pageData.Blocks)
 *         {
 *             var control = LoadControl($"~/Controls/{block.Type}.ascx");
 *             // Set control properties from block data
 *             ContentPlaceHolder.Controls.Add(control);
 *         }
 *     }
 * }
 *
 * ASP.NET MVC with Dynamic Actions:
 * public class DraftController : Controller
 * {
 *     [Route("{locale}/draft/{version}/{*slug}")]
 *     public async Task<ActionResult> ContentPage(string locale, string version, string slug)
 *     {
 *         if (!CheckDraftMode()) return HttpNotFound();
 *
 *         slug = "/" + (slug ?? "");
 *         var pageData = await _cmsService.GetPreviewPageByUrlAsync(slug, locale, version);
 *
 *         var model = new ContentPageViewModel
 *         {
 *             Blocks = pageData.Blocks,
 *             Version = version,
 *             Locale = locale,
 *             Slug = slug
 *         };
 *
 *         return View(model);
 *     }
 * }
 *
 * KEY DIFFERENCES FROM ASP.NET:
 *
 * 1. FILE-BASED ROUTING WITH CATCH-ALL
 *    - [slug] folder creates catch-all route parameter
 *    - Captures any URL structure: about, services/web, products/mobile/apps
 *    - No need for complex routing configuration or wildcard routes
 *
 * 2. OPTIONAL PARAMETERS WITH DEFAULTS
 *    - slug?: string with default value handling
 *    - TypeScript ensures type safety for optional parameters
 *    - More robust than nullable strings in older .NET versions
 *
 * 3. BUILT-IN ASYNC AND PERFORMANCE
 *    - All components async by default with no configuration
 *    - Automatic caching control for draft content
 *    - Better performance than traditional postback model
 *
 * 4. COMPONENT-BASED RENDERING
 *    - Declarative JSX describes the UI structure
 *    - No imperative control manipulation
 *    - More predictable rendering than dynamic control loading
 *
 * URL EXAMPLES AND MAPPINGS:
 *
 * - /en/draft/123/about/ -> locale="en", version="123", slug="about"
 * - /sv/draft/456/services/web/ -> locale="sv", version="456", slug="services/web"
 * - /fr/draft/789/products/mobile/apps/ -> locale="fr", version="789", slug="products/mobile/apps"
 * - /en/draft/123/ -> locale="en", version="123", slug="" (redirects to home page)
 *
 * SECURITY CONSIDERATIONS:
 *
 * - Draft mode check prevents unauthorized access to unpublished content
 * - Version parameter validation prevents access to invalid versions
 * - Slug parameter sanitization prevents directory traversal attacks
 * - Preview flag ensures only authorized preview content is shown
 *
 * PERFORMANCE CONSIDERATIONS:
 *
 * - revalidate = 0: No caching for draft content (always fresh)
 * - dynamic = 'force-dynamic': Always server-render for security
 * - Suspense: Progressive loading of content blocks
 * - GraphQL: Only fetch exactly the data needed for this specific page
 *
 * DEBUGGING TIPS:
 *
 * 1. Check if draft mode is properly enabled before accessing this page
 * 2. Verify URL parameters are correctly extracted (locale, version, slug)
 * 3. Test slug formatting (ensure leading slash is added)
 * 4. Inspect GraphQL response to ensure correct page data is fetched
 * 5. Check browser network tab for API calls and responses
 * 6. Use React Developer Tools to inspect component props and state
 * 7. Verify content blocks are being properly filtered and rendered
 * 8. Test different URL patterns to ensure routing works correctly
 */
