# Shain Wai Yan Portfolio — Complete App Architecture

## Overview

A bilingual (English & Chinese) personal portfolio website built with **Next.js 16 (App Router)**. It features a blog, project showcase, certificates display, photography gallery, AMV editing portfolio, and a coding-projects section powered by GitHub. All pages are served through a single unified `[locale]` dynamic route — there is **no separate `/zh/` page folder**. The site uses **Strapi** as a headless CMS, **GSAP** for animations, and **next-themes** for dark/light mode.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| React | React 19.2.3 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| CMS | Strapi (Headless, self-hosted on Render) |
| Deployment | Vercel |
| Animation | GSAP 3.15 + @gsap/react |
| Theme | next-themes 0.4.6 (dark / light mode) |
| Icons | Font Awesome 7, React Icons 5, Simple Icons 13, Lucide React |
| Analytics | Google Analytics 4 (GA4), Microsoft Clarity |
| Performance | @vercel/analytics, @vercel/speed-insights |
| Image CDN | Cloudinary (custom loader) |
| PDF | react-pdf 10 |
| Sanitisation | isomorphic-dompurify |

---

## Project Structure

```
/
├── middleware.ts              # Locale detection & legacy route redirects
├── next.config.ts             # Next.js config (security headers, rewrites, image domains)
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment config
├── ARCHITECTURE.md            # This file
├── README.md                  # Project setup guide
├── IMPLEMENTATION_COMPLETE.md # Historical i18n implementation notes
├── I18N_SETUP.md              # Detailed i18n setup guide
├── I18N_QUICK_START.md        # i18n quick-start reference
├── worker-documentation.md    # Web worker documentation
│
├── public/
│   └── images/
│       ├── Shain Studio.png   # Favicon/Logo
│       ├── profile.jpeg       # Profile image
│       └── certificate-bg.jpg # Certificate background
│
└── src/
    ├── app/                   # Next.js App Router
    ├── components/            # Reusable React components
    ├── lib/                   # Utilities & API clients
    ├── locales/               # i18n translation JSON files
    └── types/                 # Shared TypeScript type definitions
```

---

## App Router Structure (`src/app/`)

```
src/app/
├── globals.css                # Global styles (Tailwind base + custom)
├── favicon.ico                # Favicon
├── not-found.tsx              # Global 404 page
├── sitemap.ts                 # Dynamic sitemap generator (30+ URLs)
├── robot.ts                   # Robots.txt configuration
│
├── api/
│   ├── youtube/
│   │   └── route.ts           # GET /api/youtube — Unified YouTube channel & videos proxy (AMV, Gaming)
│   ├── blogs/
│   │   ├── route.ts           # GET /api/blogs — Blog list from Strapi
│   │   └── [slug]/
│   │       └── route.ts       # GET /api/blogs/:slug — Single blog post
│   ├── business-plans/
│   │   └── route.ts           # GET /api/business-plans — Business plans from Strapi
│   ├── coding-projects/
│   │   └── route.ts           # GET /api/coding-projects — Coding projects from Strapi
│   ├── github/
│   │   └── route.ts           # GET /api/github — GitHub profile & repos
│   ├── marketing-in-motion/
│   │   └── route.ts           # GET /api/marketing-in-motion — Marketing projects
│   ├── marketing-plans/
│   │   └── route.ts           # GET /api/marketing-plans — Marketing plans from Strapi
│   └── photography/
│       └── route.ts           # GET /api/photography — Photography data from Strapi
│
└── [locale]/                  # Dynamic locale segment — handles EN (/) and ZH (/zh)
    ├── layout.tsx             # Locale-aware root layout (Header, Footer, ThemeProvider, GA, Clarity)
    ├── page.tsx               # / or /zh — Homepage (GSAP-animated landing)
    │
    ├── about/
    │   └── page.tsx           # /about or /zh/about
    │
    ├── blog/
    │   ├── page.tsx           # /blog — Blog listing
    │   └── [slug]/
    │       └── page.tsx       # /blog/:slug — Individual blog post
    │
    ├── certificate/
    │   └── page.tsx           # /certificate — Certificates showcase
    │
    ├── contact/
    │   ├── page.tsx           # /contact — Contact page & form
    │   └── actions.ts         # Server Actions for contact form
    │
    ├── privacy/
    │   └── page.tsx           # /privacy — Privacy policy
    │
    ├── terms/
    │   └── page.tsx           # /terms — Terms of service
    │
    └── portfolio/
        ├── page.tsx           # /portfolio — Portfolio hub (GSAP scroll gallery)
        │
        ├── amv-editing/
        │   ├── layout.tsx     # Dynamic generateMetadata per locale
        │   └── page.tsx       # /portfolio/amv-editing
        │
        ├── business-plans/
        │   └── page.tsx       # /portfolio/business-plans
        │
        ├── coding-projects/
        │   ├── page.tsx       # /portfolio/coding-projects — Project listing
        │   ├── [slug]/
        │   │   └── page.tsx   # /portfolio/coding-projects/:slug — Project detail
        │   └── archive/
        │       └── page.tsx   # /portfolio/coding-projects/archive — All projects
        │
        ├── marketing-in-motion/
        │   ├── page.tsx       # /portfolio/marketing-in-motion — Listing
        │   └── [slug]/
        │       └── page.tsx   # /portfolio/marketing-in-motion/:slug — Detail
        │
        ├── marketing-plans/
        │   └── page.tsx       # /portfolio/marketing-plans
        │
        └── photography/
            └── page.tsx       # /portfolio/photography
```

