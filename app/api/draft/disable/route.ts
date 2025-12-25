/**
 * DRAFT MODE DISABLE API ROUTE - Think of this as an ASP.NET Web API Controller Action
 *
 * This file creates an API endpoint that disables draft mode and returns users to the live website.
 * In ASP.NET terms, this is equivalent to:
 * - An ApiController action in Web API: [HttpGet] public IHttpActionResult DisableDraft()
 * - An HTTP Handler (.ashx) that processes GET requests
 * - A controller method that clears session state and redirects users
 *
 * ================================================================================
 * WHERE THIS API ENDPOINT IS CALLED - Usage and Dependencies
 * ================================================================================
 *
 * PRIMARY CALLER:
 * └── components/draft/draft-actions.tsx (Draft Actions Component)
 *     ├── Line 127 - fetch('/api/draft/disable')
 *     ├── Triggered by: "Disable Draft" button click
 *     └── Purpose: Exit draft mode and return to live website
 *
 * DOCUMENTATION REFERENCES:
 * └── docs/draft-mode.md (Draft Mode Documentation)
 *     ├── Line 212 - Example API call: fetch('/api/draft/disable')
 *     ├── Line 232 - File reference: app/api/draft/disable/route.ts
 *     └── Purpose: Technical documentation for developers
 *
 * RELATIVE PATHS FROM THIS FILE:
 * - Component that calls this API: ../../../../components/draft/draft-actions.tsx
 * - Documentation that references it: ../../../../docs/draft-mode.md
 * - Related draft enable API: ../route.ts (enables draft mode)
 *
 * API ENDPOINT DETAILS:
 * - URL: GET /api/draft/disable
 * - Method: GET (no parameters required)
 * - Response: Plain text confirmation message
 * - Side Effect: Disables Next.js draft mode globally
 *
 * CALLING SEQUENCE:
 * 1. User clicks "Disable Draft" button in draft-actions component
 * 2. JavaScript fetch() makes GET request to this endpoint
 * 3. This API disables draft mode server-side
 * 4. User continues browsing but now sees live (published) content
 *
 * IN ASP.NET TERMS:
 * This is like a Web API controller action that clears a session variable
 * or authentication cookie, then returns a success message. The client-side
 * code can optionally redirect the user after getting the response.
 *
 * ================================================================================
 *
 * FILE LOCATION SIGNIFICANCE:
 * - Located at: /app/api/draft/disable/route.ts
 * - In Next.js, this automatically creates the API endpoint: https://yoursite.com/api/draft/disable
 * - The folder structure determines the URL path (like routing in ASP.NET MVC)
 * - Think of it like having [Route("api/draft/disable")] on a controller method
 *
 * WHAT IS DRAFT MODE?
 * - A Next.js feature that allows showing unpublished/preview content
 * - Similar to preview functionality in CMS systems like Sitecore or Umbraco
 * - When enabled, the website shows draft content instead of published content
 * - When disabled, users see the live website that regular visitors see
 */

import { draftMode } from 'next/headers'  // Next.js utility for managing draft mode state

/**
 * GET REQUEST HANDLER - This is like an ASP.NET Web API Controller Action
 *
 * In ASP.NET, you might write:
 * [HttpGet]
 * [Route("api/draft/disable")]
 * public IHttpActionResult DisableDraft()
 * {
 *     Session["DraftMode"] = false;
 *     return Ok("Draft mode is disabled");
 * }
 *
 * This Next.js version automatically handles GET requests to /api/draft/disable
 * The function name 'GET' tells Next.js this handles HTTP GET requests
 */
