// ==============================================================================
// DRAFT MODE VALIDATION UTILITY
// ==============================================================================
//
// This utility provides a centralized way to check if draft mode is enabled
// and handle authorization for preview functionality in the application.
//
// FOR .NET DEVELOPERS:
// Think of this as a utility class with a static method for authorization checks:
//
//   public static class DraftModeHelper
//   {
//       public static async Task<bool> IsAuthorizedAsync()
//       {
//           // Check if user has permission to view draft content
//           var isDraftEnabled = HttpContext.Session["DraftMode"] != null;
//           var isDevelopment = Environment.IsDevelopment();
//
//           return isDraftEnabled || isDevelopment;
//       }
//   }
//
// Compare to ASP.NET authorization patterns:
//   [Authorize(Roles = "ContentEditor")]
//   public ActionResult PreviewContent() { ... }
//
// ==============================================================================
// WHERE THIS IS USED:
// ==============================================================================
//
// DRAFT MODE PAGES (All import and call checkDraftMode()):
// ├── app/(draft)/[locale]/draft/[version]/page.tsx
// │   ├── Line 83 - Import statement
// │   ├── Line 135 - Called in HomePage component before rendering
// │   └── Purpose: Authorize access to draft home page preview
//
// ├── app/(draft)/[locale]/draft/[version]/[slug]/page.tsx
// │   ├── Line 99 - Import statement
// │   ├── Line 153 - Called in ContentPage component before rendering
// │   └── Purpose: Authorize access to draft content page preview
//
// ├── app/(draft)/[locale]/draft/[version]/experience/[key]/page.tsx
// │   ├── Line 6 - Import statement
// │   ├── Line 16 - Called in ExperiencePage component
// │   └── Purpose: Authorize access to draft experience preview
//
// ├── app/(draft)/[locale]/draft/[version]/block/[key]/page.tsx
// │   ├── Line 5 - Import statement
// │   ├── Line 15 - Called in BlockPage component
// │   └── Purpose: Authorize access to draft block preview
//
// DEBUGGING LOCATIONS:
// ├── Browser console - Look for "Draft mode is disabled..." message in development
// ├── Network tab - Check if draft mode API calls are working
// ├── Check cookies - Draft mode status stored in Next.js cookies
// └── Environment variables - Verify NODE_ENV setting
//
// ==============================================================================
// NEXT.JS DRAFT MODE CONCEPTS FOR .NET DEVELOPERS:
// ==============================================================================
//
// WHAT IS DRAFT MODE?
// - Next.js feature for previewing unpublished content
// - Like having a "Preview" vs "Live" mode in a CMS
// - Similar to staging environments or preview builds in .NET
//
// HOW DRAFT MODE WORKS:
// 1. User clicks "Preview" in Optimizely CMS
// 2. CMS redirects to /api/draft with authentication token
// 3. API enables draft mode and sets secure cookies
// 4. Draft pages check this cookie before rendering content
// 5. If authorized, show unpublished content; otherwise redirect to live site
//
// ENVIRONMENT HANDLING:
// - Development (NODE_ENV !== 'production'): Always allow access for testing
// - Production: Strict enforcement of draft mode authorization
// - Like Debug vs Release builds with different security levels
//
// SECURITY CONSIDERATIONS:
// - Draft mode prevents unauthorized access to unpublished content
// - Only authenticated CMS users should see draft content
// - Development environment bypasses security for easier testing
//
// ==============================================================================

import { draftMode } from 'next/headers'

// ==============================================================================
// DRAFT MODE AUTHORIZATION CHECK
// ==============================================================================
// Validates whether the current user is authorized to view draft content
//
// FOR .NET DEVELOPERS:
// This function is like a security authorization method:
//   public static async Task<bool> IsUserAuthorizedForPreview()
//   {
//       var session = HttpContext.Current.Session;
//       var isInDraftMode = session["DraftModeEnabled"] as bool? ?? false;
//       var isDevelopment = ConfigurationManager.AppSettings["Environment"] == "Development";
//
//       if (!isInDraftMode && isDevelopment)
//       {
//           Logger.Log("Development mode - allowing preview access");
//           return true;
//       }
//
//       return isInDraftMode;
//   }
//
// RETURN VALUE:
// - true: User is authorized to view draft content (render preview)
// - false: User is not authorized (should redirect to live site or show error)
//
// USAGE PATTERN IN COMPONENTS:
//   const isDraftAuthorized = await checkDraftMode()
//   if (!isDraftAuthorized) {
//     notFound() // Equivalent to return HttpNotFound() in ASP.NET
//   }
//
export async function checkDraftMode() {
  // GET DRAFT MODE STATUS FROM NEXT.JS
  // draftMode() returns an object with isEnabled property
  // Like checking Session["DraftMode"] in ASP.NET
  const { isEnabled: isDraftModeEnabled } = await draftMode()

  // CHECK ENVIRONMENT TYPE
  // NODE_ENV is like checking ConfigurationManager.AppSettings["Environment"]
  // 'production' = live/release environment, anything else = development/debug
  const isDevEnvironment = process.env.NODE_ENV !== 'production'

  // DEVELOPMENT ENVIRONMENT BYPASS
  // In development, allow access even without proper draft mode authorization
  // Like having [Conditional("DEBUG")] attributes that skip security in debug builds
  // This makes local development and testing easier
  if (!isDraftModeEnabled && isDevEnvironment) {
    console.log('Draft mode is disabled in development, but allowing access')
    return true // Allow access for developers
  }

  // PRODUCTION ENVIRONMENT - STRICT AUTHORIZATION
  // In production, only return true if draft mode is properly enabled
  // Like enforcing [Authorize] attributes in release builds
  return isDraftModeEnabled
}