> **Key point:** English is served at `/` (locale = `en`) and Chinese at `/zh` (locale = `zh`). Both use the **exact same page files** inside `[locale]/`. Zero file duplication.

---

## URL Structure

| Page | English URL | Chinese URL |
|------|-------------|-------------|
| Home | `/` | `/zh` |
| About | `/about` | `/zh/about` |
| Blog (listing) | `/blog` | `/zh/blog` |
| Blog post | `/blog/:slug` | `/zh/blog/:slug` |
| Certificate | `/certificate` | `/zh/certificate` |
| Contact | `/contact` | `/zh/contact` |
| Privacy Policy | `/privacy` | `/zh/privacy` |
| Terms of Service | `/terms` | `/zh/terms` |
| Portfolio Hub | `/portfolio` | `/zh/portfolio` |
| AMV Editing | `/portfolio/amv-editing` | `/zh/portfolio/amv-editing` |
| Marketing in Motion | `/portfolio/marketing-in-motion` | `/zh/portfolio/marketing-in-motion` |
| Marketing Project Detail | `/portfolio/marketing-in-motion/:slug` | `/zh/portfolio/marketing-in-motion/:slug` |
| Marketing Plans | `/portfolio/marketing-plans` | `/zh/portfolio/marketing-plans` |
| Business Plans | `/portfolio/business-plans` | `/zh/portfolio/business-plans` |
| Coding Projects | `/portfolio/coding-projects` | `/zh/portfolio/coding-projects` |
| Coding Project Detail | `/portfolio/coding-projects/:slug` | `/zh/portfolio/coding-projects/:slug` |
| Coding Projects Archive | `/portfolio/coding-projects/archive` | `/zh/portfolio/coding-projects/archive` |
| Photography | `/portfolio/photography` | `/zh/portfolio/photography` |

---

## Components (`src/components/`)

### Global / Shared Components

| File | Description |
|------|-------------|
| `Header.tsx` | Responsive bilingual site header with nav + theme toggle |
| `Footer.tsx` | Site footer — fully localized via `getDictionarySync` |
| `Breadcrumb.tsx` | Breadcrumb navigation (SEO + UX) |
| `LanguageSwitcher.tsx` | Language toggle button (EN ↔ ZH) |
| `ThemeProvider.tsx` | `next-themes` provider wrapper (dark/light mode) |
| `ThemeToggle.tsx` | Dark/light mode toggle button |
| `AnimatedCounter.tsx` | GSAP-animated number counter |
| `HeroTypewriter.tsx` | Typewriter text animation component |
| `ScrollAnimator.tsx` | Scroll-triggered animation wrapper |
| `NotFoundClient.tsx` | 404 page client component |
| `MarTechStack.tsx` | Marketing tech stack display |
| `DocumentCard.tsx` | Document preview card |
| `DocumentGrid.tsx` | Document grid layout |
| `DocumentViewer.tsx` | PDF/Document viewer modal |

