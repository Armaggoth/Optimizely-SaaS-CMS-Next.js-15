
// Import the ExperienceElement type, which describes the shape of experience elements (blocks) from Optimizely.
import { ExperienceElement } from '@/lib/optimizely/types/experience'

// Import the Block component, which is responsible for rendering individual blocks.
import Block from './block'

// Define the ContentAreaMapper component. This function renders a list of blocks or experience elements.
function ContentAreaMapper({
  blocks,                // An array of block data to render (optional)
  preview = false,       // Whether the page is in preview mode (default: false)
  isVisualBuilder = false, // Whether to use the visual builder mode (default: false)
  experienceElements,    // An array of experience elements for the visual builder (optional)
}: {
  blocks?: any[] | null
  preview?: boolean
  isVisualBuilder?: boolean
  experienceElements?: ExperienceElement[] | null
}) {
  // If visual builder mode is enabled...
  if (isVisualBuilder) {
    // ...and there are no experience elements, render nothing (null means render nothing in React).
    if (!experienceElements || experienceElements.length === 0) return null

    // Otherwise, render each experience element as a Block inside a <div>.
    return (
      <>
        {/* Map over each experience element and render a Block for it. */}
        {experienceElements?.map(
          ({ displaySettings, component, key }, index) => (
            <div
              data-epi-block-id={key} // Custom data attribute for identifying the block (useful for editing tools)
              key={`${component?.__typename satisfies string}--${index}`}
            >
              {/* Render the Block component, passing the type name and props. */}
              <Block
                typeName={component?.__typename}
                props={{
                  ...component,         // Spread all properties of the component as props
                  displaySettings,      // Pass display settings
                  isFirst: index === 0, // Indicate if this is the first block
                  preview,              // Pass the preview flag
                }}
              />
            </div>
          )
        )}
      </>
    )
  }

  // If not in visual builder mode, and there are no blocks, render nothing.
  if (!blocks || blocks.length === 0) return null

  // Otherwise, render each block as a Block component.
  return (
    <>
      {/* Map over each block and render a Block for it. */}
      {blocks?.map(({ __typename, ...props }, index) => (
        <Block
          key={`${__typename satisfies string}--${index}`}
          typeName={__typename}
          props={{
            ...props,              // Spread all other properties as props
            isFirst: index === 0,  // Indicate if this is the first block
            preview,               // Pass the preview flag
          }}
        />
      ))}
    </>
  )
}

// Export the ContentAreaMapper component as the default export of this file.
export default ContentAreaMapper
