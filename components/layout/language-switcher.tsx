/**
 * =====================================================================================
 * LANGUAGE SWITCHER COMPONENT
 * =====================================================================================
 * 
 * This component provides a dropdown interface for users to switch between different
 * languages/locales on the website. It handles URL routing and locale management
 * for internationalization.
 * 
 * FUNCTIONALITY:
 * - Displays a globe icon button that opens a dropdown menu
 * - Shows available languages (English, Polish, Swedish)
 * - Handles URL transformation when switching languages
 * - Maintains current page context across language changes
 * 
 * TECHNICAL IMPLEMENTATION:
 * - React component using TypeScript for type safety
 * - Client-side navigation using Next.js router
 * - Responsive dropdown UI with accessibility features
 * =====================================================================================
 */

// Next.js directive: indicates this component requires client-side JavaScript
// Components marked with 'use client' run in the browser rather than server-side
'use client'

// Next.js navigation hooks for routing functionality
// usePathname: retrieves current URL path
// useRouter: provides programmatic navigation capabilities
import { usePathname, useRouter } from 'next/navigation'

// UI components for dropdown functionality
// These are pre-built, accessible dropdown components from the UI library
import {
  DropdownMenu,        // Main dropdown container component
  DropdownMenuContent, // Container for dropdown menu items
  DropdownMenuItem,    // Individual selectable menu item
  DropdownMenuTrigger, // Element that triggers dropdown open/close
} from '@/components/ui/dropdown-menu'

// Globe icon from Lucide React icon library
import { Globe } from 'lucide-react'

// Application constant containing supported locale codes
import { LOCALES } from '@/lib/optimizely/utils/language'

// Reusable button component from UI library
import { Button } from '../ui/button'

// Mapping object for locale codes to human-readable language names
// TypeScript Record<string, string> type ensures type safety for key-value pairs
// This provides localized display names for each supported language
const LOCALE_NAMES: Record<string, string> = {
  en: 'English',  // English locale display name
  pl: 'Polski',   // Polish locale display name (native language)
  sv: 'Svenska',  // Swedish locale display name (native language)
}

// Main component function with TypeScript props typing
// Destructures currentLocale from props object for cleaner parameter access
export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  
  // React hooks for navigation functionality
  // pathname: current URL path string (e.g., "/en/about")
  const pathname = usePathname()
  
  // router: Next.js navigation object with push/refresh methods
  const router = useRouter()

  // Event handler for locale selection
  // Transforms current URL to use the newly selected locale
  const handleLocaleChange = (newLocale: string) => {
    // Capture current path for manipulation
    const currentPath = pathname

    // URL transformation logic using conditional (ternary) operator
    // Checks if current path contains the active locale and replaces accordingly
    const newPath = currentPath.includes(`/${currentLocale}`)
      ? currentPath.replace(`/${currentLocale}`, `/${newLocale}`)  // Replace existing locale
      : `/${newLocale}/${currentPath}`  // Prepend locale if not present

    // Navigate to new URL with updated locale
    router.push(newPath)
    
    // Refresh page to ensure all content updates for new locale
    router.refresh()
  }

  // JSX return statement: defines the component's rendered output
  // Uses declarative syntax to describe UI structure and behavior
  // 
  // STRUCTURE OVERVIEW:
  // - DropdownMenu: Root container for dropdown functionality
  // - DropdownMenuTrigger: Button that opens/closes the dropdown (with asChild prop)
  // - Button: Globe icon button with ghost styling and icon sizing
  // - DropdownMenuContent: Container for language menu items
  // - DropdownMenuItem: Individual language selection items (dynamically generated)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            className={loc === currentLocale ? 'bg-accent' : ''}
            onClick={() => handleLocaleChange(loc)}
          >
            {LOCALE_NAMES[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/*
 * COMPONENT BEHAVIOR SUMMARY:
 * 
 * 1. Renders globe icon button in UI
 * 2. On click, displays dropdown with language options
 * 3. User selects desired language from dropdown
 * 4. handleLocaleChange updates URL with new locale
 * 5. Page refreshes with content in selected language
 * 6. Current language is visually highlighted in menu
 * 
 * TECHNICAL NOTES:
 * - Uses React hooks for state management and navigation
 * - Implements accessibility best practices with screen reader support
 * - Leverages Tailwind CSS for responsive styling
 * - Type-safe with TypeScript for development reliability
 */
