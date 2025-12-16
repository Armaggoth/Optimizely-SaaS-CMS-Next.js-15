// =====================================================================================
// Optimizely Nested Block Handling Utilities
// =====================================================================================
//
// Optimizely returns all possible block types for a content area, even if only one type is allowed.
// This means you receive a union of all block types, each identified by a unique '__typename' property.
//
// To safely work with nested blocks (for example, when rendering a content area that can contain many block types),
// you need to:
//   1. Check the '__typename' of each block.
//   2. Extract or cast the block to the correct type before using its specific properties.
//
// The utilities in this file help you do that:
//   - SafeContent: Ensures every content object has an optional '__typename'.
//   - ExtractContent: Lets you extract a specific block type from the union of all possible types, based on '__typename'.
//   - castContent: Checks if a content object is of a specific type (by comparing '__typename') and safely casts it to that type, or returns null if it doesn't match.
//
// This approach is necessary because Optimizely's API is very flexible and always returns all possible types,
// so you need to filter and cast to the correct one when rendering or processing nested blocks.
// =====================================================================================
// Import only the type definition '_IContent' from the specified file path.
// 'import type' is a TypeScript feature that only brings in type information, not actual code.
import type { _IContent } from '@/lib/optimizely/types/generated'

// SafeContent type:
// Used to represent any Optimizely content block, ensuring it has an optional '__typename'.
// This is important for type-checking and filtering blocks by their type.
// The '&' symbol means 'combine these types together'.
// This type has an optional property '__typename' (the '?' means it is not required),
// and all the properties from '_IContent'.
export type SafeContent = {
  __typename?: string // Optional property to store the type name as a string
} & _IContent // Combine with all properties from _IContent

// ExtractContent utility type:
// Lets you extract a specific block type from the union of all possible Optimizely block types.
// This is useful when you know the '__typename' you want and need to get the exact type for it.
// 'T extends { __typename: string }' means T must be an object with a string property '__typename'.
// 'Extract<A, B>' is a built-in TypeScript utility that gets all types from A that are assignable to B.
// Here, it gets all types from '_IContent' that have a '__typename' matching T['__typename'].
export type ExtractContent<T extends { __typename: string }> = Extract<
  _IContent, // The union type to extract from
  { __typename?: T['__typename'] } // The type to match (with optional __typename)
>

// castContent helper function:
// Checks if a content block is of a specific type (by comparing its '__typename').
// If it matches, safely casts the block to that type; otherwise, returns null.
//
// This is especially useful when rendering nested blocks, so you only process the block if it is the expected type.
//
// <T extends { __typename?: string }>: This means the function is 'generic' and works for any type T that has an optional '__typename' property.
// 'content' can be a SafeContent object, or null, or undefined.
// 'typename' is the type name you want to check for.
// The function returns either the object as type T, or null if it doesn't match.
export function castContent<T extends { __typename?: string }>(
  content: SafeContent | null | undefined, // The object to check and cast
  typename: T['__typename'] // The type name to check against
): T | null { // Returns T if matched, otherwise null
  // Check if 'content' exists and its '__typename' matches the given 'typename'.
  if (content && content?.__typename === typename) {
    // If it matches, cast 'content' to type T and return it.
    // 'as unknown as T' is a double cast: first to 'unknown' (a type-safe placeholder), then to T.
    return content as unknown as T
  }
  // If it doesn't match, return null.
  return null
}
