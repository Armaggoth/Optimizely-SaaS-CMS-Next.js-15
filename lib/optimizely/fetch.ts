
// Import the DocumentNode type from the 'graphql' library. This represents a parsed GraphQL query or mutation.
import { DocumentNode } from 'graphql'

// Import the 'print' function, which converts a DocumentNode (AST) into a string for sending over HTTP.
import { print } from 'graphql/language/printer'

// Import the getSdk function, which generates typed GraphQL client methods based on your schema.
import { getSdk } from './types/generated'

// Import a type guard function to check if an error is a Vercel platform error.
import { isVercelError } from '../type-guards'


// Define an interface (like a C# interface) for optional fetch options.
interface OptimizelyFetchOptions {
  // Optional HTTP headers to include in the request. Record<string, string> is like Dictionary<string, string> in C#.
  headers?: Record<string, string>
  // Optional cache mode for the request (e.g., 'force-cache', 'no-store').
  cache?: RequestCache
  // If true, enables preview mode (used for draft content).
  preview?: boolean
  // Optional tag for cache invalidation or grouping.
  cacheTag?: string
}


// Interface for the main fetch input, extending the options above.
interface OptimizelyFetch<Variables> extends OptimizelyFetchOptions {
  // The GraphQL query as a string.
  query: string
  // Optional variables for the GraphQL query.
  variables?: Variables
}


// Interface for the expected GraphQL response structure.
interface GraphqlResponse<Response> {
  // Array of errors (if any) returned by the GraphQL API.
  errors: unknown[]
  // The actual data returned by the API, typed as Response.
  data: Response
}


/**
 * Main function to perform a GraphQL fetch to the Optimizely API.
 *
 * @template Response - The expected shape of the data returned.
 * @template Variables - The shape of the variables object (default: object).
 * @param {OptimizelyFetch<Variables>} params - The fetch parameters.
 * @returns {Promise<GraphqlResponse<Response> & { headers: Headers }>} - The GraphQL response and headers.
 */
const optimizelyFetch = async <Response, Variables = object>({
  query, // The GraphQL query string
  variables, // The variables for the query
  headers, // Optional HTTP headers
  cache = 'force-cache', // Default cache mode
  preview, // Preview mode flag
  cacheTag, // Optional cache tag
}: OptimizelyFetch<Variables>): Promise<
  GraphqlResponse<Response> & { headers: Headers }
> => {
  // Use provided headers or an empty object if undefined (?? is the nullish coalescing operator, like C#'s ??)
  const configHeaders = headers ?? {}

  // If preview mode is enabled, add an Authorization header and disable caching
  if (preview) {
    configHeaders.Authorization = `Basic ${process.env.OPTIMIZELY_PREVIEW_SECRET}`
    cache = 'no-store'
  }

  // Set up cache tags for Next.js cache invalidation
  const cacheTags = ['optimizely-content']
  if (cacheTag) {
    cacheTags.push(cacheTag)
  }

  try {
    // Build the API endpoint using environment variables (process.env is like Environment.GetEnvironmentVariable in C#)
    const endpoint = `${process.env.OPTIMIZELY_API_URL}?auth=${process.env.OPTIMIZELY_SINGLE_KEY}`

    // Perform the HTTP POST request using fetch (native in JS, like HttpClient in C#)
    const response = await fetch(endpoint, {
      method: 'POST', // HTTP method
      headers: {
        Accept: 'application/json', // Accept JSON responses
        'Content-Type': 'application/json', // Send JSON body
        ...configHeaders, // Spread operator merges in any custom headers
      },
      body: JSON.stringify({
        ...(query && { query }), // If query exists, add it to the body
        ...(variables && { variables }), // If variables exist, add them
      }),
      cache, // Cache mode
      next: { tags: cacheTags }, // Next.js cache tags for ISR/SSG
    })

    // Parse the JSON response body
    const result = await response.json()

    // Return the result, plus the response headers
    return {
      ...result,
      headers: response.headers,
    }
  } catch (e) {
    // If the error is a Vercel platform error, throw a custom error object
    if (isVercelError(e)) {
      throw {
        status: e.status || 500, // Use error status or default to 500
        message: e.message, // Error message
        query, // The query that caused the error
      }
    }

    // For all other errors, throw a generic error object
    throw {
      error: e,
      query,
    }
  }
}


/**
 * Helper function to send a GraphQL request using a DocumentNode (AST) and variables.
 *
 * @template R - The expected response data type.
 * @template V - The variables type.
 * @param {DocumentNode} doc - The parsed GraphQL query/mutation.
 * @param {V} [vars] - The variables for the query.
 * @param {OptimizelyFetchOptions} [options] - Additional fetch options.
 * @returns {Promise<{ data: R; _headers: Headers }>} - The data and headers.
 */
async function requester<R, V>(
  doc: DocumentNode, // The GraphQL query/mutation as a DocumentNode (AST)
  vars?: V, // Optional variables for the query
  options?: OptimizelyFetchOptions // Optional fetch options
) {
  // Call optimizelyFetch, converting the DocumentNode to a string with print()
  const request = await optimizelyFetch<R>({
    query: print(doc), // Convert AST to string
    variables: vars ?? {}, // Use provided variables or an empty object
    ...options, // Spread in any additional options
  })

  // Return the data and headers
  return {
    data: request.data,
    _headers: request.headers,
  }
}


// Export a typed GraphQL client using the generated SDK and the requester function above.
// This provides strongly-typed methods for each GraphQL operation in your schema.
export const optimizely = getSdk(requester)
