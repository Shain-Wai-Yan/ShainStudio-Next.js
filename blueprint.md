# Project Blueprint: Shain Studio Portfolio

## 1. Overview & Purpose
Shain Studio is the personal portfolio of Shain Wai Yan (Xolbine, 明元易), a Technical Marketer and MarTech specialist. The application showcases technical marketing work, MarTech engineering, AI-driven automation, creative technology, and personal hobbies.

Built on Next.js 16 (App Router), React 19, Tailwind CSS v4, and integrated with Strapi CMS and YouTube Data APIs, the portfolio presents an editorial, high-performance experience with strict internationalization (English & Chinese), SEO optimization, and rich theme styling (light mode and dark mode).

---

## 2. Project Architecture & Feature Outline

### Core Tech Stack
- **Framework:** Next.js 16 (App Router with dynamic `[locale]` routing: `en` root, `/zh` for Chinese)
- **Styling:** Tailwind CSS v4 with custom design tokens (`--color-midnight`, `--color-gold`, etc.)
- **Theming:** `next-themes` with class-based `.dark` mode and system fallback
- **CMS & Backend:** Strapi v5 (Cloudinary asset storage) & YouTube Data API
- **Fonts:** Inter (`--font-sans`) and Playfair Display (`--font-serif`)

### Key Routes & Features
- `/` & `/zh`: Home landing page.
- `/about`: Professional journey, technical skill matrix, and philosophy.
- `/portfolio`: Client projects, case studies, and marketing systems.
- `/hobbies`: Personal creative studio hub for hobbies with interactive cursor-following pursuit previews.
- `/hobbies/photography`: Curated photography gallery with hybrid SSR (ISR 3600), infinite scroll, collections filtering, virtualized masonry grid, and lightbox.
- `/hobbies/amv-editing`: Video editing showcase featuring YouTube channel integration and video playback.
- `/contact`: Interactive contact gateway.

---

## 3. Current Task: Fix Deep-Link URL State, Filter Flashing, and CSS Utilities in Photography Gallery

### Context & Issues Addressed
1. **URL Query Parameter Stripping on Deep Links:**
   - On initial mount of `PhotographyGallery`, the URL state synchronization effect previously ran before initial query params were processed, triggering a `replaceState` that temporarily wiped parameters like `?collection=portrait` or `?q=search` from the URL bar before re-adding them.
   - Fix: Introduce `isInitialUrlSyncRef` to prevent `replaceState` from executing on initial mount, preserving incoming deep-link query parameters without URL flicker or history corruption.

2. **Filtered Deep-Link Photo Flash:**
   - Visiting a deep link with a collection filter (e.g., `?collection=travel`) previously caused the gallery to briefly display the 24 unfiltered SSR photos, then abruptly clear them and re-fetch for the filtered collection.
   - Fix: In the mount data-fetching effect, inspect `window.location.search`. If a filter is present, bypass the SSR cache retention and immediately fetch the targeted collection/search feed.

3. **Tailwind CSS Utility Cleanup:**
   - Correct invalid Tailwind classes `py-0.2` in `PhotographyGallery.tsx` pill badges to valid `py-0.5` utilities.

### Action Plan
1. **Update `PhotographyGallery.tsx`:**
   - Add `isInitialUrlSyncRef = useRef(true)` to guard `window.history.replaceState`.
   - Update mount check to verify `!urlCollection && !urlSearch` before committing to the unfiltered SSR feed.
   - Replace `py-0.2` with `py-0.5`.
2. **Verify with Typecheck, Lint, and Regression Suite:**
   - Run `tsc --noEmit`, `eslint`, and `node --test scripts/*.cjs` to guarantee 0 regressions.
