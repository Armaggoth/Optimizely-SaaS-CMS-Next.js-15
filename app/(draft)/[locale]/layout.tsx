/**
 * DRAFT MODE LAYOUT - Think of this as a Master Page in ASP.NET WebForms
 *
 * This file defines the overall HTML structure and styling for ALL pages in draft/preview mode.
 * In ASP.NET terms, this is equivalent to:
 * - A Master Page (.master file) in WebForms
 * - A _Layout.cshtml file in ASP.NET MVC
 * - The common HTML wrapper that appears on every page
 *
 * FILE LOCATION SIGNIFICANCE:
 * - Located at: /app/(draft)/[locale]/layout.tsx
 * - The "(draft)" folder name means this layout ONLY applies to draft/preview pages
 * - The "[locale]" means this supports multiple languages (like en, sv, fr, etc.)
 * - This is like having separate master pages for different sections of your site
 *
 * WHAT IS TSX?
 * - TSX = TypeScript + JSX (JavaScript XML)
 * - Think of JSX as a way to write HTML inside JavaScript/TypeScript
 * - Similar to how Razor syntax lets you mix C# and HTML in .cshtml files
 * - The TypeScript part gives you compile-time type checking (like C#)
 */

// IMPORT STATEMENTS - Like 'using' statements in C#
import '@/app/globals.css'                           // Global CSS styles (like a global stylesheet)
import { Geist, Geist_Mono } from 'next/font/google' // Google Fonts (like referencing CSS fonts)
import Script from 'next/script'                     // Component for loading JavaScript files
import DraftActions from '@/components/draft/draft-actions' // Custom component for draft mode functionality

/**
 * FONT CONFIGURATION - Setting up typography
 *
 * In ASP.NET, you might define fonts in CSS or web.config
 * Here we're configuring Google Fonts with specific settings
 *
 * This is like defining font families that will be available throughout the application
 */
const geistSans = Geist({
  variable: '--font-geist-sans',  // CSS custom property (like a CSS variable)
  subsets: ['latin'],             // Character set to load (optimization)
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',  // CSS custom property for monospace font
  subsets: ['latin'],             // Character set to load
})

/**
 * NEXT.JS CONFIGURATION EXPORTS
 *
 * These are special configurations that tell Next.js how to handle this layout
 * Think of these like attributes or configuration settings in web.config
 */

// DYNAMIC RENDERING - Forces server-side rendering on every request
// In ASP.NET terms: this is like having no output caching, always regenerate the page
// We need this for draft mode because content changes frequently and we need fresh data
export const dynamic = 'force-dynamic'

// CACHE REVALIDATION - Never cache this layout
// In ASP.NET: like setting Cache-Control: no-cache headers
// This ensures draft content is always up-to-date
export const revalidate = 0

/**
 * ROOT LAYOUT FUNCTION - The Main Method for This Layout
 *
 * This is the main function that generates the HTML structure for every draft page.
 * In ASP.NET terms, this is like:
 * - The code-behind for a Master Page in WebForms
 * - A layout method in MVC that renders the common structure
 *
 * FUNCTION SIGNATURE EXPLANATION:
 * - 'async' = This function can perform asynchronous operations (like async/await in C#)
 * - 'function RootLayout' = The function name (like a method name in C#)
 * - The parameters define what data this layout receives
 *
 * PARAMETERS EXPLAINED:
 * - children: The content of individual pages (like ContentPlaceHolder in WebForms)
 * - params: URL parameters, specifically the locale (language) from the URL
 *
 * TYPESCRIPT TYPES:
 * - React.ReactNode = Any content that can be rendered (like object or string in C#)
 * - Promise<{ locale: string }> = An async result containing locale info
 * - Readonly<> = Immutable type (like const or readonly in C#)
 */