### Analytics Components (`components/analytics/`)
| File | Description |
|------|-------------|
| `ClarityAnalytics.tsx` | Microsoft Clarity integration |
| `TrackedLink.tsx` | GA4-tracked anchor link wrapper |

### About Components (`components/about/`)
| File | Description |
|------|-------------|
| `ScrollRevealText.tsx` | GSAP scroll-reveal text animation |

### Landing (Homepage) Components (`components/landing/`)
| File | Description |
|------|-------------|
| `GsapHero.tsx` | Full-screen GSAP-animated hero section |
| `GsapBento.tsx` | Bento grid layout with GSAP animations |
| `GsapCta.tsx` | Animated call-to-action section |
| `GsapMarketing.tsx` | Marketing showcase section with scroll animations |
| `GsapMarquee.tsx` | Infinite-scrolling marquee (GSAP) |
| `GsapStats.tsx` | Animated statistics/numbers section |
| `SplitTextTitle.tsx` | GSAP split-text title animation |

### Portfolio Components (`components/portfolio/`)
| File | Description |
|------|-------------|
| `PortfolioClient.tsx` | Portfolio hub client — GSAP horizontal scroll gallery + project cards |

### Video Channel Components (`components/video-channel/`)
| File | Description |
|------|-------------|
| `ChannelHeader.tsx` | Page hero & channel title / video count badge |
| `ChannelInfo.tsx` | YouTube channel information, panoramic banner & stats |
| `FeaturedVideo.tsx` | Featured/highlighted video spotlight player |
| `VideoGrid.tsx` | Responsive video thumbnail grid with search |
| `VideoModal.tsx` | Accessible video lightbox modal player |

### Blog Components (`components/blog/`)
| File | Description |
|------|-------------|
| `BlogCard.tsx` | Blog post card (listing view) |
| `BlogFilterBar.tsx` | Category/tag filter controls |
| `BlogGrid.tsx` | Grid layout for blog posts |
| `BlogHero.tsx` | Blog page hero section |
| `BlogListingClient.tsx` | Client-side blog listing wrapper |
| `BlogPostContent.tsx` | Blog post body content renderer |
| `BlogPostHeader.tsx` | Blog post title & metadata |
| `BlogSearch.tsx` | Search input component |
| `BlogSearchClient.tsx` | Client-side search logic |
| `RelatedPosts.tsx` | Related posts suggestion section |

### Certificate Components (`components/certificates/`)
| File | Description |
|------|-------------|
| `CertificateCard.tsx` | Individual certificate card |
| `CertificateMarquee.tsx` | Auto-scrolling certificate carousel |
| `CertificateModal.tsx` | Certificate detail modal |
| `CertificateRow.tsx` | Certificate row layout |

### Coding Projects Components (`components/coding-project/`)
| File | Description |
|------|-------------|
| `CodingProjectArchiveClient.tsx` | Archive page client — full projects list with filters |
| `CodingProjectCard.tsx` | Project card (grid view) |
| `CodingProjectContent.tsx` | Project detail body content |
| `CodingProjectControls.tsx` | Filter & sort controls for projects |
| `CodingProjectGallery.tsx` | Project image/screenshot gallery |
| `CodingProjectGrid.tsx` | Projects grid layout |
| `CodingProjectHeader.tsx` | Project detail page header |
| `CodingProjectShelf.tsx` | Featured/shelf view of coding projects |
| `ContributionsGraph.tsx` | GitHub contributions heatmap |
| `Detailedactivity.tsx` | Detailed GitHub activity breakdown |
| `GithubGallery.tsx` | GitHub projects gallery |
| `GithubProfileHeader.tsx` | GitHub profile header |
| `PinnedRepositories.tsx` | Pinned repos showcase |
| `ProgrammingLanguages.tsx` | Language statistics visualization |
| `RelatedCodingProjects.tsx` | Related coding projects suggestions |
| `RepoViewer.tsx` | Repository detail viewer (README render) |
| `RepositoriesList.tsx` | Repositories list view |

### Marketing in Motion Components (`components/marketing-in-motion/`)
| File | Description |
|------|-------------|
| `MarketingControls.tsx` | Filter & sort controls |
| `MarketingHero.tsx` | Page hero section |
| `MarketingInMotionClient.tsx` | Client-side listing wrapper |
| `MarketingProjectCard.tsx` | Project card (grid view) |
| `MarketingProjectGrid.tsx` | Projects grid layout |
| `ProjectContent.tsx` | Project detail content |
| `ProjectGallery.tsx` | Project image gallery |
| `ProjectHeader.tsx` | Project detail header |
| `RelatedProjects.tsx` | Related projects suggestions |

