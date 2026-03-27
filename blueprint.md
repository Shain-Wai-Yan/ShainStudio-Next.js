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


### Additional Fixes (Business Plans Routing & Translation)
- **Problem:** The `zh/portfolio/business-plans/page.tsx` was experiencing a 404 error during navigation, primarily because the in-page `<Breadcrumb>` component hardcoded the link hrefs to absolute paths like `/portfolio/business-plan` without respecting the current locale, and the content itself was entirely hardcoded in English instead of using `next-intl`.
- **Resolution:**
  1. Refactored `src/app/[locale]/portfolio/business-plans/page.tsx` to dynamically fetch the dictionary using `useParams()` and `getDictionarySync(locale)`.
  2. Changed the breadcrumb links to dynamically prepend the `/${locale}` path prefix, securely routing back and forth without 404 errors.
  3. Replaced the hardcoded page titles, descriptions, and empty states with the correct `t.businessPlans.title` dictionary maps.
  4. Added the missing `"emptyMessage": "No business plans available at this time."` (and the exact Chinese exact strings provided by the user) into both `en.json` and `zh.json`.


### Additional Fixes (Portfolio Page Dynamic Localization)
- **Problem:** The `src/app/[locale]/portfolio/page.tsx` was primarily hardcoded in English, ignoring the active locale, and lacked a dictionary object for all of its complex nested translations (such as the Marquee array, statistics, CTA buttons, and individual portfolio item texts).
- **Resolution:**
  1. Created a robust node script to cleanly inject a new `portfolioPage` localization object globally into both `en.json` and `zh.json`, transferring all 50+ lines of English hardcoded texts and the corresponding Chinese translations the user provided.
  2. Substantially refactored `portfolio/page.tsx` to utilize `getDictionarySync(locale)`.
  3. Integrated dynamic JSON translation mapping into all components (Hero, Marquee, CTA Cards) and rebuilt the `ITEMS` array logic inside the main component to pass translation fields (like `href={`/${locale}/portfolio/business-plans`}`) individually to the tilt cards.
  4. Now the portfolio page toggles flawlessly between English text layouts with `Bebas Neue` fonts and Chinese layouts with `ZCOOL XiaoWei` fonts.

### Coding Projects Page Dynamic Localization
- **Problem:** The `src/app/[locale]/portfolio/coding-projects/page.tsx` was actually split into two separate hardcoded files (English and Chinese versions) that used hardcoded components like `GithubGalleryZH.tsx` instead of leveraging dynamic json translations.
- **Resolution:**
  1. Consolidated the English and Chinese page logic into a single `page.tsx` that extracts the `locale` and passes `getDictionarySync(locale)` to the components.
  2. Augmented `en.json` and `zh.json` to include comprehensive GitHub API translations (`codingProjects` mapping).
  3. Refactored the core `GithubGallery.tsx` and all of its extensive sub-components (`ContributionsGraph`, `PinnedRepositories`, `ProgrammingLanguages`, `Detailedactivity`, `RepositoriesList`) to dynamically use dictionary strings instead of hardcoded English texts or separate files.
  4. Elegantly deleted the now-redundant `GithubGalleryZH.tsx` as the main component is now fully bilingual.

### Marketing Plans Page Refactoring & SEO
- **Problem:** The Marketing Plans portfolio page was fully hardcoded in English and Chinese, isolated from global dictionaries, and lacked dynamic SEO Metadata integration.
- **Resolution:**
  1. Extracted all conversational UI strings (H1, Subtitles, Grid empties) and SEO fields into `en.json` and `zh.json` mapping.
  2. Engineered a robust Server Component layout (`src/app/[locale]/portfolio/marketing-plans/page.tsx`) utilizing `generateMetadata()` for dynamic perfect SEO resolution.
  3. Decoupled the reactivity and API interaction logic into a new `MarketingPlanClient.tsx` component that efficiently consumes the localized dictionaries.

### Additional Fixes (Syntax AI Widget Responsiveness & Styling)
- **Problem:** The `SyntaxWidget.tsx` was unresponsive and used generic colors, failing to match the brand's luxury aesthetic.
- **Resolution:**
  1. **Responsive Design:** Updated iframe and button classes to scale perfectly between mobile (`w-[calc(100vw-2rem)]`) and desktop (`md:w-[400px]`).
  2. **Luxury Styling:** Transformed the button into a "Minimalist Luxury" component using the brand's `Midnight Blue` and `Gold` palette.
  3. **Visual Effects:** Implemented `bg-luxury-midnight` gradients, `border-gold/30` accents, and `shadow-luxury` with glowing `shadow-gold-lg` on hover.
  4. **Animations:** Added `animate-gold-pulse` for the icon and `animate-fade-in-up` for the chat window to create a premium, interactive feel.
  5. **Component Structure:** Wrapped the iframe in a `bg-luxury-gold` gradient border to make it stand out against any background.
  6. **Instant Performance:** Refactored the widget to stay mounted in the DOM at all times. Instead of conditional rendering, it uses CSS (`opacity`, `scale`, `pointer-events`) for transitions. This ensures the chat loads instantly after the first render and preserves all message history even when the UI is hidden.
  7. **Keyboard Compatibility:** Employed `dvh` (Dynamic Viewport Height) units for the mobile chat window. This ensures the interface resizes automatically when the on-screen keyboard appears, preventing the bottom of the chat from being cut off or overlapped on iOS/Android devices.
  8. **Security & Privacy:** Hardened the iframe with a strict `sandbox` (limiting to `allow-scripts allow-forms allow-popups`) and a `strict-origin-when-cross-origin` referrer policy to protect user data.
  9. **Resilience & Perceived Performance:** Integrated an `isLoading` state with a premium pulsed overlay ("Initializing AI") for smooth perceived performance.
  10. **Reliable Recovery:** Implemented a forced-remount mechanism using a React `key` state. This ensures the "Reconnect AI" button truly requests a fresh iframe instance if a connection error occurs.

### Microsoft Clarity Analytics Integration
- **Problem:** Needed a professional behavioral analytics solution to track user interactions and session replays without complex manual setup.
- **Resolution:**
  1. **NPM Integration:** Installed `@microsoft/clarity` and configured it using the "Over-Engineered" best practice for Next.js App Router (Client Component initialization within a Server Layout).
  2. **Organized Architecture:** Created a dedicated `src/components/analytics` folder to house all tracking-related components.
  3. **Clarity Component:** Engineered `ClarityAnalytics.tsx` to safely initialize Clarity in the browser using the `NEXT_PUBLIC_CLARITY_ID` environment variable.
  4. **Custom Events:** Developed a reusable `TrackedLink.tsx` component to capture high-value user actions.
  5. **Global Tracking:** Injected custom event triggers into key home page buttons:
     - `view_portfolio_hero`: Tracks "View My Portfolio" clicks in the Hero section.
     - `get_in_touch_hero`: Tracks "Get In Touch" clicks in the Hero section.
     - `view_portfolio_ai_showcase`: Tracks "See AI Marketing in Action" clicks.
     - `get_in_touch_cta`: Tracks "Get In Touch" clicks in the final CTA section.
- **Result:** The application now provides deep behavioral insights (heatmaps, replays) and tracks key conversion metrics while maintaining a clean, scalable codebase.

*The app is now fully compiling, properly routing without loops, cleanly handling English prefix-less URLs, and featuring a robust Microsoft Clarity behavioral analytics suite.*
