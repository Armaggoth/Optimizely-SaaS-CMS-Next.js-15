
/**
 * =====================================================================================
 * AVAILABILITY BLOCK COMPONENT
 * =====================================================================================
 * 
 * This component displays availability information and a list of project types.
 * It's designed as a content block that can be used within the Optimizely CMS
 * system and supports in-place editing for content management.
 * 
 * FUNCTIONALITY:
 * - Displays availability text in a paragraph
 * - Shows a bulleted list of project types
 * - Uses card-based layout for visual grouping
 * - Supports CMS editing through data attributes
 * 
 * TECHNICAL IMPLEMENTATION:
 * - React functional component with TypeScript
 * - Responsive design using Tailwind CSS utility classes
 * - Semantic HTML5 structure for accessibility
 * - Props interface from generated TypeScript types
 * =====================================================================================
 */

// ES6 Import: brings in reusable UI components from the shared component library
// Destructuring syntax { Card, CardContent } extracts specific exports from the module
// '@/' is a path alias that points to the project root directory
import { Card, CardContent } from '@/components/ui/card'

// TypeScript type import: defines the shape/structure of props this component expects
// 'as AvailabilityBlockProps' creates an alias for the imported type
// This provides compile-time type checking and IntelliSense support
import { AvailabilityBlock as AvailabilityBlockProps } from '@/lib/optimizely/types/generated'

// Function component definition with TypeScript typing
// 'export default' makes this the main export of this module
// Destructuring parameters: extracts specific properties from the props object
// TypeScript typing: ': AvailabilityBlockProps' ensures type safety
export default function AvailabilityBlock({
  availability,   // String: main availability description text
  projectTypes,   // Array<string>: list of project type names
}: AvailabilityBlockProps) {
  // JSX Return Statement: defines the component's rendered HTML structure
  // JSX allows mixing JavaScript expressions (in {}) with HTML-like syntax
  // Each element becomes a React virtual DOM node that gets converted to real DOM
  
  return (
    // HTML5 semantic element: <section> represents a standalone section of content
    // className attribute: React's version of HTML 'class' (class is a JavaScript keyword)
    // Tailwind CSS utility classes for styling:
    //   - container: responsive max-width container with auto margins
    //   - mx-auto: margin left/right auto (horizontal centering)
    //   - px-4: padding left/right 1rem (16px)
    //   - py-16: padding top/bottom 4rem (64px)
    <section className="container mx-auto px-4 py-16">
      
      <Card className="border-none">
        <CardContent className="p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <p
              className="leading-relaxed text-[#2d2d2d]"
              data-epi-edit="availability"
            >
              {availability}
            </p>
            <div>
              <p className="leading-relaxed text-[#2d2d2d]">
                Projects include:
              </p>
              <ul
                className="mt-2 list-inside list-disc space-y-1"
                data-epi-edit="projectTypes"
              >
                {projectTypes?.map((type, index) => (
                  <li key={index} className="text-[#2d2d2d]">
                    {type}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

/*
 * COMPONENT BEHAVIOR SUMMARY:
 * 
 * 1. Receives availability text and project types array as props
 * 2. Renders availability description in a paragraph
 * 3. Displays "Projects include:" label  
 * 4. Maps over project types array to create bulleted list
 * 5. Applies consistent styling and spacing throughout
 * 6. Supports CMS editing through data-epi-edit attributes
 * 
 * KEY CONCEPTS EXPLAINED:
 * 
 * COMPONENT STRUCTURE:
 * - Function component: A JavaScript function that returns JSX
 * - Props: Data passed into the component from parent components
 * - Destructuring: { availability, projectTypes } extracts props directly
 * - TypeScript: Provides type safety and better development experience
 * 
 * JSX SYNTAX:
 * - HTML-like syntax within JavaScript
 * - className instead of class (class is JavaScript keyword)
 * - Curly braces {} for JavaScript expressions
 * - Self-closing tags like <Card />
 * 
 * ARRAY MAPPING:
 * - projectTypes?.map() iterates over array items
 * - Optional chaining (?.) prevents errors if array is null
 * - Returns new JSX element for each array item
 * - key prop required for React's efficient rendering
 * 
 * TAILWIND CSS:
 * - Utility-first CSS framework
 * - Classes like "mx-auto" apply specific CSS rules
 * - "px-4" = padding-left: 1rem; padding-right: 1rem;
 * - "text-[#2d2d2d]" = custom hex color value
 * 
 * CMS INTEGRATION:
 * - data-epi-edit attributes enable in-place editing
 * - Optimizely CMS recognizes these for content management
 * - Allows non-technical users to edit content directly
 */