### Marketing Plans Components (`components/marketing-plans/`)
| File | Description |
|------|-------------|
| `MarketingPlanClient.tsx` | Client-side marketing plans viewer |

### Business Plans Components (`components/business-plans/`)
| File | Description |
|------|-------------|
| *(uses shared `DocumentCard`, `DocumentGrid`, `DocumentViewer`)* | |

### Photography Components (`components/photography/`)
| File | Description |
|------|-------------|
| `MasonryGrid.tsx` | Masonry photo layout |
| `PhotoCard.tsx` | Photo card |
| `PhotoLightbox.tsx` | Full-screen photo lightbox |
| `PhotographyGallery.tsx` | Main gallery wrapper |

### UI Primitives (`components/ui/`)
| File | Description |
|------|-------------|
| `CImage.tsx` | Cloudinary-optimized image component |

### Syntax / AI Widget (`components/syntax ai/`)
| File | Description |
|------|-------------|
| `SyntaxWidget.tsx` | AI/code syntax highlighting widget |

---

## Utilities & Libraries (`src/lib/`)

### Strapi CMS Client (`src/lib/strapi/`)

| File | Description |
|------|-------------|
| `client.ts` | Strapi API client (fetch wrapper, auth headers, error handling) |
| `blogs.ts` | Blog content fetching |
| `business-plans.ts` | Business plans data queries |
| `certificates.ts` | Certificates data queries |
| `coding-projects.ts` | Coding projects data queries (NEW) |
| `marketing-in-motion.ts` | Marketing projects data queries |
| `marketing-plans.ts` | Marketing plans data queries |
| `photography.ts` | Photography data queries |

### Utility Functions (`src/lib/utils/`)

| File | Description |
|------|-------------|
| `date.ts` | Date formatting & manipulation |
| `debounce.ts` | Debounce utility for event handlers |
| `cloudinary-optimizer.ts` | Cloudinary URL transform & optimization helpers |

### Root Lib Files (`src/lib/`)

| File | Description |
|------|-------------|
| `getDictionary.ts` | `getDictionary()` async + `getDictionarySync()` (client-safe) |
| `locales.ts` | Supported locales list, `isSupportedLocale()`, `DEFAULT_LOCALE` |
| `i18n.ts` | Additional i18n helpers |
| `github-api.ts` | GitHub API integration & data fetching |
| `pdf-utils.ts` | PDF handling utilities |
| `youtube-utils.ts` | YouTube API utilities & video data transformers |
| `cloudinaryLoader.ts` | Next.js Cloudinary custom image loader |
| `gsapSetup.ts` | GSAP registration & plugin setup (ScrollTrigger, etc.) |
| `getPortfolioCounts.ts` | Fetches & aggregates portfolio item counts per category |

---

## TypeScript Types (`src/types/`)

| File | Description |
|------|-------------|
| `github.ts` | GitHub API response types |
| `strapi.ts` | Strapi CMS entity types |
| `youtube.ts` | YouTube API response types |

---

## Internationalization (i18n)

### Architecture

All pages live in `src/app/[locale]/`. The `locale` param is either `en` (served at `/`) or `zh` (served at `/zh`). Pages call `getDictionarySync(locale)` to load the correct JSON file at render time. **No separate language-specific page files exist.**

### Locale Files

```
src/locales/
├── en.json    # English translations
└── zh.json    # Chinese (Simplified) translations
```

### Translation Key Reference

| Key | Pages / Components |
|-----|-------------------|
| `nav` | Header navigation |
| `footer` | Footer (tagline, links) |
| `common` | Shared labels |
| `hero` | Homepage hero section |
| `about` | About page |
| `blog` | Blog listing + post pages |
| `certificate` | Certificate page & SEO |
| `contact` | Contact form page |
| `portfolio` | Portfolio hub page |
| `marketingInMotion` | Marketing in Motion pages |
| `marketingPlans` | Marketing Plans page |
| `businessPlans` | Business Plans page |
| `codingProjects` | Coding Projects pages |
| `photography` | Photography page & SEO |
| `amvEditing` | AMV Editing page & SEO |
| `privacy` | Privacy policy page |
| `terms` | Terms of service page |

