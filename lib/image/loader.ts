
/**
 * =====================================================================================
 * MULTI-SOURCE IMAGE LOADER FOR NEXT.JS
 * =====================================================================================
 *
 * This file provides comprehensive image optimization functionality for multiple image sources:
 * - Cloudinary CDN (Content Delivery Network) with advanced transformations
 * - Optimizely SaaS CMS media assets with Next.js built-in optimization
 * - Fallback handling for other image sources
 *
 * PURPOSE:
 * - Integrates with Next.js Image component for automatic image optimization
 * - Provides source-specific optimization strategies for best performance
 * - Handles Cloudinary transformations and Optimizely SaaS image delivery
 * - Ensures optimal image delivery regardless of source
 *
 * SUPPORTED IMAGE SOURCES:
 * 1. CLOUDINARY: Advanced CDN with transformation API
 * 2. OPTIMIZELY SAAS: CMS media assets optimized through Next.js
 * 3. OTHER SOURCES: Fallback to Next.js default behavior
 *
 * KEY CONCEPTS:
 * - CDN: Content Delivery Network - servers worldwide that cache and serve images quickly
 * - Image optimization: automatically adjusting format, size, and quality for best performance
 * - Public ID: Cloudinary's unique identifier for each uploaded image
 * - Transformations: URL parameters that modify how images are delivered
 * - Remote patterns: Next.js configuration for allowed external image domains
 *
 * TECHNICAL IMPLEMENTATION:
 * - TypeScript for type safety and better development experience
 * - Regular expressions for URL parsing and pattern matching
 * - ES6 modules with import/export syntax
 * - Next.js Image loader interface compatibility
 * - Multi-source detection and routing logic
 * =====================================================================================
 */

// Next.js directive: indicates this code runs in the browser (client-side) rather than server-side
// This is important because image loading happens when users interact with the page
'use client'

