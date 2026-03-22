# Shain Wai Yan Portfolio - Complete App Architecture

## Overview

This is a bilingual (English & Chinese) portfolio website built with Next.js, featuring a blog, project showcase, certificates display, photography gallery, and AMV editing portfolio. The site uses Strapi as a headless CMS for dynamic content management. All pages are served through a single unified `[locale]` dynamic route — there is **no separate `/zh/` folder**.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.x (App Router) |
| React | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| CMS | Strapi (Headless) |
| Deployment | Vercel |
| Icons | Font Awesome, React Icons, Simple Icons |
| Analytics | Google Analytics 4 (GA4) |

---

## Project Structure

```
/
├── middleware.ts              # Locale detection & legacy route redirects
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies & scripts
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment config
├── ARCHITECTURE.md            # This file
│
├── public/
│   ├── images/
│   │   ├── Shain Studio.png   # Favicon/Logo
│   │   ├── profile.jpeg       # Profile image
│   │   └── certificate-bg.jpg # Certificate background
│   └── *.svg                  # Various SVG assets
│
└── src/
    ├── app/                   # Next.js App Router
    ├── components/            # Reusable React components
    ├── lib/                   # Utilities & API clients
    └── locales/               # i18n translation files
```

---

## App Router Structure (`src/app/`)

```
src/app/
├── globals.css                # Global styles
├── favicon.ico                # Favicon
├── sitemap.ts                 # Dynamic sitemap generator (28+ URLs)
├── robot.ts                   # Robots.txt configuration
│
└── [locale]/                  # Dynamic locale segment — handles both EN (/en→/) and ZH (/zh)
    ├── layout.tsx             # Locale-aware root layout (Header, Footer, GA)
    ├── page.tsx               # / or /zh — Homepage
    │
    ├── about/
    │   └── page.tsx           # /about or /zh/about
    │
    ├── blog/
    │   ├── page.tsx           # /blog — Blog listing
    │   └── [slug]/
    │       └── page.tsx       # /blog/:slug — Individual post
    │
    ├── certificate/
    │   └── page.tsx           # /certificate — Certificates showcase
    │
    ├── contact/
    │   └── page.tsx           # /contact — Contact page & form
    │
    └── portfolio/
        ├── page.tsx           # /portfolio — Portfolio hub
        │
        ├── amv-editing/
        │   ├── layout.tsx     # Dynamic generateMetadata per locale
        │   └── page.tsx       # /portfolio/amv-editing
        │
        ├── business-plans/
        │   └── page.tsx       # /portfolio/business-plans
        │
        ├── coding-projects/
        │   └── page.tsx       # /portfolio/coding-projects
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
| Portfolio Hub | `/portfolio` | `/zh/portfolio` |
| AMV Editing | `/portfolio/amv-editing` | `/zh/portfolio/amv-editing` |
| Marketing in Motion | `/portfolio/marketing-in-motion` | `/zh/portfolio/marketing-in-motion` |
| Project Detail | `/portfolio/marketing-in-motion/:slug` | `/zh/portfolio/marketing-in-motion/:slug` |
| Marketing Plans | `/portfolio/marketing-plans` | `/zh/portfolio/marketing-plans` |
| Business Plans | `/portfolio/business-plans` | `/zh/portfolio/business-plans` |
| Coding Projects | `/portfolio/coding-projects` | `/zh/portfolio/coding-projects` |
| Photography | `/portfolio/photography` | `/zh/portfolio/photography` |

---

## API Routes (`src/app/api/`)

```
src/app/api/
├── amv-editing/
│   └── route.ts               # GET /api/amv-editing — YouTube channel & videos
│
├── blogs/
│   ├── route.ts               # GET /api/blogs — Blog list from Strapi
│   └── [slug]/
│       └── route.ts           # GET /api/blogs/:slug — Single blog post
│
├── github/
│   └── route.ts               # GET /api/github — GitHub profile & repos
│
├── marketing-in-motion/
│   └── route.ts               # GET /api/marketing-in-motion — Marketing projects
│
└── photography/
    └── route.ts               # GET /api/photography — Photography data from Strapi