export default async function RootLayout({
  children,  // The actual page content - like ContentPlaceHolder in Master Pages
  params,    // URL parameters - like QueryString or RouteData in ASP.NET
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  // EXTRACT LOCALE FROM URL PARAMETERS
  // In ASP.NET: like getting RouteData.Values["locale"] or Request.Params["locale"]
  // The 'await' is needed because params is a Promise (async operation)
  const { locale } = await params

  // RETURN THE HTML STRUCTURE
  // This JSX code generates the final HTML that will be sent to the browser
  // Think of this like the HTML markup in a Master Page or _Layout.cshtml

  return (
    // HTML ROOT ELEMENT
    // The lang attribute sets the page language for accessibility and SEO
    // In ASP.NET: like setting the Language property on a Page directive
    <html lang={locale}>

      {/* BODY ELEMENT WITH STYLING
          The className attribute is like the 'class' attribute in HTML
          We're applying multiple CSS classes for fonts and styling */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*
        CSS CLASSES EXPLANATION:
        - geistSans.variable: Makes the Geist Sans font available as a CSS variable
        - geistMono.variable: Makes the Geist Mono font available as a CSS variable
        - antialiased: Makes text smoother (Tailwind CSS class)
        - Template literals (${}) allow us to insert variables into strings
        */}

        {/* OPTIMIZELY COMMUNICATION SCRIPT
            This loads JavaScript that allows the CMS to communicate with the preview
            In ASP.NET: like adding a ScriptManager or script reference in Master Page */}
        <Script
          src={`${process.env.NEXT_PUBLIC_CMS_URL}/util/javascript/communicationinjector.js`}
        />
        {/*
        SCRIPT EXPLANATION:
        - process.env.NEXT_PUBLIC_CMS_URL: Environment variable (like appSetting in web.config)
        - This script enables features like inline editing and preview communication
        - Only loaded in draft mode, not on live site
        */}

        {/* DRAFT ACTIONS COMPONENT
            A custom React component that provides draft-specific functionality
            In ASP.NET: like a custom UserControl that handles draft operations */}
        <DraftActions />
        {/*
        This component might contain:
        - Exit draft mode button
        - Save/publish controls
        - Draft status indicators
        - Think of it like admin controls that only appear in draft mode
        */}

        {/* MAIN CONTENT CONTAINER
            This is where the actual page content gets inserted
            In ASP.NET: like a ContentPlaceHolder in a Master Page */}
        <main className="container mx-auto px-4">
          {children}
        </main>
        {/*
        TAILWIND CSS CLASSES EXPLANATION:
        - container: Sets max-width and centers content (like a wrapper div)
        - mx-auto: Margin left/right auto (centers the container horizontally)
        - px-4: Padding left/right 1rem (adds space on sides)

        CHILDREN EXPLANATION:
        - {children} is where individual page content gets inserted
        - Like ContentPlaceHolder.Controls in WebForms
        - Or @RenderBody() in MVC Layout
        */}
      </body>
    </html>
  )
}

/**
 * HOW THIS LAYOUT WORKS - COMPLETE EXPLANATION
 *
 * COMPARISON TO ASP.NET:
 *
 * ASP.NET WebForms Equivalent:
 * <%@ Master Language="C#" %>
 * <html>
 *   <head>
 *     <link rel="stylesheet" type="text/css" href="styles.css" />
 *   </head>
 *   <body>
 *     <div class="container">
 *       <asp:ContentPlaceHolder ID="MainContent" runat="server" />
 *     </div>
 *   </body>
 * </html>
 *
 * ASP.NET MVC Equivalent:
 * <!DOCTYPE html>
 * <html>
 *   <head>
 *     @Styles.Render("~/bundles/css")
 *   </head>
 *   <body>
 *     <div class="container">
 *       @RenderBody()
 *     </div>
 *   </body>
 * </html>
 *
 * HOW THE LAYOUT SYSTEM WORKS:
 *
 * 1. FOLDER STRUCTURE DETERMINES LAYOUT SCOPE
 *    - This layout ONLY affects pages in the (draft) folder
 *    - Like having different Master Pages for different sections
 *    - The regular site has a separate layout in /app/(site)/[locale]/layout.tsx
 *
 * 2. PARAMETER EXTRACTION
 *    - [locale] in the folder name means the URL contains a language code
 *    - URLs like: /en/draft/123/about or /sv/draft/456/contact
 *    - The layout automatically receives this locale value
 *
 * 3. WHEN THIS LAYOUT IS USED
 *    - Only for draft/preview pages (content editor previews)
 *    - Includes special scripts for CMS communication
 *    - Includes draft-specific controls and functionality
 *    - Never shown to regular website visitors
 *
 * 4. FONT LOADING STRATEGY
 *    - Fonts are loaded from Google Fonts CDN
 *    - CSS variables make them available to child components
 *    - Better performance than importing fonts in individual components
 *
 * 5. STYLING APPROACH (TAILWIND CSS)
 *    - Instead of writing separate CSS files, styles are applied as classes
 *    - container mx-auto px-4 = .container { max-width: ...; margin: 0 auto; padding: 0 1rem; }
 *    - Think of it like inline styles but with predefined utility classes
 *
 * 6. COMPONENT COMPOSITION
 *    - DraftActions = Reusable component (like UserControl in WebForms)
 *    - {children} = Content from individual pages gets inserted here
 *    - Script = Next.js component for loading external JavaScript
 *
 * KEY DIFFERENCES FROM ASP.NET:
 *
 * 1. FILE-BASED ROUTING
 *    - No RouteConfig.cs or Global.asax
 *    - Folder structure determines URLs automatically
 *    - [locale] creates dynamic route segments
 *
 * 2. COMPONENT-BASED ARCHITECTURE
 *    - Everything is a reusable component (function)
 *    - No code-behind files (.aspx.cs)
 *    - Logic and markup combined in same file
 *
 * 3. BUILD-TIME OPTIMIZATION
 *    - Fonts and CSS are optimized at build time
 *    - No runtime bundling like ASP.NET bundling
 *    - Better performance and smaller bundle sizes
 *
 * 4. ENVIRONMENT VARIABLES
 *    - Instead of web.config appSettings
 *    - process.env.VARIABLE_NAME access
 *    - Configured in .env files
 *
 * DEBUGGING TIPS:
 *
 * 1. If the layout isn't applying, check the folder structure
 * 2. If fonts aren't loading, check the Google Fonts configuration
 * 3. If draft actions aren't working, check the DraftActions component
 * 4. If styles look wrong, check the Tailwind CSS classes
 * 5. Use browser dev tools to inspect the generated HTML
 */
