// ==============================================================================
// NEXT.JS CONFIGURATION FILE - APPLICATION SETTINGS
// ==============================================================================
//
// This file configures how the Next.js application builds and runs.
// This is the main configuration file for the entire Next.js application.
//
// FOR .NET DEVELOPERS:
// Think of this as the equivalent of:
// - web.config in ASP.NET WebForms/MVC (but in TypeScript instead of XML)
// - appsettings.json + Startup.cs configuration in .NET Core
// - Application_Start() method in Global.asax for WebForms
//
// Compare to ASP.NET configuration:
//   <configuration>
//     <system.web>
//       <httpRuntime maxRequestLength="..." />
//       <compilation debug="false" />
//     </system.web>
//     <system.webServer>
//       <httpProtocol><customHeaders>...</customHeaders></httpProtocol>
//     </system.webServer>
//   </configuration>
//
// ==============================================================================
// WHERE THIS IS USED:
// ==============================================================================
//
// NEXT.JS BUILD SYSTEM:
// ├── Next.js automatically loads this file during build and runtime
// ├── Build process: npm run build, npm run dev, npm start
// ├── Deployed application: Vercel, Netlify, or any Node.js hosting
// └── Development server: http://localhost:3000
//
// IMAGE HANDLING:
// ├── lib/image/loader.ts
// │   ├── Line 274 - References remotePatterns configuration
// │   ├── Line 280 - Documents need to add domains here
// │   ├── Line 291 - Validates domains against this config
// │   ├── Line 295 - Instructions for adding new image domains
// │   ├── Line 368 - Requires proper domain configuration here
// │   └── Line 390 - Step-by-step setup instructions
//
// DRAFT MODE SYSTEM:
// ├── docs/draft-mode.md
// │   ├── Line 17 - Documents redirect configuration for Optimizely preview
// │   ├── Line 20 - Example configuration snippet
// │   ├── Line 543 - Documents Content Security Policy for CMS embedding
// │   └── Line 546 - CSP configuration example
//
// DEBUGGING LOCATIONS:
// ├── Browser Dev Tools → Network tab → Check response headers for CSP/X-Frame-Options
// ├── Image loading errors → Check console for domain whitelist issues
// ├── Build errors → Check terminal output during npm run build
// └── Optimizely CMS preview issues → Check redirect and CSP configuration
//
// ==============================================================================
// NEXT.JS CONFIGURATION CONCEPTS FOR .NET DEVELOPERS:
// ==============================================================================
//
// WHAT IS NEXT.JS CONFIG?
// - Next.js is a React framework, like ASP.NET Core is a .NET framework
// - This file configures the framework's behavior, similar to web.config or Startup.cs
// - Settings control build process, runtime behavior, security headers, and routing
//
// CONFIGURATION SECTIONS EXPLAINED:
//
// 1. BUILD TIMEOUT (staticPageGenerationTimeout):
//    - Like <httpRuntime executionTimeout="300" /> in web.config
//    - Prevents build timeouts when CMS API calls are slow
//    - Default is 60 seconds, we increase to 300 seconds (5 minutes)
//
// 2. ESLINT CONFIGURATION:
//    - ESLint = code quality checker (like StyleCop or FxCop in .NET)
//    - ignoreDuringBuilds = skip code quality checks during production build
//    - Similar to <compilation debug="false" /> disabling debug features in production
//
// 3. IMAGES CONFIGURATION:
//    - domains/remotePatterns = whitelist of allowed image sources
//    - Like <system.webServer><security><requestFiltering> in IIS
//    - Custom loader = custom image processing logic (like custom HTTP handlers)
//    - Security feature to prevent loading images from untrusted domains
//
// 4. HEADERS CONFIGURATION:
//    - Like <system.webServer><httpProtocol><customHeaders> in web.config
//    - X-Frame-Options = prevents clickjacking attacks (like anti-forgery tokens)
//    - Content-Security-Policy = controls what content can be embedded (like CORS)
//
// 5. REDIRECTS CONFIGURATION:
//    - Like <system.webServer><rewrite><rules> in web.config
//    - Maps incoming URLs to different internal URLs
//    - Enables Optimizely CMS preview functionality

import type { NextConfig } from 'next'

