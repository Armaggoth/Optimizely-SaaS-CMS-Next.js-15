/**
 * DRAFT ACTIONS COMPONENT - Think of this as a User Control in ASP.NET WebForms
 *
 * This file creates a reusable UI component that provides actions for draft/preview mode.
 * In ASP.NET terms, this is similar to:
 * - A UserControl (.ascx) in WebForms that handles specific functionality
 * - A partial view in MVC that can be included in multiple pages
 * - A custom server control that encapsulates UI and behavior
 *
 * ================================================================================
 * WHERE THIS COMPONENT IS USED - File Dependencies and Usage Locations
 * ================================================================================
 *
 * PRIMARY USAGE:
 * └── app/(draft)/[locale]/layout.tsx (Draft Mode Layout)
 *     ├── Import: Line 27 - import DraftActions from '@/components/draft/draft-actions'
 *     ├── Usage: Line 138 - <DraftActions />
 *     └── Purpose: Provides draft controls on every draft/preview page
 *
 * DOCUMENTATION REFERENCES:
 * └── docs/draft-mode.md (Draft Mode Documentation)
 *     ├── Line 187 - Example usage: <DraftActions />
 *     ├── Line 208 - Code example showing component structure
 *     └── Purpose: Technical documentation for developers
 *
 * RELATIVE PATHS FROM THIS FILE:
 * - Layout that uses this component: ../../app/(draft)/[locale]/layout.tsx
 * - Documentation that references it: ../../docs/draft-mode.md
 * - UI Button component dependency: ./ui/button.tsx
 * - API endpoint for disable action: ../../app/api/draft/disable/route.ts
 *
 * COMPONENT DEPENDENCY TREE:
 * DraftActions (this file)
 * ├── Imports: @/components/ui/button
 * ├── API Calls: /api/draft/disable (handled by ../../app/api/draft/disable/route.ts)
 * ├── Used by: app/(draft)/[locale]/layout.tsx
 * └── Affects: All pages in draft mode (/en/draft/*, /sv/draft/*, etc.)
 *
 * NETWORK DEPENDENCIES:
 * - Refresh Button: Uses Next.js router.refresh() (client-side page reload)
 * - Disable Draft Button: Makes fetch() request to /api/draft/disable endpoint
 *
 * IN ASP.NET TERMS:
 * This is like a UserControl that's included in a Master Page, so it appears
 * on every page that uses that Master Page. The draft layout is only used
 * for preview pages, so this component only appears during content editing.
 * The disable button is like calling a web service or AJAX endpoint.
 *
 * ================================================================================
 *
 * WHAT IS A REACT COMPONENT?
 * - A reusable piece of UI that can contain HTML markup and JavaScript logic
 * - Like a UserControl that combines markup (.ascx) and code-behind (.ascx.cs)
 * - Can be used multiple times across different pages
 * - Encapsulates both appearance and behavior in a single file
 *
 * FILE EXTENSION: .tsx
 * - TSX = TypeScript + JSX (JavaScript XML)
 * - JSX allows writing HTML-like syntax inside JavaScript/TypeScript
 * - TypeScript provides compile-time type checking (like C#)
 * - Similar to how Razor syntax mixes C# and HTML in .cshtml files
 */

// CLIENT COMPONENT DIRECTIVE
// This tells Next.js that this component runs in the browser (client-side)
// In ASP.NET terms: like specifying that code runs on the client vs server
// Without this, the component would run on the server during page generation
'use client'

// IMPORT STATEMENTS - Like 'using' statements in C#
import { Button } from '@/components/ui/button'  // Pre-built button component (like a custom control)
import { useRouter } from 'next/navigation'      // Next.js hook for navigation (like Response.Redirect)

/**
 * DRAFT ACTIONS COMPONENT FUNCTION
 *
 * This is the main function that defines what this component does and how it looks.
 * In ASP.NET terms, think of this like:
 * - The Page_Load method in a UserControl's code-behind
 * - A method that generates HTML markup and handles events
 * - The combination of .ascx markup and .ascx.cs code in one place
 *
 * FUNCTION SIGNATURE:
 * - const DraftActions = () => { ... }
 * - This is an arrow function (ES6 syntax)
 * - Equivalent to: function DraftActions() { ... }
 * - Like defining a method: public void DraftActions() in C#
 */
