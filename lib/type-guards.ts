
// Define a TypeScript interface (like a C# interface) for objects that look like Vercel errors.
// This describes the shape of the object, not its implementation.
export interface VercelErrorLike {
  // The HTTP status code for the error (e.g., 404, 500)
  status: number
  // The error message, as an Error object (not just a string)
  message: Error
  // An optional property for the underlying cause of the error (also an Error object)
  cause?: Error
}


// Type guard function to check if a value is a plain object (not null, not an array).
// In TypeScript, 'unknown' is a type-safe way to represent any value.
// The return type 'object is Record<string, unknown>' is a TypeScript type predicate.
export const isObject = (
  object: unknown
): object is Record<string, unknown> => {
  // typeof object === 'object' checks for objects (including arrays and null)
  // object !== null excludes null
  // !Array.isArray(object) excludes arrays
  return typeof object === 'object' && object !== null && !Array.isArray(object)
}


// Type guard to check if a value is a VercelErrorLike (or an Error object).
// Returns true if the error is an Error or has an Error in its prototype chain.
export const isVercelError = (error: unknown): error is VercelErrorLike => {
  // First, check if the value is a plain object (not null, not array)
  if (!isObject(error)) return false

  // If the value is an instance of Error, return true
  if (error instanceof Error) return true

  // Otherwise, check the prototype chain for Error
  return findError(error)
}


// Helper function to recursively check if an object's prototype chain includes Error.
// This is useful for custom error objects that inherit from Error.
function findError<T extends object>(error: T): boolean {
  // Object.prototype.toString.call(error) returns '[object Error]' for Error objects
  if (Object.prototype.toString.call(error) === '[object Error]') {
    return true
  }

  // Get the prototype of the object (like .BaseType in C#)
  const prototype = Object.getPrototypeOf(error) as T | null

  // If there's no prototype, we've reached the end of the chain (return false)
  // Otherwise, recursively check the prototype
  return prototype === null ? false : findError(prototype)
}
