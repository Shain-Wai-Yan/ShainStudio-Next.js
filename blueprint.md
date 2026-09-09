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
- `/hobbies/gaming`: Gaming channel showcase featuring playthroughs, guides, YouTube channel integration, and video playback.
- `/contact`: Interactive contact gateway.

---

## 3. Current Task: Integrate Gaming Channel under Hobbies with Shared AMV Components

### Context & Goals
1. **Reuse Architecture & Assets:**
   - The gaming page (`/hobbies/gaming` and `/zh/hobbies/gaming`) shares visual layout, components (`AMVHeader`, `ChannelInfo`, `FeaturedVideo`, `VideoGrid`, `VideoModal`), and assets with `/hobbies/amv-editing`.
   - YouTube channel: **Shain Plays Games** (`UCxkWgKCJFMtjjq8vK9xTd6g`), handle `@shainplaygame`.
   - Specific featured video: `Iv4PM0YN5V8` (*Rathgricy Fallen Feather, A dream that has becoming a memory*).
   - Cloudflare Worker: active at `https://youtube-api-fetcher.shainstudio.workers.dev` which accepts dynamic `channelId` queries.

2. **Combined Metrics & Overview:**
   - The main `/hobbies` landing page will dynamically fetch statistics for both channels and display combined total YouTube views and total video counts within its existing 4-stat metric strip.
   - The pursuit list on `/hobbies` will feature `03 Gaming` with dynamic thumbnail from `Iv4PM0YN5V8` and cursor-following preview.

3. **Navigation & SEO:**
   - Update `Header.tsx` dropdown to include Gaming.
   - Update `sitemap.ts` to include `/hobbies/gaming`.
   - Add localized strings and metadata in `en.json` and `zh.json`.

### Action Plan
1. **YouTube Allowlist & Shared Utilities:**
   - Create `src/lib/youtube-channels.ts` with channel definitions for `amv` and `gaming`.
   - Generalize `src/lib/youtube-utils.ts` `transformVideoData` to support channel-specific tags.
   - Update `src/app/api/amv-editing/route.ts` to support allowlisted `channel=amv|gaming` queries.
2. **Generalize AMV Components:**
   - Update `AMVHeader.tsx` and `ChannelInfo.tsx` to accept channel-specific URLs, channel badges, and labels.
3. **Build Gaming Route:**
   - Create `src/app/[locale]/hobbies/gaming/page.tsx` with featured video priority logic.
   - Create `src/app/[locale]/hobbies/gaming/layout.tsx` with full localized SEO metadata.
4. **Localization, Navigation, and Hobbies Landing Page:**
   - Update `en.json` and `zh.json` with `nav.gaming` and `gaming` dictionary sections.
   - Update `Header.tsx` `hobbyItems` with Gaming link.
   - Update `src/app/[locale]/hobbies/page.tsx` to fetch both channels and display combined stats and 3rd pursuit item.
   - Update `src/app/sitemap.ts` with `/hobbies/gaming`.
5. **Verification:**
   - Run `npm test`, `npx tsc --noEmit`, and `npm run lint`.

---

## 4. Current Task: Minimalist & Polished Redesign of YouTube Channel Previews

### Context & Motivation
The previous channel preview component (`ChannelInfo.tsx`) was dated: a heavy rectangular banner with an overlapping circular avatar, harsh generic red `#FF0000` button, and basic chips. The user requested a creative, polished, minimalist redesign matching the studio's luxury aesthetic.

### Creative Minimalist Concept: "The Modern Editorial Channel Dossier"
1. **Atmospheric Silhouette & Frame:**
   - Rounded-3xl glassmorphic card with subtle backdrop blur (`bg-white/70 dark:bg-[#11121c]/80 border-neutral-200/80 dark:border-white/10`).
   - Ambient lighting: subtle blurred backdrop glow reflecting channel banner colors.
