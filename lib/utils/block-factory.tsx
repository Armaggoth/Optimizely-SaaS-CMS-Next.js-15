
// This file defines a utility for dynamically mapping content types to React components.
// It allows you to render different React components based on a string type name at runtime.

// Import 'createElement' (a function to create React elements) and 'ComponentType' (a type for React components) from React.
import { createElement, ComponentType } from 'react'

// Define a type alias for a map from string keys to React component types.
// Record<string, ComponentType<any>> is like Dictionary<string, ComponentType<any>> in C#.
type ComponentMap = Record<string, ComponentType<any>>

// Export a default function that creates a block/component factory.
// TMap is a generic type parameter that extends ComponentMap, so you get type safety for your mapping.
export default function blocksMapperFactory<TMap extends ComponentMap>(
  contentTypeMap: TMap // This is your mapping from type names to React components.
) {
  // The factory function takes an object with a typeName and props.
  function factory<TypeName extends keyof TMap>({
    typeName, // The string key for the component you want to render.
    props,    // The props to pass to the component.
  }: {
    typeName: TypeName // Restricts typeName to only valid keys in TMap.
    props: React.ComponentProps<TMap[TypeName]> // Gets the correct props type for the component.
  }) {
    // Look up the component in the map using the typeName.
    const Component = contentTypeMap[typeName]

    // If the component doesn't exist in the map, return null (renders nothing in React).
    if (!Component) {
      return null
    }

    // Dynamically create a React element for the component, passing in the props.
    // Equivalent to: <Component {...props} />
    return createElement(Component, props)
  }

  // Return the factory function so it can be used elsewhere.
  return factory
}
