
// Import the 'dynamic' function from Next.js, which allows you to load components only when needed (code splitting).
import dynamic from 'next/dynamic'

// Import the block factory function, which creates a function to map block type names to React components.
import blocksMapperFactory from '@/lib/utils/block-factory'

// Dynamically import each block component using Next.js dynamic imports.
// This means the code for each block is only loaded when that block is actually used, improving performance.
const AvailabilityBlock = dynamic(() => import('../block/availability-block'))
const ContactBlock = dynamic(() => import('../block/contact-block'))
const HeroBlock = dynamic(() => import('../block/hero-block'))
const LogosBlock = dynamic(() => import('../block/logos-block'))
const PortfolioGridBlock = dynamic(
  () => import('../block/portfolio-grid-block')
)
const ProfileBlock = dynamic(() => import('../block/profile-block'))
const ServicesBlock = dynamic(() => import('../block/services-block'))
const StoryBlock = dynamic(() => import('../block/story-block'))
const TestimonialsBlock = dynamic(() => import('../block/testimonials-block'))

// Create an object that maps block names to their corresponding dynamically imported components.
// 'as const' tells TypeScript to treat the object as immutable and to infer literal types for the keys.
export const blocks = {
  AvailabilityBlock,
  ContactBlock,
  HeroBlock,
  LogosBlock,
  PortfolioGridBlock,
  ProfileBlock,
  ServicesBlock,
  StoryBlock,
  TestimonialsBlock,
} as const

// Export the result of calling blocksMapperFactory with the blocks map.
// This creates a function you can use to render the correct block component based on a string type name.
export default blocksMapperFactory(blocks)