### Translation Pattern

| Component Type | Pattern |
|---------------|---------|
| **Server Component** | `const { locale } = await props.params;` → `getDictionarySync(locale)` |
| **Client Component** | `usePathname().startsWith('/zh') ? 'zh' : 'en'` → `getDictionarySync(locale)` |
| **generateMetadata** | Reads `t.xxx.seo.*` from the dictionary |

### Routing

| Aspect | Implementation |
|--------|----------------|
| Default Language | English (`/`) — locale = `en` |
| Chinese URL | `/zh/...` — locale = `zh` |
| Detection | Accept-Language header → Middleware → Cookie |
| Cookie | `NEXT_LOCALE` (1-year expiry) |
| Switching | `LanguageSwitcher` component in Header |

---

## Middleware Configuration (`middleware.ts`)

| Feature | Description |
|---------|-------------|
| **Locale Detection** | Auto-detects Chinese from `Accept-Language` header |
| **Cookie Persistence** | Stores `NEXT_LOCALE` preference for 1 year |
| **Clean `/en` Redirects** | Strips `/en` prefix → redirects to clean URL (301) |
| **Legacy Redirects** | 301 redirects for old URL patterns (EN & ZH) |
| **Slug Param Cleanup** | Removes stale `?slug=` query params |
| **Slug-based Sub-route Redirects** | `/marketing-in-motion/:slug` → `/portfolio/marketing-in-motion/:slug` |

### Legacy Route Redirects (301)

| Old Route | New Route |
|-----------|-----------|
| `/blog-post?slug=xxx` | `/blog/xxx` |
| `/marketing-project?slug=xxx` | `/portfolio/marketing-in-motion/xxx` |
| `/marketing-plan` | `/portfolio/marketing-plans` |
| `/business-plan` | `/portfolio/business-plans` |
| `/coding-projects` | `/portfolio/coding-projects` |
| `/coding-projects/:slug` | `/portfolio/coding-projects/:slug` |
| `/photography` | `/portfolio/photography` |
| `/amv-editing` | `/portfolio/amv-editing` |
| `/marketing-in-motion` | `/portfolio/marketing-in-motion` |
| `/marketing-in-motion/:slug` | `/portfolio/marketing-in-motion/:slug` |
| `/en/*` | `/*` (clean URL redirect) |
| *(All of the above with `/zh/` prefix)* | `/zh/portfolio/...` |

---

## Theme System

| Feature | Implementation |
|---------|----------------|
| Provider | `ThemeProvider.tsx` wraps the app in `[locale]/layout.tsx` |
| Package | `next-themes` v0.4.6 |
| Toggle | `ThemeToggle.tsx` (sun/moon icon) in the Header |
| Class-based | Uses `.dark` class on `<html>` for Tailwind dark mode |
| Persistence | Stored in `localStorage` via next-themes |
| SSR-safe | `suppressHydrationWarning` on `<html>` |

---