```

---

## Components (`src/components/`)

### Global Layout Components
```
src/components/
├── Header.tsx                 # Responsive bilingual site header with nav
├── Footer.tsx                 # Site footer — fully localized (EN/ZH via getDictionarySync)
├── Breadcrumb.tsx             # Breadcrumb navigation (SEO + UX)
├── LanguageSwitcher.tsx       # Language toggle (EN ↔ ZH)
├── Seo.tsx                    # Reusable SEO meta component
├── MarTechStack.tsx           # Marketing tech stack display
├── DocumentCard.tsx           # Document preview card
├── DocumentGrid.tsx           # Document grid layout
└── DocumentViewer.tsx         # PDF/Document viewer modal
```

### AMV Editing Components
```
src/components/amv-editing/
├── AMVHeader.tsx              # Page hero & intro
├── ChannelInfo.tsx            # YouTube channel information
├── FeaturedVideo.tsx          # Featured/highlighted video player
├── VideoGrid.tsx              # Video thumbnail grid
└── VideoModal.tsx             # Video lightbox modal
```

### Blog Components
```
src/components/blog/
├── BlogCard.tsx               # Blog post card (listing view)
├── BlogFilterBar.tsx          # Category/tag filter controls
├── BlogGrid.tsx               # Grid layout for blog posts
├── BlogHero.tsx               # Blog page hero section
├── BlogListingClient.tsx      # Client-side blog listing wrapper
├── BlogPostContent.tsx        # Blog post body content renderer
├── BlogPostHeader.tsx         # Blog post title & metadata
├── BlogSearch.tsx             # Search input component
├── BlogSearchClient.tsx       # Client-side search logic
└── RelatedPosts.tsx           # Related posts suggestion section
```

### Certificate Components
```
src/components/certificates/
├── CertificateCard.tsx        # Individual certificate card
├── CertificateMarquee.tsx     # Auto-scrolling certificate carousel
├── CertificateModal.tsx       # Certificate detail modal
└── CertificateRow.tsx         # Certificate row layout
```

### Coding Projects Components
```
src/components/coding-project/
├── ContributionsGraph.tsx     # GitHub contributions heatmap
├── Detailedactivity.tsx       # Detailed GitHub activity breakdown
├── GithubGallery.tsx          # GitHub projects gallery
├── GithubProfileHeader.tsx    # GitHub profile header
├── PinnedRepositories.tsx     # Pinned repos showcase
├── ProgrammingLanguages.tsx   # Language statistics visualization
├── RepoViewer.tsx             # Repository detail viewer
└── RepositoriesList.tsx       # Repositories list view
```

### Marketing in Motion Components
```
src/components/marketing-in-motion/
├── MarketingControls.tsx      # Filter & sort controls
├── MarketingHero.tsx          # Page hero section
├── MarketingInMotionClient.tsx # Client-side listing wrapper
├── MarketingProjectCard.tsx   # Project card (grid view)
├── MarketingProjectGrid.tsx   # Projects grid layout
├── ProjectContent.tsx         # Project detail content
├── ProjectGallery.tsx         # Project image gallery
├── ProjectHeader.tsx          # Project detail header
└── RelatedProjects.tsx        # Related projects suggestions
```

### Marketing Plans Components
```
src/components/marketing-plans/
└── MarketingPlanClient.tsx    # Client-side marketing plans viewer
```

### Photography Components
```
src/components/photography/
├── MasonryGrid.tsx            # Masonry photo layout
├── PhotoCard.tsx              # Photo card
├── PhotoLightbox.tsx          # Full-screen photo lightbox
└── PhotographyGallery.tsx     # Main gallery wrapper
```

---

## Utilities & Libraries (`src/lib/`)

### Strapi CMS Client
```
src/lib/strapi/
├── client.ts                  # Strapi API client initialization
├── blogs.ts                   # Blog content fetching functions
├── business-plans.ts          # Business plans data queries
├── certificates.ts            # Certificates data queries
├── marketing-in-motion.ts     # Marketing projects data queries
├── marketing-plans.ts         # Marketing plans data queries
└── photography.ts             # Photography data queries
```

### i18n & Helper Utilities
```
src/lib/
├── getDictionary.ts           # getDictionary() async + getDictionarySync() (client-safe)
├── locales.ts                 # Supported locales list, isSupportedLocale(), DEFAULT_LOCALE
├── i18n.ts                    # Additional i18n helpers
├── github-api.ts              # GitHub API integration & data fetching
├── pdf-utils.ts               # PDF handling utilities
├── youtube-utils.ts           # YouTube API utilities & video data transformers
└── utils/
    ├── date.ts                # Date formatting & manipulation
    └── debounce.ts            # Debounce utility for event handlers
