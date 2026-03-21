# Next.js Application Blueprint

## Overview
This file serves as the single source of truth for the Next.js Portfolio app, containing details on implemented features, styles, guidelines, and the plan for changes.

## Implemented Features & Architecture
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS with a comprehensive set of UI components
- **Routing:** Uses `/[locale]` file-based routing with support for multiple languages (e.g., 'en', 'zh').
- **Pages:**
  - About
  - Blog
  - Certificate
  - Contact
  - Portfolio (Amv Editing, Business Plans, Marketing In Motion, Marketing Plans, Photography)
- **API Routes:** Endpoints exist for fetching blogs, github data, marketing-in-motion data, etc.
- **Client Features:** Includes interactive components and forms (`contact-form.tsx`).
- **Dependencies:** React Icons, Vercel Analytics, React PDF, Framer Motion (assumed via animations), etc.

### Home Page Dynamic Translations
- **Issue**: The `src/app/[locale]/page.tsx` home page was completely hardcoded to English in all internal components, ignoring the active locale. Furthermore, the translation dictionaries lacked properties for the recently updated component designs (like the newest AI Showcase headers).
- **Fix**: Generated a node script to permanently append the missing translation tags securely into `en.json` and `zh.json`. We then heavily refactored `src/app/[locale]/page.tsx` so that `<Home />` extracts the `locale` from the browser path, parses the JSON via `getDictionarySync(locale)`, and hands the dictionary down to all section components (Hero, Expertise, AI Showcase, Skills, Certificate, CTA) allowing an instant real-time toggle between English and Chinese content.

### Blog Page Translations
- **Issue**: The dynamic routing version of the Blog listing (`src/app/[locale]/blog/page.tsx`) and Post (`src/app/[locale]/blog/[slug]/page.tsx`) were using hardcoded English strings for metadata, hero text, and breadcrumbs.
- **Fix**: Translated the texts and updated `en.json` and `zh.json` to include `"Digital Marketing Insights"` and other metadata labels. Refactored the blog pages to extract `props.params.locale`, dynamically resolve the dictionary using `getDictionary(locale)`, and passed the translated texts into the page `metadata` and components.

## Current Change Plan: Fix Application Startup
**Goal:** Fix the compilation errors preventing the app (and the Firebase Studio preview server) from running.

### Steps Executed
1. **Identify Error Output:**
   - Ran `npm run lint` and spotted many `@typescript-eslint/no-explicit-any` warnings/errors.
   - Ran `npm run build` which revealed a fatal Turbopack build error: `Module not found: Can't resolve './contact-form'` in `src/app/[locale]/contact/page.tsx`.
2. **Resolve Missing Module:**
   - Discovered that `contact-form.tsx` was entirely missing.
   - Created a new `src/app/[locale]/contact/contact-form.tsx` containing a responsive React Client Component using Tailwind CSS for styling.
3. **Resolve Typescript Error:**
   - Ran `build` again, found a TypeScript type overlap error in `src/app/[locale]/layout.tsx` at line 94 where `locale === 'ar'` was compared against a strictly typed `"en" | "zh"`.
   - Fixed the issue by asserting `(locale as string) === 'ar'`.
4. **Final Verification:**
   - Ran `npm run build` a final time, and the app compiled successfully.

### Additional Fixes (307 Redirect Loop)
- **Problem:** Infinite 307 loop for `/en` and `/zh` locales, and 404 for root path `/`.
- **Cause:** The `src/app/[locale]/page.tsx` incorrectly exported a `redirect('/en')` logic as its default export, burying the main `Home` component. This caused localized routes to continually redirect to themselves.
- **Resolution:** Removed the `RootPage` redirect from `src/app/[locale]/page.tsx` and exported the actual `Home` component. Created `src/app/page.tsx` to explicitly handle root (`/`) path redirects to the default locale. Rebuilt successfully without layout errors.

### Additional Fixes (Missing Global Styles / Tailwind)
- **Problem:** Tailwind styling was not applying to the home page or any other routes.
- **Cause:** `src/app/globals.css` (which contains `@tailwind` directives) was completely omitted from the root layout imports.
- **Resolution:** Added `import "@/app/globals.css";` to `src/app/[locale]/layout.tsx` to instantly restore all Tailwind directives and CSS variables across the application.

### Additional Fixes (Missing Header/Footer & Prefix-less Default Locale)
- **Problem:** Header and footer components were completely missing. The default English language was forced onto the `/en` path, cluttering the URL.
- **Resolution:** 
  1. Imported `<Header />` and `<Footer />` components directly into the body of `src/app/[locale]/layout.tsx`.
  2. Altered `middleware.ts` so that English default routes provide transparent `NextResponse.rewrite` responses instead of `NextResponse.redirect` responses. This ensures paths like `/about` render perfectly without physically redirecting to `/en/about`. Handled manual `/en` visits by redirecting back to root.
  3. Modified `basePath` dynamically in `Header.tsx` and `Footer.tsx` so that their navigation links appropriately render prefix-less URLs for English.

### Additional Fixes (Contact Page Dynamic Localization)
- **Problem:** The original `ContactFormZh` and `ContactForm` files provided richer animations and features (like HubSpot/Cloudflare integration and a character counter) but were split into separate files and the current deployed `contact-form.tsx` was just a basic placeholder.
- **Resolution:** 
  1. Merged the rich `ContactForm` component into `src/app/[locale]/contact/contact-form.tsx`.
  2. Integrated it with Next-Intl using `getDictionarySync(locale)` after extracting the locale via `usePathname()`.
  3. Replaced all hardcoded text with dictionary lookups (e.g., `t.heroTitle`, `t.submitSuccess`).
  4. Added missing "Find Me Online" / "社交媒体与专业平台" translation tags to `en.json` and `zh.json`.

*The app is now fully compiling, properly routing without loops, cleanly handling English prefix-less URLs, and displaying the globally fixed headers, footers, and dynamically localized Contact page components.*