const DraftActions = () => {
  /**
   * ROUTER HOOK - For Navigation
   *
   * useRouter is a React Hook that provides navigation capabilities
   * In ASP.NET terms, this is like having access to:
   * - Response.Redirect() for redirecting users
   * - Page.ClientScript for client-side navigation
   * - Server.Transfer() for server-side navigation
   *
   * WHAT IS A HOOK?
   * - Special React functions that start with 'use'
   * - Allow you to "hook into" React features like state, navigation, etc.
   * - Think of them like built-in services or utilities you can use
   * - Similar to accessing HttpContext.Current or Page properties in ASP.NET
   */
  const router = useRouter()

  /**
   * EVENT HANDLER FUNCTION - Disabling Draft Mode
   *
   * This function gets called when the "Disable Draft" button is clicked
   * In ASP.NET terms, this is like:
   * - A Button_Click event handler in code-behind
   * - protected void DisableDraftButton_Click(object sender, EventArgs e)
   *
   * WHAT IT DOES:
   * - Makes an HTTP request to /api/draft/disable
   * - This API endpoint will turn off draft mode and redirect to live site
   * - Like calling a web service or API from client-side JavaScript
   *
   * FETCH API:
   * - Modern JavaScript way to make HTTP requests
   * - Similar to HttpWebRequest or HttpClient in .NET
   * - By default, fetch() makes a GET request
   * - The API endpoint will handle the draft mode cleanup
   */
  const handleDisableDraft = () => {
    fetch('/api/draft/disable')  // Make HTTP GET request to disable draft mode
  }

  /**
   * COMPONENT RENDER - Generating the HTML Output
   *
   * The return statement defines what HTML this component will generate
   * In ASP.NET terms, this is like:
   * - The markup in a UserControl's .ascx file
   * - The HTML that gets rendered to the browser
   * - What you see in View Source after the page loads
   *
   * JSX SYNTAX EXPLANATION:
   * - JSX looks like HTML but it's actually JavaScript
   * - className instead of class (because 'class' is a JavaScript keyword)
   * - onClick instead of onclick (camelCase naming convention)
   * - {expression} allows inserting JavaScript expressions into markup
   */
  return (
    // CONTAINER DIV - The wrapper element for the buttons
    // In ASP.NET: like <div runat="server" class="...">
    <div className="flex justify-end gap-5 p-4">
      {/*
      TAILWIND CSS CLASSES EXPLANATION:
      - flex: Display as flexbox container (CSS display: flex)
      - justify-end: Align items to the right side (CSS justify-content: flex-end)
      - gap-5: Space between child elements (CSS gap: 1.25rem)
      - p-4: Padding on all sides (CSS padding: 1rem)

      Think of these like CSS classes, but instead of writing separate CSS:
      .draft-actions { display: flex; justify-content: flex-end; gap: 1.25rem; padding: 1rem; }
      We apply utility classes directly to the element
      */}

      {/* REFRESH PAGE BUTTON
          Custom Button component with click handler
          In ASP.NET: like <asp:Button OnClick="RefreshButton_Click" Text="Refresh Page" /> */}
      <Button onClick={() => router.refresh()}>
        Refresh Page
      </Button>
      {/*
      BUTTON EXPLANATION:
      - Button: Custom component imported from UI library
      - onClick: Event handler (like OnClick in ASP.NET)
      - () => router.refresh(): Arrow function that calls refresh method
      - router.refresh(): Reloads the current page with fresh data
      - "Refresh Page": The text displayed on the button

      WHAT REFRESH DOES:
      - Reloads the page to show latest content changes
      - Useful when content editor makes changes and wants to see them immediately
      - Like pressing F5 or calling Page.Response.Redirect(Request.Url.ToString())
      */}

      {/* DISABLE DRAFT BUTTON
          Button that exits draft mode and returns to live site
          In ASP.NET: like <asp:Button OnClick="DisableDraftButton_Click" Text="Disable Draft" /> */}
      <Button onClick={() => handleDisableDraft()}>
        Disable Draft
      </Button>
      {/*
      BUTTON EXPLANATION:
      - onClick: Calls the handleDisableDraft function we defined above
      - () => handleDisableDraft(): Arrow function wrapper (required for React)
      - This will make an API call to exit draft mode
      - User will be redirected back to the live website
      */}
    </div>
  )
}

