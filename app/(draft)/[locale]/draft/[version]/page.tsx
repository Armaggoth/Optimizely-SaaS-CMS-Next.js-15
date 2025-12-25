/**
 * DRAFT HOME PAGE COMPONENT - Think of this as a Web Page in ASP.NET WebForms
 *
 * This file creates the home page that shows draft/preview content for a specific version.
 * In ASP.NET terms, this is similar to:
 * - A Default.aspx page that displays dynamic content from a database
 * - An MVC controller action that renders a view with CMS content
 * - A page that loads and displays content blocks dynamically
 *
 * ================================================================================
 * WHERE THIS PAGE IS ACCESSED - URL Routing and File Dependencies
 * ================================================================================
 *
 * URL PATTERN THIS PAGE HANDLES:
 * /{locale}/draft/{version}/
 * Examples:
 * - /en/draft/123/          (English home page, draft version 123)
 * - /sv/draft/456/          (Swedish home page, draft version 456)
 * - /fr/draft/789/          (French home page, draft version 789)
 *
 * HOW USERS REACH THIS PAGE:
 * └── From app/api/draft/route.ts (Draft Mode API)
 *     ├── When content editor clicks "Preview" in Optimizely CMS
 *     ├── API validates preview token and redirects here
 *     └── URL format: /{locale}/draft/{version}/
 *
 * DOCUMENTATION REFERENCES:
 * └── docs/draft-mode.md (Draft Mode Documentation)
 *     ├── Line 246 - File reference: app/(draft)/[locale]/draft/[version]/page.tsx
 *     ├── Line 258 - Code example showing HomePage function
 *     └── Purpose: Implementation guide for draft home pages
 *
 * RELATIVE PATHS FROM THIS FILE:
 * - Layout that wraps this page: ../../layout.tsx
 * - API that redirects here: ../../../../api/draft/route.ts
 * - Content area mapper: ../../../../components/content-area/mapper.tsx
 * - On-page edit component: ../../../../components/draft/on-page-edit.tsx
 * - GraphQL query: ../../../../lib/optimizely/queries/draft/GetPreviewStartPage.graphql
 * - Optimizely utilities: ../../../../lib/optimizely/fetch.ts
 *
 * COMPONENT DEPENDENCY TREE:
 * HomePage (this file)
 * ├── Uses: optimizely.GetPreviewStartPage (GraphQL query)
 * ├── Renders: OnPageEdit (draft editing controls)
 * ├── Renders: ContentAreaMapper (displays content blocks)
 * ├── Wrapped by: app/(draft)/[locale]/layout.tsx
 * └── Data from: Optimizely CMS via GraphQL API
 *
 * IN ASP.NET TERMS:
 * This is like a Default.aspx page that:
 * - Checks if user is authenticated for preview mode
 * - Loads content from a CMS database using specific version ID
 * - Dynamically renders content blocks/controls on the page
 * - Includes special editing controls for content management
 *
 * FOLDER STRUCTURE SIGNIFICANCE:
 * - (draft): Only used for draft/preview pages, not live site
 * - [locale]: Dynamic route segment for language (en, sv, fr, etc.)
 * - draft: Literal path segment identifying this as draft mode
 * - [version]: Dynamic route segment for content version number
 * - page.tsx: Next.js convention for page components
 *
 * ================================================================================
 *
 * WHAT IS A NEXT.JS PAGE COMPONENT?
 * - A React component that represents a complete web page
 * - Like a code-behind class for an ASP.NET page that handles requests
 * - Automatically becomes accessible at a URL based on folder structure
 * - Can fetch data, render content, and handle user interactions
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
 * HOME PAGE COMPONENT FUNCTION - The Main Method for This Page
 *
 * This is the main function that gets executed when someone visits this page.
 * In ASP.NET terms, this is like:
 * - The Page_Load method in a WebForms code-behind file
 * - An MVC controller action that returns a view
 * - A method that fetches data and renders HTML
 *
 * FUNCTION SIGNATURE EXPLANATION:
 * - 'async' = This function can perform asynchronous operations (like async/await in C#)
 * - 'function HomePage' = The component name (like a class name in C#)
 * - 'props' parameter = Data passed to this page from the routing system
 *
 * PROPS PARAMETER BREAKDOWN:
 * - params: URL route parameters extracted from the file path
 * - Promise<{ locale: string; version: string }> = Async data containing:
 *   - locale: Language code from [locale] folder (en, sv, fr, etc.)
 *   - version: Content version from [version] folder (123, 456, etc.)
 *
 * TYPESCRIPT TYPES EXPLANATION:
 * - Promise<T> = Async result (like Task<T> in modern .NET)
 * - string = Text data type (same as C# string)
 * - The type definition ensures we get the right data structure
 */