## Security Headers (`next.config.ts`)

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` |
| `Content-Security-Policy-Report-Only` | Allows GA, Clarity, Cloudinary, YouTube |

---

## SEO & Analytics

### Sitemap (`src/app/sitemap.ts`)

| Type | Count | Notes |
|------|-------|-------|
| Static Pages EN | 15 | Home, About, Blog, Certificate, Contact, Privacy, Terms, 6 portfolio sections + Coding Archive |
| Static Pages ZH | 15 | Same with `/zh` prefix |
| Dynamic Blog Posts | Variable | From Strapi + hreflang alternates |
| Dynamic Marketing Projects | Variable | From Strapi |
| **Total** | **30+** | |

### Analytics Stack

| Tool | Details |
|------|---------|
| Google Analytics 4 | `@next/third-parties/google`, env: `NEXT_PUBLIC_GA_ID` |
| Microsoft Clarity | `@microsoft/clarity`, env: `NEXT_PUBLIC_CLARITY_ID` |
| Vercel Analytics | `@vercel/analytics` — Web Vitals + pageviews |
| Vercel Speed Insights | `@vercel/speed-insights` — Core Web Vitals |

---

## Data Flow

```
YouTube Video Channels (AMV Editing & Gaming):
  YouTube API → Cloudflare Worker → /api/youtube → video-channel/* components → User
  (Fallback: channel mock data from en.json / zh.json)

Blog:
  Strapi → /api/blogs → blog/* components → User

Marketing in Motion:
  Strapi → /api/marketing-in-motion → marketing-in-motion/* components → User

Photography:
  Strapi → /api/photography → photography/* components → User

Business Plans:
  Strapi → /api/business-plans → DocumentGrid/DocumentViewer → User

Marketing Plans:
  Strapi → /api/marketing-plans → MarketingPlanClient → User

Coding Projects:
  Strapi → /api/coding-projects → coding-project/* components → User
  GitHub API → /api/github → GithubProfileHeader, ContributionsGraph, etc. → User

Translations:
  [locale] param / usePathname()
    → getDictionarySync(locale)
    → en.json / zh.json
    → Components render with correct language

Images:
  Cloudinary → cloudinaryLoader.ts / CImage.tsx / cloudinary-optimizer.ts → Next.js Image
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics Measurement ID |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity Project ID |
| `STRAPI_API_URL` | Strapi CMS primary endpoint |
| `STRAPI_API_TOKEN` | Strapi API authentication token |
| `GITHUB_TOKEN` | GitHub API personal access token |

---

## Page & Route Statistics

| Category | EN | ZH | Total |
|----------|----|----|-------|
| Static Pages | 15 | 15 | 30 |
| Dynamic Routes (blog slug) | 1 | 1 | 2 |
| Dynamic Routes (marketing project) | 1 | 1 | 2 |
| Dynamic Routes (coding project) | 1 | 1 | 2 |
| Static Sub-pages (coding archive) | 1 | 1 | 2 |
| API Routes | 8 | — | 8 |
| **Grand Total** | **27** | **19** | **46** |

---

## Development Guidelines

### Adding a New Page
1. Create `src/app/[locale]/[route]/page.tsx`
2. Add `generateMetadata(props)` that reads `t.[section].seo.*` from the dictionary
3. Fetch `locale` from `await props.params`, call `getDictionarySync(locale)`
4. Add all displayed strings to **both** `en.json` and `zh.json`
5. Update `sitemap.ts` for new static routes
6. Add legacy redirect in `middleware.ts` if replacing an old URL

### Adding Translations
1. Add key group to `en.json` and matching `zh.json`
2. Follow the nested structure: `{ seo: {...}, labels: {...}, breadcrumbs: {...} }`
3. Never hardcode UI strings in page or component files

### Adding API Routes
1. Create `src/app/api/[endpoint]/route.ts`
2. Implement GET/POST handlers
3. Add appropriate caching headers (`next: { revalidate: N }`)
4. Add corresponding Strapi query in `src/lib/strapi/[name].ts`

### Adding a New Component
1. Determine if it's a Server or Client Component (`'use client'` if interactive)
2. Place in the appropriate subfolder under `src/components/`
3. For animated components, import GSAP via `src/lib/gsapSetup.ts`
4. For Cloudinary images, use `CImage.tsx` or the `cloudinaryLoader`

---

## Security

- ✅ API tokens in environment variables only
- ✅ No secrets exposed via `NEXT_PUBLIC_` prefix (except analytics IDs)
- ✅ HTTPS enforced in production (Vercel)
- ✅ Robots.txt blocks `/api/` from indexing
- ✅ Security headers configured in `next.config.ts`
- ✅ CSP in report-only mode (ready to enforce)
- ✅ HTML sanitisation via `isomorphic-dompurify` for CMS content

---

## Related Documents

- `README.md` — Setup and quick start
- `I18N_SETUP.md` — Full i18n configuration guide
- `I18N_QUICK_START.md` — i18n quick reference
- `worker-documentation.md` — Web worker documentation
- `package.json` — Dependencies and scripts
- `next.config.ts` — Next.js configuration
- `middleware.ts` — Locale detection & redirects
- `src/locales/` — Translation JSON files

---

**Last Updated:** April 2026
**Framework:** Next.js 16.1.6 (App Router)
**Routing:** Unified `[locale]` dynamic segment — single source of truth for EN + ZH
**Status:** Production Ready ✅
