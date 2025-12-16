
// This file provides general utility functions for URL handling and CSS class merging in a Next.js project.

// Import ReadonlyURLSearchParams from Next.js navigation utilities.
// This is a type-safe way to handle URL query parameters in Next.js apps.
import { ReadonlyURLSearchParams } from 'next/navigation'

// Import the type ClassValue and the clsx function from the 'clsx' library.
// clsx is used to conditionally join CSS class names together.
import { type ClassValue, clsx } from 'clsx'

// Import twMerge from 'tailwind-merge', which intelligently merges Tailwind CSS class names to avoid conflicts.
import { twMerge } from 'tailwind-merge'

// Creates a URL string by combining a pathname and query parameters.
// Example: createUrl('/about', new URLSearchParams({ foo: 'bar' })) returns '/about?foo=bar'
export const createUrl = (
  pathname: string, // The base path of the URL (e.g., '/about')
  params: URLSearchParams | ReadonlyURLSearchParams // The query parameters
) => {
  // Convert the params object to a query string (e.g., 'foo=bar&baz=qux')
  const paramsString = params.toString()
  // If there are any params, prefix with '?', otherwise use an empty string.
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`

  // Return the full URL by concatenating the pathname and query string.
  return `${pathname}${queryString}`
}

// Ensures that a URL path starts with a leading slash ('/').
// Example: 'about' becomes '/about', '/contact' stays '/contact'.
export const leadingSlashUrlPath = (pathname: string) => {
  // If pathname already starts with '/', return as is; otherwise, add '/'.
  return `${pathname.startsWith('/') ? '' : '/'}${pathname}`
}

// Combines and merges CSS class names, especially for Tailwind CSS.
// Accepts any number of class name values (strings, arrays, objects, etc.).
// Uses clsx to join them, then twMerge to resolve Tailwind conflicts.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