2. **Cinematic Panoramic Window:**
   - Wide aspect-ratio banner window with smooth hover scale (`group-hover:scale-105 transition-transform duration-1000`).
   - Integrated fine-art gradient masks eliminating harsh photo edges.
   - Floating status chips: pulsing live creator indicator ("Official Channel") and handle badge (`@channel`).
3. **Creator Identity & Verification:**
   - Crisp squircle/rounded avatar with double ring (`ring-4 ring-white dark:ring-[#11121c]`) and golden verified creator shield.
   - Editorial serif typography (`Playfair Display`) for channel titles.
   - Subtle expandable bio with high-legibility typographic scale.
4. **Minimalist Typographic Stats Strip:**
   - 3 architectural metric counters: Subscribers, Public Videos, Total Views.
   - Bold serif numbers with tracked uppercase labels (`SUBSCRIBERS`, `VIDEOS`, `TOTAL VIEWS`) separated by hairline dividers.
5. **Sleek Minimalist Action Controls:**
   - Luxury Subscribe pill button (midnight in light mode, crisp white/gold in dark mode) with YouTube play glyph and hover glide arrow (`↗`).
   - Interactive "Copy Channel Link" action button with toast/copied feedback tooltip.
6. **Loading Skeleton:**
   - Shimmer skeleton perfectly matching the new minimalist proportions.

### Action Plan
1. **Upgrade `ChannelInfo.tsx`:**
   - Implement the modern editorial channel dossier design.
   - Add interactive copy-link functionality, description read-more toggle, and accessible aria attributes.
2. **Enhance Parent Callers (`amv-editing/page.tsx` & `gaming/page.tsx`):**
   - Pass `customUrl` and `viewCount` into `setChannelData` and `mockChannelData`.
   - Pass localized labels (`subscribersLabel`, `videosLabel`, `viewsLabel`, `subscribeLabel`).
3. **Verify:**
   - Typecheck (`npx tsc --noEmit`), test suite (`npm test`), lint (`npm run lint`).

---

## 5. Current Task: Compact & Space-Efficient Individual Card Redesign

### Context & Motivation
The user noted that individual cards take up too much vertical and horizontal space ("make it compact, i cant give huge space for each cards design properly"). In `VideoGrid.tsx`, a 3-column layout with 400px+ cards and heavy padding pushed content too far down and created bloated footprints.