```

---

## Internationalization (i18n)

### Architecture

All pages live in `src/app/[locale]/`. The `locale` param is either `en` (served at `/`) or `zh` (served at `/zh`). Pages call `getDictionarySync(locale)` to load the correct JSON file at render time. **No separate language-specific page files exist.**

### Locale Files
```
src/locales/
├── en.json                    # English translations
└── zh.json                    # Chinese (Simplified) translations
```

### Translation Key Reference

| Key | Pages / Components that use it |
|-----|-------------------------------|
| `nav` | Header navigation |
| `footer` | Footer (tagline, certifications heading, privacy/terms links) |
| `common` | Shared labels (Learn More, scroll hints) |
| `hero` | Homepage hero section |
| `about` | About page |
| `blog` | Blog listing + post pages |
| `certificate` | Certificate page, SEO metadata |
| `contact` | Contact form page |
| `portfolio` | Portfolio hub page |
| `marketingInMotion` | Marketing in Motion listing, slug detail, SEO |
| `marketingPlans` | Marketing Plans page |
| `businessPlans` | Business Plans page |
| `codingProjects` | Coding Projects page |
| `photography` | Photography page, SEO metadata |
| `amvEditing` | AMV Editing page, layout SEO, mock channel & video data |

### Translation Pattern

| Component Type | Pattern |
|---------------|---------|
| **Server Component (page.tsx)** | `const { locale } = await props.params;` then `getDictionarySync(locale)` |
| **Client Component** | `const locale = usePathname().startsWith('/zh') ? 'zh' : 'en';` then `getDictionarySync(locale)` |
| **generateMetadata** | `async function generateMetadata(props)` reads `t.xxx.seo.*` from the dictionary |

### Routing

| Aspect | Implementation |
|--------|----------------|
| Default Language | English (`/`) — `locale = 'en'` |
| Chinese URL | `/zh/...` — `locale = 'zh'` |
| Detection | Accept-Language header → Middleware → Cookie |
| Cookie | `NEXT_LOCALE` (1 year expiry) |
| Switching | `LanguageSwitcher` component |

---

## Middleware Configuration (`middleware.ts`)

| Feature | Description |
|---------|-------------|
| **Locale Detection** | Auto-detects Chinese from Accept-Language header |
| **Cookie Persistence** | Stores `NEXT_LOCALE` preference for 1 year |
| **Legacy Redirects** | 301 redirects for old URL patterns |
| **UTM Preservation** | Maintains query params during redirects |

### Legacy Route Redirects (301)

| Old Route | New Route |
|-----------|-----------|
| `/blog-post?slug=xxx` | `/blog/xxx` |
| `/marketing-project?slug=xxx` | `/portfolio/marketing-in-motion/xxx` |
| `/marketing-plan` | `/portfolio/marketing-plans` |
| `/business-plan` | `/portfolio/business-plans` |
| `/coding-projects` | `/portfolio/coding-projects` |
| `/photography` | `/portfolio/photography` |
| `/amv-editing` | `/portfolio/amv-editing` |
| `/marketing-in-motion` | `/portfolio/marketing-in-motion` |

---

## SEO & Analytics

### Sitemap (`src/app/sitemap.ts`)

| Type | Count | Notes |
|------|-------|-------|
| Static Pages EN | 13 | Home, About, Blog, Certificate, Contact, 6 portfolio sections |
| Static Pages ZH | 13 | Same with `/zh` prefix |
| Dynamic Blog Posts | Variable | Fetched from Strapi + hreflang alternates |
| Dynamic Projects | Variable | Marketing projects from Strapi |
| **Total** | **28+** | |

### Google Analytics

| Item | Value |
|------|-------|
| Package | `@next/third-parties/google` |
| Location | `[locale]/layout.tsx` |
| Env Var | `NEXT_PUBLIC_GA_ID` |
| Strategy | `afterInteractive` |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics Measurement ID |
| `STRAPI_API_URL` | Strapi CMS API endpoint |
| `STRAPI_API_TOKEN` | Strapi API authentication token |
| `GITHUB_TOKEN` | GitHub API personal access token |

---

## Page & Route Statistics

| Category | EN | ZH | Total |
|----------|----|----|-------|
| Static Pages | 13 | 13 | 26 |
| Dynamic Routes (blog slug) | 1 | 1 | 2 |
| Dynamic Routes (project slug) | 1 | 1 | 2 |
| API Routes | 5 | — | 5 |
| **Grand Total** | **20** | **15** | **35** |

---

## Data Flow

```
AMV Editing:
  YouTube API → /api/amv-editing → amv-editing/* components → User
  (Fallback: mock data from en.json / zh.json)

Blog:
  Strapi → /api/blogs → blog/* components → User

Marketing in Motion:
  Strapi → /api/marketing-in-motion → marketing-in-motion/* components → User

Photography:
  Strapi → /api/photography → photography/* components → User

Coding Projects:
  GitHub API → /api/github → coding-project/* components → User

Translations:
  [locale] param / usePathname()
    → getDictionarySync(locale)
    → en.json / zh.json
    → Components render with correct language
```

---

## Development Guidelines

### Adding a New Page
1. Create `src/app/[locale]/[route]/page.tsx`
2. Add `generateMetadata(props)` that reads from the locale JSON
3. Fetch `locale` from `await props.params`, call `getDictionarySync(locale)`
4. Add all displayed strings to **both** `en.json` and `zh.json`
5. Update `sitemap.ts` for new static routes

### Adding Translations
1. Add key group to `en.json` and matching `zh.json`
2. Follow the nested structure: `{ seo: {...}, labels: {...}, breadcrumbs: {...} }`
3. Never hardcode UI strings directly in page or component files

### Adding API Routes
1. Create `src/app/api/[endpoint]/route.ts`
2. Implement GET/POST handlers
3. Add caching headers
4. Document endpoint in this file

---

## Security

- ✅ API tokens in environment variables only
- ✅ No secrets exposed via `NEXT_PUBLIC_` prefix
- ✅ HTTPS enforced in production (Vercel)
- ✅ Robots.txt blocks `/api/` from indexing

---

## Related Documents

- `README.md` — Setup and quick start
- `package.json` — Dependencies and scripts
- `next.config.ts` — Next.js configuration
- `middleware.ts` — Locale detection & redirects
- `src/locales/` — Translation JSON files

---

**Last Updated:** March 2026
**Framework:** Next.js 16.x (App Router)
**Routing:** Unified `[locale]` dynamic segment — single source of truth for EN + ZH
**Status:** Production Ready