// COMPONENT EXPORT
// Makes this component available for import in other files
// In ASP.NET: like registering a UserControl so it can be used on pages
export default DraftActions

/**
 * HOW THIS COMPONENT WORKS - COMPLETE EXPLANATION
 *
 * LIFECYCLE IN ASP.NET TERMS:
 *
 * 1. COMPONENT IMPORT (Like UserControl Registration)
 *    - Another file imports this component: import DraftActions from './draft-actions'
 *    - Similar to: <%@ Register TagPrefix="uc" TagName="DraftActions" Src="~/DraftActions.ascx" %>
 *
 * 2. COMPONENT INSTANTIATION (Like Control Creation)
 *    - When <DraftActions /> is used in JSX, React creates an instance
 *    - Similar to: <uc:DraftActions ID="draftActions1" runat="server" />
 *
 * 3. COMPONENT RENDERING (Like Page Render)
 *    - React calls the DraftActions function to generate HTML
 *    - Similar to: the UserControl's Page_Load and Render methods
 *
 * 4. EVENT HANDLING (Like Server Events)
 *    - User clicks buttons, which call the defined event handlers
 *    - Similar to: Button_Click events in code-behind
 *
 * COMPARISON TO ASP.NET USERCONTROL:
 *
 * ASP.NET UserControl (.ascx + .ascx.cs):
 *
 * // DraftActions.ascx
 * <div class="draft-actions">
 *     <asp:Button ID="RefreshButton" Text="Refresh Page" OnClick="RefreshButton_Click" runat="server" />
 *     <asp:Button ID="DisableDraftButton" Text="Disable Draft" OnClick="DisableDraftButton_Click" runat="server" />
 * </div>
 *
 * // DraftActions.ascx.cs
 * public partial class DraftActions : System.Web.UI.UserControl
 * {
 *     protected void RefreshButton_Click(object sender, EventArgs e)
 *     {
 *         Response.Redirect(Request.Url.ToString());
 *     }
 *
 *     protected void DisableDraftButton_Click(object sender, EventArgs e)
 *     {
 *         // Call API or set session variable to disable draft
 *         Response.Redirect("/");
 *     }
 * }
 *
 * REACT COMPONENT ADVANTAGES:
 *
 * 1. SINGLE FILE
 *    - All logic and markup in one file (no separate .ascx.cs)
 *    - Easier to maintain and understand
 *
 * 2. REUSABILITY
 *    - Can be used on any page without registration
 *    - No ViewState or postback complexity
 *
 * 3. CLIENT-SIDE PERFORMANCE
 *    - Buttons work immediately (no server round-trip)
 *    - Better user experience
 *
 * 4. TYPE SAFETY
 *    - TypeScript provides compile-time checking
 *    - Catch errors before deployment
 *
 * WHEN THIS COMPONENT IS USED:
 *
 * - Only appears on draft/preview pages
 * - Gives content editors quick access to draft actions
 * - Positioned at top or bottom of page (depends on layout)
 * - Hidden from regular website visitors
 *
 * STYLING WITH TAILWIND CSS:
 *
 * Instead of separate CSS files:
 * .draft-actions {
 *     display: flex;
 *     justify-content: flex-end;
 *     gap: 1.25rem;
 *     padding: 1rem;
 * }
 *
 * We use utility classes directly on elements:
 * className="flex justify-end gap-5 p-4"
 *
 * Benefits:
 * - No separate CSS files to maintain
 * - Consistent spacing and layout
 * - Easy to see what styles are applied
 * - Better performance (smaller CSS bundle)
 *
 * DEBUGGING TIPS:
 *
 * 1. If buttons don't appear: Check if component is imported and used correctly
 * 2. If styling looks wrong: Verify Tailwind CSS classes are correct
 * 3. If click handlers don't work: Check browser console for JavaScript errors
 * 4. If API calls fail: Check network tab in browser dev tools
 * 5. Use React Developer Tools browser extension to inspect component state
 */