### Compact Minimalist Design Principles
1. **High-Density 4-Column Grid:**
   - Transition from 3 chunky columns to a sleek 4-column responsive grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5`).
   - Drastically cuts the excessive card height and fits more content gracefully above the fold.
2. **Compact Video Card Geometry:**
   - Slim 16:9 thumbnail with rounded-2xl corners, subtle glass duration tag, and a refined 40px play hover overlay instead of the bloated 56px circle.
   - Tight padding (`p-3.5`), concise 2-line title with balanced line-height, and single-line metadata (`views · date`).
   - Fluid micro-interactions: gentle scale on hover, glassmorphic backdrop (`bg-white/75 dark:bg-[#141520]/80`), hairline borders.
3. **Space-Efficient Page Alignment:**
   - Tighten `ChannelInfo.tsx` banner and avatar proportions (`h-36 sm:h-44 md:h-52`) to conserve vertical space.
   - Compact `FeaturedVideo.tsx` player height and margins.
4. **Loading Skeletons:**
   - Match the compact 4-column layout for smooth visual consistency.

### Action Plan
1. **Redesign `VideoGrid.tsx`:**
   - Implement 4-column grid layout with compact card anatomy and tight typography.
   - Update loading skeleton to match 4-column proportions.
2. **Refine Proportions in `ChannelInfo.tsx` & `FeaturedVideo.tsx`:**
   - Ensure clean vertical balance across the entire page without unnecessary whitespace.
3. **Verification:**
   - Run `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build`.

---

## 6. Current Task: Uncropped, Non-Stretched Featured Video Thumbnail Fix

### Context & Motivation
The user noted that the featured video box was stretching and cropping their thumbnail ("i dont want that feature video box to be strentch and cropped my thumbnail so i need proper thumbnail fully visible there").

### Root Causes
1. **Unconstrained Aspect Ratio in Grid:** In `FeaturedVideo.tsx`, the video container used `md:aspect-auto`, forcing the video column to stretch to the variable text height of the adjacent info panel, turning a 16:9 thumbnail into an arbitrary 2.4:1 ultra-wide box.
2. **`object-cover` and Zoom:** `object-cover` together with `scale-105` and a bottom gradient fade was cropping out 25%+ of the thumbnail art and covering the bottom.
3. **Low-Resolution 4:3 Fallback:** Standard YouTube `hqdefault.jpg` thumbnails have built-in black letterboxes.

### Solution
1. **Lock True 16:9 Ratio:** Video player column uses strict `aspect-video` across all breakpoints.
2. **`object-contain` + Ambient Glow:** Render the main thumbnail with `object-contain` so 100% of the image is fully visible without a single pixel cropped or stretched, supported by an ambient blurred backdrop.
3. **Remove Disruptive Overlays:** Eliminate `scale-105` zoom and the bottom gradient fade.
4. **HD Thumbnail Resolution:** Try `maxresdefault.jpg` (1280x720 16:9) first with graceful `onError` fallback to `thumbnailUrl`.
5. **Responsive Stacking:** Use `lg:grid-cols-12` (7 cols video, 5 cols info) so tablets and mobile display the video cleanly stacked without squishing.

---

## 7. Compact Channel Info Card & Intelligent "See More" Visibility

### Context & Motivation
1. The user pointed out that on the AMV channel ("I do some simple edits......."), a "Read more" button was appearing even though there was zero additional content to expand.
2. On the Gaming channel, raw `line-clamp-2` was stripping linebreaks in collapsed mode, forcibly squashing and wrapping multiple distinct paragraphs together into run-on sentences with ellipses to "fit" 2 lines.
3. The user requested:
   - "if there is nothing to show dont make see more button appear"
   - "dont warapped the description just to fit only show what appear and the rest only shown when there was pressed in see more"

### Solution & Key Changes
1. **Intelligent Hidden Content Detection:**
   - Evaluates non-blank line count (`nonBlankLines`) and paragraph lengths from `data.description.trim()`.
   - `hasHiddenContent` is strictly `true` ONLY when:
     - The channel has more than 2 non-blank paragraphs (`nonBlankLines.length > 2`), OR
     - A single paragraph exceeds ~140 characters, OR
     - Two lines exceed ~150 combined characters.
   - For single-line or short descriptions (e.g. AMV channel's `"I do some simple edits......."`), `hasHiddenContent` evaluates to `false`, and NO "See more" toggle is rendered.
2. **Natural Non-Wrapped Collapsed View:**
   - In collapsed mode, `ChannelInfo.tsx` displays ONLY the natural first 1–2 lines (`nonBlankLines.slice(0, 2).join('\n')`), preserving authentic `whitespace-pre-line` formatting.
   - Subsequent paragraphs (e.g., separator dots, upload schedules, links) are never squashed or wrapped into the preview.
   - They are revealed in full only when "See more" is pressed.
3. **Button Phrasing & Localization:**
   - Standardized to "See more" / "Show less" (and "展开" / "收起" in Chinese), matching user preference.
4. **Preserved Profile & Panoramic Showcase:**
   - Panoramic banner, avatar status rings, subscription CTA, and 3-column stats strip remain untouched and compact.

---

## 8. Mobile-Friendly Featured Video Fix: Preventing Horizontal Layout Blowout

### Context & Motivation
The featured video card on the Gaming page broke on mobile screens: the card stretched far beyond the viewport width, clipping the title and tags on the right, and causing the 16:9 thumbnail to balloon vertically to ~400px with its sides cropped off, while the AMV page displayed cleanly.

### Root Cause
1. **Unbroken Long URLs in Description:** The Gaming featured video description contains long continuous URLs (e.g. `https://ragnaroketernallove.onelink.me/...` and `https://discord.com/channels/...`).
2. **CSS Grid `min-width: auto` Default:** Without `min-w-0` on the grid container and column tracks, CSS grid items cannot shrink below their content width. The unbreakable URLs forced the info panel and the parent grid to expand to 700px+ on mobile.
3. **Inflated `aspect-video` Height:** Because the grid was inflated to 700px+, the `aspect-video` video player scaled its height to `700 * 9 / 16 = ~390px`. On a 375px mobile screen, only the left half was visible, causing it to appear like a tall, side-cropped vertical image with the play button pushed near the right edge.

### Solution
1. **Grid Constraints & `min-w-0`:** Added `min-w-0 w-full max-w-full overflow-hidden` to the section, card grid, video player column, and info panel column in `FeaturedVideo.tsx`.
2. **URL Word-Breaking:** Added `break-words [overflow-wrap:anywhere] break-all` to the description and `break-words [overflow-wrap:anywhere]` to the title, guaranteeing long URLs and unspaced words wrap cleanly at the mobile screen edge.
3. **Tag Safety:** Added `min-w-0` to the tags wrapper and `max-w-full truncate` to tag pills.
4. **Page Container Bounds:** Added `overflow-x-hidden` on `<main>` and `w-full min-w-0` on the page container in both `gaming/page.tsx` and `amv-editing/page.tsx`.

---

## 9. Clean Direct Component Renaming: `src/components/video-channel/`

### Context & Motivation
Since the video components are shared by both `/hobbies/amv-editing` and `/hobbies/gaming` (and any future video channel pages), they were cleanly renamed and relocated under `src/components/video-channel/`. Unnecessary legacy re-export folders and barrel files were completely removed to keep the architecture simple and direct.

### Clean Structure (`src/components/video-channel/`)
- `ChannelHeader.tsx` (renamed from `AMVHeader.tsx`): Generalized header component with channel badge, count, and title.
- `ChannelInfo.tsx`: Full dossier channel card with panoramic banner, avatar, verified shield, and clamped bio.
- `FeaturedVideo.tsx`: 16:9 spotlight video player with uncropped thumbnail and URL word-wrap.
- `VideoGrid.tsx`: Responsive 4-column video catalog grid with search and pagination.
- `VideoModal.tsx`: Accessible modal video player.

### Clean Consumer Imports
Both `src/app/[locale]/hobbies/amv-editing/page.tsx` and `src/app/[locale]/hobbies/gaming/page.tsx` import directly from `@/components/video-channel/...`. The old `src/components/amv-editing/` folder has been completely deleted.

---

## 10. Unified API Route: `/api/youtube`

### Context & Motivation
Following the component generalization under `video-channel/`, the API route naming was generalized from the channel-specific `/api/amv-editing` to a unified `/api/youtube` route supporting all channels (`channel=amv`, `channel=gaming`).

### Key Changes
1. **New Route (`src/app/api/youtube/route.ts`):**
   - Full support for `endpoint=channel` and `endpoint=videos` with channel allowlisting (`getYouTubeChannelConfig`).
   - Cloudflare edge proxying with token pagination and upstream error handling.
2. **Page Updates:**
   - Both `/hobbies/amv-editing` and `/hobbies/gaming` now fetch from `/api/youtube?channel=amv` and `/api/youtube?channel=gaming`.
3. **Removal of Deprecated Route:**
   - Deleted `src/app/api/amv-editing/route.ts` and its enclosing directory since all callers have transitioned to `/api/youtube`.
   - Updated `scripts/audit-regressions.cjs` Test 25 to assert that the deprecated route has been deleted and that `/api/youtube` handles fail-closed proxying with zero mutation endpoints.