// =============================================================================
// NEXT.JS CONFIGURATION OBJECT
// =============================================================================
// This object contains all the settings for how Next.js should behave.
// Like creating a Configuration object in .NET Core's Startup.cs
//
// FOR .NET DEVELOPERS:
// Similar to configuring services in Startup.cs:
//   public void ConfigureServices(IServiceCollection services)
//   {
//       services.Configure<AppSettings>(options => { ... });
//   }
//
const nextConfig: NextConfig = {

  // =============================================================================
  // BUILD TIMEOUT CONFIGURATION
  // =============================================================================
  // Prevents build process from timing out when CMS API calls are slow
  //
  // FOR .NET DEVELOPERS:
  // Like setting <httpRuntime executionTimeout="300" /> in web.config
  // or HttpClient.Timeout = TimeSpan.FromMinutes(5) in C#
  //
  // WHY NEEDED:
  // - Optimizely CMS API calls can be slow during static generation
  // - Default 60 seconds often not enough for complex page builds
  // - 300 seconds (5 minutes) gives enough time for API responses
  //
  staticPageGenerationTimeout: 300, // 5 minutes instead of default 60 seconds


  // =============================================================================
  // CODE QUALITY (ESLINT) CONFIGURATION
  // =============================================================================
  // Controls when code quality checks run during the build process
  //
  // FOR .NET DEVELOPERS:
  // ESLint is like StyleCop, FxCop, or ReSharper code analysis
  // This setting is like:
  //   <PropertyGroup>
  //     <RunCodeAnalysis>false</RunCodeAnalysis>
  //   </PropertyGroup>
  //
  // WHY DISABLED:
  // - Code quality checks run in GitHub Actions during PR review
  // - No need to slow down production builds with duplicate checks
  // - Similar to disabling StyleCop in Release builds for performance
  //
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint checks during production builds
  },

  // =============================================================================
  // IMAGE HANDLING CONFIGURATION
  // =============================================================================
  // Controls where images can be loaded from and how they're processed
  //
  // FOR .NET DEVELOPERS:
  // Like configuring allowed file upload sources and image processing handlers
  // Similar to:
  //   <system.webServer>
  //     <security>
  //       <requestFiltering>
  //         <requestLimits maxUrl="..." />
  //       </requestFiltering>
  //     </security>
  //   </system.webServer>
  //
  // SECURITY PURPOSE:
  // - Prevents loading images from malicious external domains
  // - Only whitelisted domains can serve images to your site
  // - Protects against XSS and content injection attacks
  //
  images: {
    // LEGACY DOMAIN CONFIGURATION (older Next.js versions)
    // Like adding trusted domains to a whitelist
    domains: ['res.cloudinary.com'],

    // MODERN DOMAIN CONFIGURATION (Next.js 12.3+)
    // More flexible pattern matching for allowed image sources
    // Like configuring URL rewrite rules in IIS
    remotePatterns: [
      {
        protocol: 'https',                    // Only allow HTTPS (secure) images
        hostname: '*.optimizely.com',         // Any subdomain of optimizely.com
        port: '',                             // Default port (443 for HTTPS)
        pathname: '/**',                      // Any path on the domain
      },
      {
        protocol: 'https',                    // Only allow HTTPS images
        hostname: 'res.cloudinary.com',       // Cloudinary image CDN service
        // No port or pathname = allow all paths on this domain
      },
    ],

    // CUSTOM IMAGE PROCESSING
    // Like implementing a custom IHttpHandler for image requests
    // Points to our custom image loader that handles optimization
    loader: 'custom',                        // Use custom loader instead of default
    loaderFile: './lib/image/loader.ts',     // Path to our custom image handler
  },

  // =============================================================================
  // HTTP SECURITY HEADERS CONFIGURATION
  // =============================================================================
  // Adds security headers to all HTTP responses from the application
  //
  // FOR .NET DEVELOPERS:
  // Like configuring custom headers in web.config:
  //   <system.webServer>
  //     <httpProtocol>
  //       <customHeaders>
  //         <add name="X-Frame-Options" value="SAMEORIGIN" />
  //       </customHeaders>
  //     </httpProtocol>
  //   </system.webServer>
  //
  // Or in .NET Core middleware:
  //   app.Use(async (context, next) => {
  //       context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
  //       await next();
  //   });
  //
  async headers() {
    return [
      {
        // APPLY TO ALL PAGES
        // '/:path*' matches any URL path (like /* wildcard in IIS)
        source: '/:path*',

        // SECURITY HEADERS TO ADD
        headers: [
          // CLICKJACKING PROTECTION
          // Prevents your site from being embedded in malicious iframes
          // 'SAMEORIGIN' = only allow embedding from same domain
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

          // CONTENT SECURITY POLICY FOR IFRAME EMBEDDING
          // Controls which domains can embed your site in iframes
          // 'self' = your own domain, '*.optimizely.com' = Optimizely CMS
          // This allows Optimizely CMS to show preview of your site
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.optimizely.com",
          },
        ],
      },
    ]
  },

  // =============================================================================
  // URL REDIRECT CONFIGURATION
  // =============================================================================
  // Maps incoming URLs to different internal URLs (URL rewriting)
  //
  // FOR .NET DEVELOPERS:
  // Like URL rewrite rules in web.config:
  //   <system.webServer>
  //     <rewrite>
  //       <rules>
  //         <rule name="Preview Redirect">
  //           <match url="^preview/(.*)" />
  //           <action type="Redirect" url="/api/draft{R:1}" />
  //         </rule>
  //       </rules>
  //     </rewrite>
  //   </system.webServer>
  //
  // Or in .NET Core:
  //   app.UseRewriter(new RewriteOptions()
  //       .AddRedirect(@"^preview/(.*)", "/api/draft$1"));
  //
  // PURPOSE:
  // - Optimizely CMS sends preview requests to /preview/... URLs
  // - We need to redirect these to our draft mode API at /api/draft
  // - This enables the preview functionality in Optimizely CMS
  //
  async redirects() {
    return [
      {
        // OPTIMIZELY CMS PREVIEW REDIRECT
        // When CMS sends user to /preview/something, redirect to /api/draft/something
        source: '/preview/:path*',           // Match: /preview/anything
        destination: '/api/draft:path*',     // Redirect to: /api/draft/anything
        permanent: true,                     // HTTP 301 redirect (cacheable)
      },
    ]
  },
}

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================
// Make this configuration available to Next.js build system
//
// FOR .NET DEVELOPERS:
// Like returning configuration from a method or setting up DI container:
//   public IConfiguration BuildConfiguration()
//   {
//       return new ConfigurationBuilder()
//           .AddJsonFile("appsettings.json")
//           .Build();
//   }
//
// Next.js automatically imports this file and uses these settings
// during build time and runtime.
//
export default nextConfig