export default async function HomePage(props: {
  params: Promise<{ locale: string; version: string }>
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

  // EXTRACT URL PARAMETERS
  // Get the language and version from the URL path
  // In ASP.NET: like accessing RouteData.Values["locale"] and RouteData.Values["version"]
  const { locale, version } = await props.params

  // VALIDATE AND NORMALIZE LOCALE
  // Ensure the locale is supported and get proper format
  // In ASP.NET: like validating and normalizing user input
  const locales = getValidLocale(locale)

  /**
   * LOCALE PROCESSING:
   * - locale comes from URL: /en/draft/123/ -> locale = "en"
   * - getValidLocale() validates it's a supported language
   * - Returns normalized locale format for GraphQL query
   * - Similar to input validation in ASP.NET forms or controllers
   */
  // FETCH DRAFT CONTENT FROM OPTIMIZELY CMS
  // Make a GraphQL query to get the specific version of the home page
  // In ASP.NET: like calling a web service, WCF service, or database query
  const pageResponse = await optimizely.GetPreviewStartPage(
    { locales, version },  // Query parameters: which language and version
    { preview: true }      // Options: include draft/unpublished content
  )

  /**
   * GRAPHQL QUERY EXPLANATION:
   * - GetPreviewStartPage is defined in: ../../../../lib/optimizely/queries/draft/GetPreviewStartPage.graphql
   * - It fetches the home page content for a specific version
   * - Similar to: SELECT * FROM Pages WHERE Version = @version AND Locale = @locale
   * - The query returns content blocks that make up the page
   *
   * IN ASP.NET EQUIVALENT:
   * var pageData = await cmsService.GetPageByVersionAsync(version, locale);
   * or
   * using (var context = new CmsDbContext())
   * {
   *     var page = await context.Pages
   *         .Where(p => p.Version == version && p.Locale == locale)
   *         .Include(p => p.ContentBlocks)
   *         .FirstOrDefaultAsync();
   * }
   */

  // EXTRACT PAGE DATA AND CONTENT BLOCKS
  // Navigate through the response structure to get the actual content
  const startPage = pageResponse.data?.StartPage?.item
  const blocks = (startPage?.blocks ?? []).filter(
    (block) => block !== null && block !== undefined
  )

  /**
   * DATA EXTRACTION EXPLANATION:
   * - pageResponse.data?.StartPage?.item: Safe navigation (like ?. operator in C# 8+)
   * - startPage?.blocks ?? []: Null coalescing (like ?? operator in C#)
   * - .filter(): Removes null/undefined blocks (like LINQ Where() in C#)
   *
   * SIMILAR TO ASP.NET:
   * var blocks = pageData?.ContentBlocks?.Where(b => b != null).ToList() ?? new List<ContentBlock>();
   *
   * WHY WE FILTER:
   * - GraphQL can return null values for optional fields
   * - We want a clean array of valid content blocks
   * - Prevents errors when rendering the blocks later
   */

  // RENDER THE PAGE HTML
  // Return the JSX that generates the final HTML sent to browser
  // In ASP.NET: like the HTML markup in .aspx file or Razor view

  return (
    // MAIN CONTAINER DIV WITH OPTIMIZELY EDITING METADATA
    // The data-epi-edit attribute tells Optimizely this area contains editable content
    // In ASP.NET: like adding custom attributes for client-side functionality
    <div data-epi-edit="blocks">
      {/*
      OPTIMIZELY EDITING ATTRIBUTE EXPLANATION:
      - data-epi-edit="blocks": Tells Optimizely CMS this div contains content blocks
      - Enables inline editing when content editors are previewing
      - Similar to adding custom data attributes in ASP.NET for JavaScript functionality
      */}

      {/* ON-PAGE EDITING CONTROLS
          Component that provides draft-specific editing functionality
          In ASP.NET: like including a UserControl that handles editing features */}
      <OnPageEdit
        version={version}
        currentRoute={`/${locale}/draft/${version}`}
      />
      {/*
      ON-PAGE EDIT PROPS EXPLANATION:
      - version: The content version being previewed (from URL)
      - currentRoute: The full URL path for this page
      - This component likely provides save, publish, or navigation controls
      - Similar to admin controls that only appear for authorized users
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
      - blocks: The content data we fetched from Optimizely
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
 *    - Editor clicks "Preview" button in Optimizely CMS for a specific content version
 *    - CMS redirects to: /api/draft?key=home&ver=123&loc=en&preview_token=xyz
 *    - Draft API validates token and redirects to: /en/draft/123/
 *    - This page component executes to show the draft home page
 *    - Editor sees preview with special editing controls
 *
 * 2. TECHNICAL EXECUTION FLOW
 *    Step 1: Next.js routing system matches URL pattern /{locale}/draft/{version}/
 *    Step 2: This HomePage component function gets called
 *    Step 3: Check if user is authorized for draft mode
 *    Step 4: Extract locale and version from URL parameters
 *    Step 5: Validate locale and prepare GraphQL query parameters
 *    Step 6: Fetch draft content from Optimizely CMS using GraphQL
 *    Step 7: Extract content blocks from response
 *    Step 8: Render HTML with editing controls and content blocks
 *    Step 9: Browser displays the draft page with preview functionality
 *
 * COMPARISON TO ASP.NET PATTERNS:
 *
 * ASP.NET WebForms Equivalent:
 * public partial class DraftHomePage : System.Web.UI.Page
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
 *
 *         var pageData = await cmsService.GetPreviewPageAsync(locale, version);
 *
 *         foreach (var block in pageData.Blocks)
 *         {
 *             var control = LoadControl($"~/Controls/{block.Type}.ascx");
 *             // Set control properties
 *             ContentPlaceHolder.Controls.Add(control);
 *         }
 *     }
 * }
 *
 * ASP.NET MVC Equivalent:
 * public class DraftController : Controller
 * {
 *     [Route("{locale}/draft/{version}")]
 *     public async Task<ActionResult> HomePage(string locale, string version)
 *     {
 *         if (!CheckDraftMode()) return HttpNotFound();
 *
 *         var pageData = await _cmsService.GetPreviewPageAsync(locale, version);
 *         var model = new HomePageViewModel
 *         {
 *             Blocks = pageData.Blocks,
 *             Version = version,
 *             Locale = locale
 *         };
 *
 *         return View(model);
 *     }
 * }
 *
 * KEY DIFFERENCES FROM ASP.NET:
 *
 * 1. FILE-BASED ROUTING
 *    - No RouteConfig or controller routing attributes needed
 *    - Folder structure automatically creates routes
 *    - [locale] and [version] create dynamic route parameters
 *
 * 2. COMPONENT-BASED ARCHITECTURE
 *    - Everything is a function that returns JSX (HTML-like syntax)
 *    - No separation between code-behind and markup files
 *    - Data fetching and rendering combined in single function
 *
 * 3. BUILT-IN ASYNC SUPPORT
 *    - All components can be async by default
 *    - No need for async pages or special configuration
 *    - Automatic handling of async data fetching
 *
 * 4. DECLARATIVE RENDERING
 *    - JSX describes what the UI should look like
 *    - React handles the actual DOM manipulation
 *    - More predictable than imperative control manipulation
 *
 * SECURITY CONSIDERATIONS:
 *
 * - Draft mode check prevents unauthorized access to unpublished content
 * - Version parameter validation prevents access to invalid versions
 * - Preview flag ensures only authorized preview content is shown
 * - Similar to role-based security in ASP.NET applications
 *
 * PERFORMANCE CONSIDERATIONS:
 *
 * - revalidate = 0: No caching, always fresh content (needed for drafts)
 * - dynamic = 'force-dynamic': Always server-render (needed for auth checks)
 * - Suspense: Progressive loading of content blocks
 * - GraphQL: Only fetch exactly the data needed for this page
 *
 * DEBUGGING TIPS:
 *
 * 1. Check if draft mode is properly enabled before accessing this page
 * 2. Verify URL parameters are correctly extracted (locale, version)
 * 3. Inspect GraphQL response to ensure data is being fetched
 * 4. Check browser network tab for API calls and responses
 * 5. Use React Developer Tools to inspect component props and state
 * 6. Verify content blocks are being properly filtered and rendered
 */