export async function GET() {
  // DISABLE DRAFT MODE
  // This is the core functionality - turning off draft mode
  // In ASP.NET terms: like clearing a session variable or authentication cookie
  // The semicolon at the start prevents automatic semicolon insertion issues
  ;(await draftMode()).disable()

  /**
   * WHAT .disable() DOES:
   * - Clears the draft mode cookie/state from the user's browser
   * - Tells Next.js to stop showing draft content
   * - Similar to: Session.Clear() or FormsAuthentication.SignOut() in ASP.NET
   * - After this, subsequent page requests will show published content only
   *
   * WHY IT'S ASYNC:
   * - draftMode() returns a Promise (like Task<T> in modern .NET)
   * - We use 'await' to wait for the operation to complete
   * - Similar to: await SomeAsyncMethod() in C# async/await
   */

  // RETURN SUCCESS RESPONSE
  // Send a simple text response back to the client
  // In ASP.NET: like return Ok("Draft mode is disabled") or return Content("message")
  return new Response('Draft mode is disabled')

  /**
   * RESPONSE OBJECT EXPLANATION:
   * - new Response() creates an HTTP response object
   * - Contains the message that gets sent back to the caller
   * - Default status code is 200 (OK)
   * - Content-Type defaults to text/plain
   *
   * IN ASP.NET EQUIVALENT:
   * return new HttpResponseMessage(HttpStatusCode.OK)
   * {
   *     Content = new StringContent("Draft mode is disabled")
   * };
   *
   * Or in Web API:
   * return Ok("Draft mode is disabled");
   *
   * Or in MVC:
   * return Content("Draft mode is disabled");
   */
}

/**
 * HOW THIS API WORKS - COMPLETE FLOW EXPLANATION
 *
 * TYPICAL USER WORKFLOW:
 *
 * 1. CONTENT EDITOR SCENARIO
 *    - Editor is previewing changes in draft mode
 *    - Sees draft content with special controls/buttons
 *    - Clicks "Disable Draft" button to exit preview
 *    - This API gets called to turn off draft mode
 *    - Editor now sees the live website like regular visitors
 *
 * 2. TECHNICAL FLOW
 *    Step 1: User clicks button in components/draft/draft-actions.tsx
 *    Step 2: JavaScript executes: fetch('/api/draft/disable')
 *    Step 3: Browser makes GET request to this API endpoint
 *    Step 4: This function runs on the server
 *    Step 5: draftMode().disable() clears draft state
 *    Step 6: Response sent back: "Draft mode is disabled"
 *    Step 7: User continues browsing but now sees live content
 *
 * COMPARISON TO ASP.NET PATTERNS:
 *
 * ASP.NET Web API Equivalent:
 * [Route("api/draft/disable")]
 * public class DraftController : ApiController
 * {
 *     [HttpGet]
 *     public IHttpActionResult Disable()
 *     {
 *         HttpContext.Session["DraftMode"] = false;
 *         return Ok("Draft mode is disabled");
 *     }
 * }
 *
 * ASP.NET Core Equivalent:
 * [Route("api/draft/disable")]
 * [ApiController]
 * public class DraftController : ControllerBase
 * {
 *     [HttpGet]
 *     public IActionResult Disable()
 *     {
 *         HttpContext.Session.SetString("DraftMode", "false");
 *         return Ok("Draft mode is disabled");
 *     }
 * }
 *
 * KEY DIFFERENCES FROM ASP.NET:
 *
 * 1. FILE-BASED ROUTING
 *    - No need for RouteAttribute or RouteConfig
 *    - Folder structure automatically creates the route
 *    - /app/api/draft/disable/ maps to /api/draft/disable
 *
 * 2. FUNCTION EXPORTS
 *    - Export functions named after HTTP methods (GET, POST, etc.)
 *    - No need for controller classes or action methods
 *    - Each route.ts file can handle multiple HTTP methods
 *
 * 3. SIMPLIFIED STATE MANAGEMENT
 *    - draftMode() handles all the cookie/session complexity
 *    - No need to manually manage session state or cookies
 *    - Built-in Next.js functionality for common CMS scenarios
 *
 * SECURITY CONSIDERATIONS:
 *
 * - This endpoint has no authentication (anyone can call it)
 * - That's OK because it only affects the calling user's session
 * - Similar to logging out - doesn't affect other users
 * - In production, you might add token validation for extra security
 *
 * ERROR HANDLING:
 *
 * - If draftMode().disable() fails, the function would throw an error
 * - Next.js automatically returns a 500 error to the client
 * - In production, you might want try/catch blocks for better error handling
 *
 * DEBUGGING TIPS:
 *
 * 1. Check browser Network tab to see if API call is made
 * 2. Verify the response message appears correctly
 * 3. Test that subsequent page loads show published content
 * 4. Use browser dev tools to inspect cookies (draft mode uses cookies)
 * 5. Check server logs for any errors during the disable process
 */
