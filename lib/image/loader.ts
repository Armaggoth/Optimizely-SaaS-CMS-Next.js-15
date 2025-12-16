
// This file provides utility functions for working with Cloudinary image URLs in a Next.js project.
// It includes functions to extract information from Cloudinary URLs and to generate optimized image URLs for use with Next.js image components.

'use client' // This directive tells Next.js that this file should be run on the client side (browser), not the server.


// Regular expression to match and extract parts of a Cloudinary URL.
// This regex captures the cloud name, resource type, delivery type, version, public ID, and file extension.
const CLOUDINARY_REGEX =
  /^.+\.cloudinary\.com\/([^/]+)\/(?:(image|video|raw)\/)?(?:(upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/)?(?:(?:[^/]+\/[^,/]+,?)*\/)?(?:v(\d+|\w{1,2})\/)?([^.^\s]+)(?:\.(.+))?$/


// Extracts the public ID (unique identifier) of an image from a Cloudinary URL.
// For example, from 'https://res.cloudinary.com/demo/image/upload/v1234/myimage.jpg', it extracts 'myimage.jpg'.
export const extractCloudinaryPublicID = (link: string): string => {
  if (!link) {
    return '' // If the link is empty or undefined, return an empty string.
  }

  const parts = CLOUDINARY_REGEX.exec(link) // Use the regex to parse the link.

  if (parts && parts.length > 2) {
    const path = parts[parts.length - 2] // The public ID (file name without extension)
    const extension = parts[parts.length - 1] // The file extension (e.g., 'jpg')
    return `${path}${extension ? '.' + extension : ''}` // Combine them to get the full public ID.
  }

  return link // If parsing fails, return the original link.
}


// Extracts the cloud name (the account name) from a Cloudinary URL.
// For example, from 'https://res.cloudinary.com/demo/image/upload/...' it extracts 'demo'.
const extractCloudName = (link: string): string => {
  if (!link) {
    return '' // If the link is empty, return an empty string.
  }

  const parts = CLOUDINARY_REGEX.exec(link) // Parse the link with the regex.

  return parts && parts.length > 2 && parts[1] ? parts[1] : link // Return the cloud name or the original link if not found.
}


// Generates Cloudinary transformation parameters for the image URL.
// These parameters control format, size, and quality for optimized delivery.
const getParams = (path: string, width: number, quality?: number) => {
  // If the image is an SVG, don't apply transformations (SVGs are vector and don't need resizing/quality changes).
  const params = path.toLowerCase().endsWith('.svg')
    ? []
    : [`f_auto`, `c_limit`, `w_${width || 'auto'}`, `q_${quality || 'auto'}`]

  // If there are parameters, join them with commas and wrap with slashes for the URL.
  if (params.length) {
    return `/${params.join(',')}/`
  } else {
    return '/'
  }
}


// List of parameter prefixes to check if the URL already contains Cloudinary transformation parameters.
const paramFormats = ['f_', 'c_']


// The main loader function for Next.js Image component.
// It generates an optimized Cloudinary URL for the given image source, width, and quality.
export default function cloudinaryLoader({
  src,      // The original image URL
  width,    // The desired width for the image
  quality,  // The desired quality (optional)
}: {
  src: string
  width: number
  quality?: number
}) {
  // If the source is a Cloudinary URL...
  if (src.startsWith('https://res.cloudinary.com')) {
    // ...and it already contains transformation parameters, return it as-is.
    if (paramFormats.some((f) => src.includes(f))) {
      return src
    }

    // Otherwise, extract the public ID (file name) from the URL.
    const publicId = extractCloudinaryPublicID(src)

    // If no public ID could be extracted, return the original URL.
    if (!publicId) {
      return src
    }

    // Extract the cloud name (account name) from the URL.
    const cloudName = extractCloudName(src)
    // Generate the transformation parameters for width/quality.
    const params = getParams(publicId, width, quality)

    // Build and return the optimized Cloudinary URL.
    return `https://res.cloudinary.com/${cloudName}/image/upload${params}${publicId}`
  }

  // If the source is not a Cloudinary URL, return it unchanged.
  return src
}