// Regular Expression (RegEx) for parsing Cloudinary URLs
// RegEx is a pattern matching language for finding and extracting parts of text strings
// This pattern breaks down a Cloudinary URL into its component parts
//
// URL STRUCTURE EXAMPLE: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
// Breaking down the pattern:
//   ^.+\.cloudinary\.com/ - matches "https://res.cloudinary.com/"
//   ([^/]+) - captures cloud name (e.g., "demo")
//   (image|video|raw) - captures resource type (usually "image")
//   (upload|fetch|private...) - captures delivery type (usually "upload")
//   v(\d+|\w{1,2}) - captures version number (e.g., "v1234")
//   ([^.^\s]+) - captures public ID/filename (e.g., "sample")
//   \.(.+) - captures file extension (e.g., "jpg")
const CLOUDINARY_REGEX =
  /^.+\.cloudinary\.com\/([^/]+)\/(?:(image|video|raw)\/)?(?:(upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/)?(?:(?:[^/]+\/[^,/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^.^\s]+)(?:\.(.+))?$/


// FUNCTION: Extract Public ID from Cloudinary URL
//
// PUBLIC ID EXPLANATION:
// In Cloudinary, every uploaded image has a unique identifier called a "public ID"
// This is like a filename that Cloudinary uses to locate and serve the image
// Example: from "https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg"
// The public ID would be "sample.jpg"
//
// FUNCTION SIGNATURE BREAKDOWN:
// - 'export' makes this function available for other files to import and use
// - 'const' declares a constant that cannot be reassigned
// - (link: string): string => TypeScript syntax meaning:
//   * Parameter 'link' must be a string
//   * Function returns a string
//   * Arrow function syntax (=>) is a shorter way to write functions
export const extractCloudinaryPublicID = (link: string): string => {

  // GUARD CLAUSE: Check if input is valid
  // The exclamation mark (!) means "not" - so this checks if link is falsy
  // Falsy values in JavaScript: null, undefined, empty string "", 0, false
  if (!link) {
    return '' // Return empty string if no link provided
  }

  // REGULAR EXPRESSION EXECUTION
  // .exec() method runs the regex pattern against the input string
  // Returns an array of matched groups, or null if no match found
  // 'parts' will contain the extracted URL components if successful
  const parts = CLOUDINARY_REGEX.exec(link)

  // CONDITIONAL LOGIC: Check if regex found matches
  // parts && parts.length > 2 uses logical AND (&&) operator
  // This means: "if parts exists AND parts has more than 2 elements"
  if (parts && parts.length > 2) {

    // ARRAY ACCESS: Extract components from regex results
    // parts.length - 2 gets the second-to-last element (public ID without extension)
    // parts.length - 1 gets the last element (file extension)
    const path = parts[parts.length - 2]      // Example: "sample"
    const extension = parts[parts.length - 1] // Example: "jpg"

    // TEMPLATE LITERAL: Combine path and extension
    // ${} syntax allows embedding JavaScript expressions in strings
    // Ternary operator (condition ? valueIfTrue : valueIfFalse) handles optional extension
    return `${path}${extension ? '.' + extension : ''}`  // Result: "sample.jpg"
  }

  // FALLBACK: If regex parsing failed, return original input
  return link
}


// FUNCTION: Extract Cloud Name from Cloudinary URL
//
// CLOUD NAME EXPLANATION:
// Cloudinary organizes accounts by "cloud name" - this is like a account identifier
// Every Cloudinary account has a unique cloud name used in URLs
// Example: in "https://res.cloudinary.com/demo/image/upload/sample.jpg"
// The cloud name is "demo"
//
// FUNCTION VISIBILITY:
// No 'export' keyword means this is a private function, only usable within this file
// This follows the principle of encapsulation - keeping internal helper functions private
const extractCloudName = (link: string): string => {

  // GUARD CLAUSE: Validate input parameter
  // Same pattern as previous function - check for falsy values
  if (!link) {
    return '' // Return empty string for invalid input
  }

  // REGEX PARSING: Extract URL components
  // Reusing the same regex pattern to break down the Cloudinary URL
  const parts = CLOUDINARY_REGEX.exec(link)

  // COMPLEX CONDITIONAL WITH MULTIPLE CHECKS:
  // This uses chained logical operators for safety:
  // 1. parts - check if regex found matches
  // 2. parts.length > 2 - check if enough capture groups exist
  // 3. parts[1] - check if the cloud name capture group has a value
  //
  // TERNARY OPERATOR: condition ? valueIfTrue : valueIfFalse
  // If all conditions pass, return parts[1] (the cloud name)
  // Otherwise, return the original link as fallback
  return parts && parts.length > 2 && parts[1] ? parts[1] : link
}


// FUNCTION: Generate Cloudinary Transformation Parameters
//
// TRANSFORMATION PARAMETERS EXPLANATION:
// Cloudinary allows modifying images through URL parameters
// These parameters tell Cloudinary how to optimize the image before serving it
// Examples: resize width, adjust quality, change format (JPEG to WebP)
//
// PARAMETER MEANINGS:
// - f_auto: automatically choose best format (WebP, AVIF, etc.)
// - c_limit: crop/resize mode that limits size without distortion
// - w_500: set width to 500 pixels
// - q_80: set quality to 80% (balance between file size and visual quality)
//
// FUNCTION PARAMETERS:
// - path: the image filename/path to check file type
// - width: desired pixel width for the image
// - quality?: optional quality setting (? means optional in TypeScript)
const getParams = (path: string, width: number, quality?: number) => {

  // CONDITIONAL PARAMETER GENERATION
  // Uses ternary operator to decide whether to apply transformations
  //
  // SVG CHECK EXPLANATION:
  // SVG (Scalable Vector Graphics) files are mathematical descriptions of images
  // They scale perfectly without quality loss, so don't need width/quality transformations
  // .toLowerCase() converts text to lowercase for reliable comparison
  // .endsWith('.svg') checks if filename ends with ".svg"
  const params = path.toLowerCase().endsWith('.svg')
    ? []  // Empty array: no transformations for SVG files
    : [`f_auto`, `c_limit`, `w_${width || 'auto'}`, `q_${quality || 'auto'}`]  // Transformation array for other formats

  // TEMPLATE LITERAL BREAKDOWN in the array above:
  // `w_${width || 'auto'}` uses:
  // - Template literal syntax with ${} for variable insertion
  // - Logical OR operator (||) for fallback values
  // - If width exists, use it; otherwise use 'auto'
  // - Result examples: "w_500" or "w_auto"

  // PARAMETER STRING CONSTRUCTION
  // Convert the parameters array into a URL-compatible string
  if (params.length) {
    // ARRAY METHOD: .join(',') combines array elements with commas
    // Template literal wraps with forward slashes for URL structure
    // Example result: "/f_auto,c_limit,w_500,q_80/"
    return `/${params.join(',')}/`
  } else {
    // For SVG files or when no parameters needed, just return a single slash
    return '/'
  }
}


// CONSTANT: Parameter Detection Patterns
//
// PURPOSE: Detect if a URL already has Cloudinary transformations applied
// This prevents double-processing URLs that are already optimized
//
// ARRAY LITERAL: ['f_', 'c_'] contains common transformation prefixes
// - 'f_' indicates format transformations (f_auto, f_webp, etc.)
// - 'c_' indicates crop/resize transformations (c_limit, c_fill, etc.)
const paramFormats = ['f_', 'c_']

// MAIN EXPORT FUNCTION: Multi-Source Image Loader for Next.js
//
// NEXT.JS IMAGE COMPONENT INTEGRATION:
// Next.js Image component can use custom loaders to optimize images from various sources
// This function follows Next.js loader interface requirements
// It intelligently routes images to appropriate optimization strategies based on source
//
// FUNCTION SIGNATURE EXPLANATION:
// - 'export default' means this is the main function other files import
// - Destructuring parameters: { src, width, quality } extracts properties from an object
// - TypeScript object type annotation defines the expected parameter structure
// - quality?: number means quality is optional (may be undefined)
export default function cloudinaryLoader({
  src,      // String: original image URL to be optimized
  width,    // Number: target width in pixels for the optimized image
  quality,  // Number (optional): image quality percentage (1-100)
}: {
  src: string
  width: number
  quality?: number
}) {

  // PRIMARY CONDITION: Check if this is a Cloudinary URL
  // .startsWith() method checks if string begins with specified text
  // Only Cloudinary URLs can be optimized by this loader
  if (src.startsWith('https://res.cloudinary.com')) {

    // OPTIMIZATION CHECK: Prevent double-processing
    // .some() method tests if at least one array element passes a condition
    // (f) => src.includes(f) is an arrow function that checks if URL contains the prefix
    // If URL already has transformations, return it unchanged
    if (paramFormats.some((f) => src.includes(f))) {
      return src
    }

    // DATA EXTRACTION: Get public ID from the original URL
    // Uses the helper function defined earlier in this file
    const publicId = extractCloudinaryPublicID(src)

    // ERROR HANDLING: Validate extraction success
    // If public ID extraction failed, fall back to original URL
    if (!publicId) {
      return src
    }

    // DATA EXTRACTION: Get cloud name (account identifier)
    const cloudName = extractCloudName(src)

    // PARAMETER GENERATION: Create transformation string
    // Uses the helper function to build optimization parameters
    const params = getParams(publicId, width, quality)

    // URL CONSTRUCTION: Build optimized Cloudinary URL
    // Template literal combines all components into proper URL structure
    // Final format: https://res.cloudinary.com/{cloud}/{resource_type}/upload{transformations}{public_id}
    // Example: https://res.cloudinary.com/demo/image/upload/f_auto,c_limit,w_500,q_80/sample.jpg
    return `https://res.cloudinary.com/${cloudName}/image/upload${params}${publicId}`
  }

  // OPTIMIZELY SAAS IMAGE HANDLING
  // Check if this is an Optimizely media asset URL
  //
  // OPTIMIZELY SAAS URL PATTERNS:
  // Optimizely SaaS uses various CDN domains for serving media assets:
  // - *.optimizely.com (configured in next.config.ts)
  // - *.optimizelycdn.com (common for SaaS instances)
  // - *.episerver.com (legacy domain pattern)
  // - *.episerver.net (some SaaS configurations)
  // - cmscloud.episerver.net (older SaaS instances)
  //
  // NOTE: You may need to add additional domains to next.config.ts remotePatterns
  // depending on your specific Optimizely SaaS instance configuration
  if (src.includes('optimizely.com') ||
      src.includes('optimizelycdn.com') ||
      src.includes('episerver.com') ||
      src.includes('episerver.net') ||
      src.includes('cmscloud.episerver.net')) {

    // NEXT.JS BUILT-IN OPTIMIZATION for Optimizely SaaS Images
    //
    // IMPORTANT CONFIGURATION REQUIREMENT:
    // The image domain must be configured in next.config.ts remotePatterns
    // Current configuration only includes "*.optimizely.com"
    //
    // TO ADD SUPPORT FOR YOUR OPTIMIZELY SAAS INSTANCE:
    // You may need to add your specific domain to next.config.ts remotePatterns, for example:
    // {
    //   protocol: 'https',
    //   hostname: '*.optimizelycdn.com',
    //   pathname: '/**',
    // }
    //
    // QUERY PARAMETER CONSTRUCTION:
    // Next.js expects specific query parameters for optimization:
    // - url: the original image URL (URL-encoded)
    // - w: width in pixels
    // - q: quality (1-100, default 75)
    //
    // URL ENCODING: encodeURIComponent() safely encodes the URL for use in query parameters
    // This prevents issues with special characters in the original URL
    const encodedSrc = encodeURIComponent(src)

    // BUILD NEXT.JS OPTIMIZER URL:
    // Next.js serves optimized images through /_next/image endpoint
    // Template literal constructs the optimization URL with parameters
    // Example result: /_next/image?url=https%3A%2F%2Fcms.optimizely.com%2Fimage.jpg&w=500&q=75
    return `/_next/image?url=${encodedSrc}&w=${width}&q=${quality || 75}`
  }

  // FALLBACK: For other image sources (non-Cloudinary, non-Optimizely)
  // Return original URL unchanged for Next.js default optimization behavior
  // This includes:
  // - Local static images (public folder)
  // - Other CDNs not specifically handled
  // - Third-party image services
  // - Any other image sources not explicitly supported
  return src
}

/*
* COMPREHENSIVE WORKFLOW SUMMARY:
 *
 * 1. INITIALIZATION: Next.js Image component calls this loader with image source, width, and quality
 *
 * 2. SOURCE DETECTION & ROUTING: Function analyzes the image URL to determine optimization strategy
 *
 * 3. CLOUDINARY OPTIMIZATION PATH: (for res.cloudinary.com URLs)
 *    a. Check if URL already contains transformations (prevent double-processing)
 *    b. Extract cloud name and public ID using regex parsing
 *    c. Generate Cloudinary-specific transformation parameters (f_auto, c_limit, w_, q_)
 *    d. Construct optimized Cloudinary URL with embedded transformations
 *    e. Return URL for direct Cloudinary CDN delivery
 *
 * 4. OPTIMIZELY SAAS OPTIMIZATION PATH: (for Optimizely domains)
 *    a. Detect Optimizely SaaS domains (optimizely.com, optimizelycdn.com, episerver.*)
 *    b. URL-encode the original source for safe parameter passing
 *    c. Construct Next.js optimizer URL (/_next/image?url=...&w=...&q=...)
 *    d. Next.js handles format conversion, resizing, and quality optimization
 *    e. Return optimized URL served through Next.js image optimization pipeline
 *
 * 5. FALLBACK PATH: (for all other image sources)
 *    a. Return original URL unchanged
 *    b. Allow Next.js default image handling to process
 *    c. Covers local images, other CDNs, and unrecognized sources
 *
 * OPTIMIZATION BENEFITS:
 *
 * CLOUDINARY IMAGES:
 * - Automatic format optimization (WebP, AVIF when supported)
 * - Advanced transformations and effects
 * - Global CDN delivery for fastest loading
 * - Intelligent quality compression
 *
 * OPTIMIZELY SAAS IMAGES:
 * - Next.js built-in optimization (format conversion, resizing)
 * - Automatic WebP/AVIF generation for supported browsers
 * - Quality adjustment and compression
 * - Caching and performance optimization
 * - REQUIRES: Proper domain configuration in next.config.ts
 *
* UNIVERSAL BENEFITS:
 * - Intelligent source detection and optimization routing
 * - Responsive image sizing based on component requirements
 * - Reduced bandwidth usage through format and quality optimization
 * - Better user experience with faster-loading, optimized images
 * - Improved page loading times across all image sources
 * - SEO benefits from enhanced Core Web Vitals scores
 * - Consistent optimization strategy regardless of image source
 * - Future-proof architecture supporting multiple CDN/CMS platforms
 *
 * OPTIMIZELY SAAS CONFIGURATION NOTES:
 *
 * STEP 1: IDENTIFY YOUR IMAGE DOMAINS
 * Check your Optimizely SaaS admin panel or inspect image URLs to identify the domains used.
 * Common patterns include:
 * - [tenant].optimizely.com
 * - [tenant].optimizelycdn.com
 * - [tenant].episerver.com
 * - cmscloud.episerver.net
 *
 * STEP 2: UPDATE NEXT.CONFIG.TS
 * Add your specific domains to the remotePatterns array:
 *
 * remotePatterns: [
 *   {
 *     protocol: 'https',
 *     hostname: 'your-tenant.optimizelycdn.com', // Replace with your actual domain
 *     pathname: '/**',
 *   },
 *   // Add additional patterns as needed
 * ]
 *
 * STEP 3: TEST IMAGE OPTIMIZATION
 * After configuration, test with a sample image URL to ensure optimization works.
 * You should see the image served through /_next/image endpoint with proper formatting.
 */
