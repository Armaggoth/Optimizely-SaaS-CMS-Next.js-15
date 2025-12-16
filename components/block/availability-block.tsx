
// Import Card and CardContent components for UI layout (like panels or containers)
import { Card, CardContent } from '@/components/ui/card'

// Import the type definition for the props this block expects
import { AvailabilityBlock as AvailabilityBlockProps } from '@/lib/optimizely/types/generated'

// Define and export the AvailabilityBlock React component
// It receives 'availability' (a string) and 'projectTypes' (an array of strings) as props
export default function AvailabilityBlock({
  availability,   // The main availability text to display
  projectTypes,   // An array of project type strings to list
}: AvailabilityBlockProps) {
  return (
    // The outer <section> is a semantic HTML5 element for grouping related content
    // Tailwind CSS classes:
    // 'container' centers the content and sets a max width
    // 'mx-auto' centers horizontally
    // 'px-4' adds horizontal padding
    // 'py-16' adds vertical padding
    <section className="container mx-auto px-4 py-16">
      {/* Card is a styled container component (like a panel or box) */}
      {/* 'border-none' removes the border using Tailwind CSS */}
      <Card className="border-none">
        {/* CardContent is a sub-container for the card's main content */}
        {/* 'p-8' adds padding on all sides */}
        <CardContent className="p-8">
          {/* A div to constrain the width and add vertical spacing between children */}
          {/* 'mx-auto' centers, 'max-w-3xl' limits width, 'space-y-6' adds vertical space between children */}
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Paragraph for the main availability text */}
            {/* 'leading-relaxed' sets line height, 'text-[#2d2d2d]' sets text color */}
            {/* 'data-epi-edit' is a custom attribute for in-place editing in CMS tools */}
            <p
              className="leading-relaxed text-[#2d2d2d]"
              data-epi-edit="availability"
            >
              {/* Render the availability text passed as a prop */}
              {availability}
            </p>
            <div>
              {/* Label for the project types list */}
              <p className="leading-relaxed text-[#2d2d2d]">
                Projects include:
              </p>
              {/* Unordered list for project types */}
              {/* 'mt-2' adds top margin, 'list-inside' puts bullets inside, 'list-disc' uses disc bullets, 'space-y-1' adds vertical space between items */}
              {/* 'data-epi-edit' for CMS editing */}
              <ul
                className="mt-2 list-inside list-disc space-y-1"
                data-epi-edit="projectTypes"
              >
                {/* Map over the projectTypes array and render each as a list item */}
                {projectTypes?.map((type, index) => (
                  // 'key' is required by React for list items; use the index for uniqueness
                  // 'text-[#2d2d2d]' sets the text color
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
