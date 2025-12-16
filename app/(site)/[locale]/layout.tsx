
// Import the Geist and Geist_Mono font loaders from Next.js's Google Fonts integration.
// These allow you to use custom web fonts in your app.
import { Geist, Geist_Mono } from 'next/font/google'

// Import the global CSS file for the app. This applies base styles and Tailwind CSS utilities.
import '@/app/globals.css'

// Import the list of supported locales for the site.
import { LOCALES } from '@/lib/optimizely/utils/language'

// Import the Header and Footer layout components.
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// Load the Geist Sans font and assign it to a CSS variable for use in the app.
const geistSans = Geist({
  variable: '--font-geist-sans', // The CSS variable name for the font
  subsets: ['latin'],            // Only load the Latin character set
})

// Load the Geist Mono font and assign it to a CSS variable.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// This function tells Next.js to statically generate pages for each supported locale.
export function generateStaticParams() {
  try {
    // Map each locale to an object with a 'locale' property (used for dynamic routing).
    return LOCALES.map((locale) => ({ locale }))
  } catch (e) {
    // If there's an error, log it and return an empty array.
    console.error(e)
    return []
  }
}

// The main layout component for all pages under /[locale].
// This wraps every page with the same header, footer, and font settings.
export default async function RootLayout({
  children, // The page content to render inside the layout
  params,   // The route parameters, including the locale
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  // Extract the locale from the route parameters (e.g., 'en', 'pl', 'sv').
  const { locale } = await params
  return (
    // The <html> element sets the language attribute for accessibility and SEO.
    <html lang={locale}>
      <body
        // Apply the loaded font variables and enable font smoothing (antialiased).
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Render the site header, passing the locale for language-specific navigation. */}
        <Header locale={locale} />
        {/* Render the main content area. */}
        {/* 'container' centers the content, 'mx-auto' centers horizontally, 'min-h-screen' ensures full viewport height, 'px-4' adds horizontal padding. */}
        <main className="container mx-auto min-h-screen px-4">{children}</main>
        {/* Render the site footer, passing the locale. */}
        <Footer locale={locale} />
      </body>
    </html>
  )
}
