# Shain Wai Yan Portfolio - Complete App Architecture

## Overview

This is a bilingual (English & Chinese) portfolio website built with Next.js 16, featuring a blog, project showcase, certificates display, and photography gallery. The site uses Strapi as a headless CMS for dynamic content management.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| React | React 19.2.3 |
| Styling | Tailwind CSS 4.2.1 |
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

### Root Files
```
src/app/
├── layout.tsx                 # Root layout (Header, Footer, GA, Metadata)
├── page.tsx                   # Homepage (/)
├── globals.css                # Global styles
├── favicon.ico                # Favicon
├── sitemap.ts                 # Dynamic sitemap generator (28+ URLs)
└── robots.ts                  # Robots.txt configuration for crawlers
```

---

## Routes Breakdown

### English Routes (`/`)

```
src/app/
├── page.tsx                           # / (Homepage)
│
├── about/
│   └── page.tsx                       # /about (About page)
│
├── blog/
│   ├── page.tsx                       # /blog (Blog listing)
│   └── [slug]/
│       └── page.tsx                   # /blog/:slug (Individual blog post)
│
├── certificate/
│   └── page.tsx                       # /certificate (Certificates showcase)
│
├── contact/
│   ├── page.tsx                       # /contact (Contact page)
│   └── contact-form.tsx               # Contact form component
│
└── portfolio/
    ├── page.tsx                       # /portfolio (Portfolio hub)
    │
    ├── amv-editing/
    │   ├── layout.tsx                 # AMV editing layout
    │   └── page.tsx                   # /portfolio/amv-editing
    │
    ├── business-plans/
    │   └── page.tsx                   # /portfolio/business-plans
    │
    ├── coding-projects/
    │   └── page.tsx                   # /portfolio/coding-projects
    │
    ├── marketing-in-motion/
    │   ├── page.tsx                   # /portfolio/marketing-in-motion
    │   └── [slug]/
    │       └── page.tsx               # /portfolio/marketing-in-motion/:slug
    │
    ├── marketing-plans/
    │   └── page.tsx                   # /portfolio/marketing-plans
    │
    └── photography/
        └── page.tsx                   # /portfolio/photography
```

### Chinese Routes (`/zh`)

```
src/app/zh/
├── layout.tsx                         # Chinese nested layout (metadata only)
├── page.tsx                           # /zh (Homepage)
│
├── about/
│   └── page.tsx                       # /zh/about
│
├── blog/
│   ├── page.tsx                       # /zh/blog (Blog listing)
│   └── [slug]/
│       └── page.tsx                   # /zh/blog/:slug
│
├── certificate/
│   └── page.tsx                       # /zh/certificate
│
├── contact/
│   ├── page.tsx                       # /zh/contact
│   └── contact-form-zh.tsx            # Chinese contact form
│
└── portfolio/
    ├── page.tsx                       # /zh/portfolio
    │
    ├── amv-editing/
    │   ├── layout.tsx                 # AMV layout (Chinese)
    │   └── page.tsx                   # /zh/portfolio/amv-editing
    │
    ├── business-plan/
    │   └── page.tsx                   # /zh/portfolio/business-plan
    │
    ├── coding-projects/
    │   └── page.tsx                   # /zh/portfolio/coding-projects
    │
    ├── marketing-in-motion/
    │   ├── page.tsx                   # /zh/portfolio/marketing-in-motion
    │   └── [slug]/
    │       └── page.tsx               # /zh/portfolio/marketing-in-motion/:slug
    │
    ├── marketing-plan/
    │   └── page.tsx                   # /zh/portfolio/marketing-plan
    │
    └── photography/
        └── page.tsx                   # /zh/portfolio/photography
```

### API Routes (`src/app/api/`)

```
src/app/api/
├── amv-editing/
│   └── route.ts                       # GET /api/amv-editing (AMV videos data)
│
├── blogs/
│   ├── route.ts                       # GET /api/blogs (Blog list)
│   └── [slug]/
│       └── route.ts                   # GET /api/blogs/:slug (Single blog)
│
├── github/
│   └── route.ts                       # GET /api/github (GitHub user data)
│
├── marketing-in-motion/
│   └── route.ts                       # GET /api/marketing-in-motion (Projects)
│
└── photography/
    └── route.ts                       # GET /api/photography (Photos data)
```

---

## Components (`src/components/`)

### Global Layout Components
```
src/components/
├── Header.tsx                 # Site header with responsive navigation
├── Footer.tsx                 # Site footer with links & social
├── Breadcrumb.tsx             # Breadcrumb navigation (SEO + UX)
├── LanguageSwitcher.tsx       # Language toggle (EN/ZH)
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
├── FeaturedVideo.tsx          # Featured video player
├── VideoGrid.tsx              # Video thumbnail grid
└── VideoModal.tsx             # Video lightbox modal
```

### Blog Components
```
src/components/blog/
├── BlogCard.tsx               # Blog post card (listing)
├── BlogFilterBar.tsx          # Category/tag filter controls
├── BlogGrid.tsx               # Grid layout for blog posts
├── BlogHero.tsx               # Blog page hero section
├── BlogListingClient.tsx      # Client-side blog listing wrapper
├── BlogPostContent.tsx        # Blog post body content
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
├── Detailedactivity.tsx       # Detailed activity breakdown
├── GithubGallery.tsx          # GitHub projects gallery (English)
├── GithubGalleryZH.tsx        # GitHub projects gallery (Chinese)
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

### Photography Components
```
src/components/photography/
├── MasonryGrid.tsx            # Masonry photo layout
├── PhotoCard.tsx              # Photo card
├── PhotoLightbox.tsx          # Photo lightbox viewer
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

### Helper Utilities
```
src/lib/
├── github-api.ts              # GitHub API integration & data fetching
├── i18n.ts                    # Internationalization helpers & locale logic
├── pdf-utils.ts               # PDF handling & manipulation utilities
├── youtube-utils.ts           # YouTube API utilities & video data
└── utils/
    ├── date.ts                # Date formatting & manipulation
    └── debounce.ts            # Debounce function for events
```

---

## Internationalization (i18n)

### Locale Files
```
src/locales/
├── en.json                    # English translations (all strings)
└── zh.json                    # Chinese (Simplified) translations
```

### Routing Strategy

| Aspect | Implementation |
|--------|----------------|
| **Default Language** | English (/) |
| **Chinese URL** | Prefixed with `/zh` |
| **Detection** | Accept-Language header + Cookie |
| **Cookie** | `NEXT_LOCALE` (1 year expiry) |
| **Switching** | Manual via LanguageSwitcher component |
| **Type** | Nested routing (not sub-domains) |

### Chinese Locale Detection Flow
1. User visits site → Middleware checks Accept-Language header
2. If Chinese detected → Set `NEXT_LOCALE=zh` cookie
3. User can manually toggle via LanguageSwitcher
4. Cookie persists preference for 1 year

---

## Middleware Configuration (`middleware.ts`)

### Features

| Feature | Description |
|---------|-------------|
| **Locale Detection** | Auto-detects Chinese from Accept-Language header |
| **Cookie Persistence** | Stores `NEXT_LOCALE` preference for 1 year |
| **Legacy Redirects** | 301 redirects for old URL patterns |
| **UTM Preservation** | Maintains marketing tracking params during redirects |
| **Mobile Detection** | Optional device type detection |

### Legacy Route Redirects (301 Permanent)

| Old Route | New Route | Status |
|-----------|-----------|--------|
| `/blog-post?slug=xxx` | `/blog/xxx` | 301 |
| `/marketing-project?slug=xxx` | `/portfolio/marketing-in-motion/xxx` | 301 |
| `/marketing-plan` | `/portfolio/marketing-plans` | 301 |
| `/business-plan` | `/portfolio/business-plans` | 301 |
| `/coding-projects` | `/portfolio/coding-projects` | 301 |
| `/photography` | `/portfolio/photography` | 301 |
| `/amv-editing` | `/portfolio/amv-editing` | 301 |
| `/marketing-in-motion` | `/portfolio/marketing-in-motion` | 301 |

---

## SEO & Analytics Configuration

### Sitemap (`src/app/sitemap.ts`)

| Type | Count | Details |
|------|-------|---------|
| Static Pages (EN) | 12 | Home, About, Blog, Certificates, Contact, 5 Portfolio sections |
| Static Pages (ZH) | 12 | Same as English with Chinese content |
| Dynamic Blog Posts | Variable | Fetched from Strapi, includes hreflang alternates |
| Dynamic Projects | Variable | Marketing projects fetched from Strapi |
| **Total URLs** | 28+ | Includes hreflang language links |

Features:
- Auto-generates from Strapi dynamic content
- Includes hreflang alternates for EN/ZH versions
- Logs generation statistics
- Available at: `https://www.shainwaiyan.com/sitemap.xml`

### Robots Configuration (`src/app/robots.ts`)

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /.*
Sitemap: https://www.shainwaiyan.com/sitemap.xml
```

Features:
- Allows all public pages
- Blocks API routes and Next.js internals
- Points crawlers to sitemap
- Optional AI crawler blocking (GPTBot, etc.)

### Google Analytics Setup

| Item | Configuration |
|------|----------------|
| **Implementation** | @next/third-parties/google |
| **Location** | Root layout.tsx |
| **Environment Variable** | `NEXT_PUBLIC_GA_ID` |
| **Format** | G-XXXXXXXXXX (GA4 Measurement ID) |
| **Strategy** | afterInteractive (non-blocking) |
| **Language Support** | Tracks both EN & ZH routes |

### Metadata Configuration

Located in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Shain Wai Yan | Digital Marketing & Business Solutions",
  description: "Portfolio showcasing digital marketing projects, coding projects, certificates, and more",
  authors: [{ name: "Shain Wai Yan" }],
  robots: "index, follow, max-image-preview:large",
  metadataBase: new URL("https://www.shainwaiyan.com"),
  icons: {
    icon: [
      { url: '/images/Shain Studio.png', sizes: '32x32' },
      { url: '/images/Shain Studio.png', sizes: '96x96' },
      { url: '/images/Shain Studio.png', sizes: '192x192' }
    ]
  },
  // ... additional meta tags
}
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics Measurement ID | `G-ABCDEFG123` |
| `STRAPI_API_URL` | Strapi CMS API endpoint | `https://api.example.com` |
| `STRAPI_API_TOKEN` | Strapi API authentication token | `abc123xyz...` |
| `GITHUB_TOKEN` | GitHub API personal access token | `ghp_xxxxx...` |

### Setup Instructions

1. Go to Vercel Project Settings → **Vars**
2. Add each variable with appropriate value
3. Redeploy project for changes to take effect
4. Variables prefixed with `NEXT_PUBLIC_` are available client-side

---

## Viewport Configuration

Defined in `src/app/layout.tsx`:

```typescript
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#191970" },
    { media: "(prefers-color-scheme: dark)", color: "#a67c00" },
  ],
  colorScheme: "light dark",
};
```

---

## Page & Route Statistics

### Page Count Summary

| Category | English | Chinese | Total |
|----------|---------|---------|-------|
| Static Pages | 12 | 12 | 24 |
| Dynamic Routes | 2 | 2 | 4 |
| API Routes | 5 | - | 5 |
| **Grand Total** | **19** | **14** | **33** |

### URL Breakdown

- **Static URLs:** 24 (12 EN + 12 ZH)
- **Dynamic Blog URLs:** Variable (fetched from Strapi)
- **Dynamic Project URLs:** Variable (fetched from Strapi)
- **API Endpoints:** 5
- **Total Indexed:** 28+

---

## Data Flow Architecture

### Blog Content Flow
```
Strapi CMS
    ↓
/api/blogs route (caching)
    ↓
components/blog/* components
    ↓
User displays blog posts (EN & ZH versions)
```

### Marketing Projects Flow
```
Strapi CMS
    ↓
/api/marketing-in-motion route
    ↓
components/marketing-in-motion/* components
    ↓
User views projects with gallery/details
```

### GitHub Data Flow
```
GitHub API
    ↓
/api/github route
    ↓
components/coding-project/* components
    ↓
User sees repos, contributions, languages
```

### Static Content Flow
```
Page.tsx (per route)
    ↓
Layout.tsx wrapper
    ↓
Specific component library (portfolio/*)
    ↓
User views rendered page
```

---

## Deployment & Performance

### Deployment Platform
- **Platform:** Vercel
- **Region:** Auto-selected optimal region
- **Build Time:** Optimized with Turbopack (Next.js 16 default)
- **Edge Functions:** Available for middleware

### Performance Features
- **Image Optimization:** Next.js Image component
- **Code Splitting:** Automatic by route
- **CSS Optimization:** Tailwind CSS purge in production
- **Font Optimization:** Google Fonts integrated
- **Cache Strategy:** Configured in next.config.ts

---

## Development Guidelines

### Adding New Pages

1. Create folder in appropriate route: `/src/app/[route]/page.tsx`
2. For Chinese version: Create at `/src/app/zh/[route]/page.tsx`
3. Export metadata for SEO
4. Import reusable components
5. Update sitemap.ts if adding new static route

### Adding New Components

1. Create in `/src/components/[feature]/ComponentName.tsx`
2. Use TypeScript interfaces for props
3. Follow existing naming conventions
4. Export from component index if needed

### Adding API Routes

1. Create in `/src/app/api/[endpoint]/route.ts`
2. Implement GET/POST handlers as needed
3. Add caching headers for performance
4. Document in this file

### Adding Translations

1. Add key:value pairs to both `/src/locales/en.json` and `/src/locales/zh.json`
2. Import i18n helper in component
3. Use i18n function to get translated string

---

## Security Considerations

- ✅ API tokens stored in environment variables only
- ✅ No sensitive data in client-side code (NEXT_PUBLIC_ prefix only for safe data)
- ✅ HTTPS enforced in production
- ✅ Robots.txt blocks API routes from indexing
- ✅ CSP headers recommended (add to next.config.ts)

---

## i18n Architecture Diagram

### How Language Detection Works

```
┌─────────────────────────────────────────────────────────────┐
│                        User Visits Site                       │
│                      www.yoursite.com/                        │
└────────────────────────────┬────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Middleware (middleware.ts)   │
        │  Checks Accept-Language Header │
        └────────────┬───────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ┌──────────────┐    ┌──────────────┐
    │ 中文 Detected │    │ English or   │
    │ (zh-CN, etc) │    │ Default      │
    └──────┬───────┘    └──────┬───────┘
           │                   │
           ▼                   ▼
    ┌──────────────┐    ┌──────────────┐
    │ Set Cookie:  │    │ Set Cookie:  │
    │ NEXT_LOCALE  │    │ NEXT_LOCALE  │
    │ = 'zh'       │    │ = 'en'       │
    └──────┬───────┘    └──────┬───────┘
           │                   │
           ▼                   ▼
    ┌──────────────┐    ┌──────────────┐
    │  Redirect    │    │  Serve Page  │
    │  to /zh      │    │  at /        │
    └──────┬───────┘    └──────┬───────┘
           │                   │
           └───────┬───────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │   Page Loads (Next.js App)   │
    │  - Renders Header with Nav   │
    │  - Shows Language Switcher   │
    │  - Displays Content          │
    └──────────────────────────────┘
```

### Request Flow Diagram

```
                    FIRST VISIT
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   Browser Language             Browser Language
   = Chinese?                   = English?
        │                               │
        │ YES                           │ NO/DEFAULT
        │                               │
        ▼                               ▼
   /zh/page.tsx              /page.tsx
   Chinese Content           English Content
        │                               │
        └───────────┬───────────────────┘
                    │
              ┌─────────┴─────────┐
              │                   │
        [Language Switcher Visible]
        
        Click "中文" → Redirect to /zh
        Click "EN"   → Redirect to /
        
        Cookie persists for 1 year ✓
```

### File Organization & Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│  Visits: www.site.com/                                            │
│  Cookie NEXT_LOCALE: "zh"                                         │
│  Language: zh-CN                                                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS MIDDLEWARE                              │
│                   (src/middleware.ts)                              │
│                                                                     │
│  1. Check pathname                                                 │
│  2. Check cookie (NEXT_LOCALE)                                     │
│  3. Parse Accept-Language header                                   │
│  4. Decide: Chinese (/zh) or English (/)                           │
│  5. Set/update cookie                                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
        ┌─────────────────┐        ┌──────────────────┐
        │  /zh/page.tsx   │        │  /page.tsx       │
        │  (Chinese)      │        │  (English)       │
        └────────┬────────┘        └────────┬─────────┘
                 │                         │
                 └──────────┬──────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │   Load Translations         │
              │                             │
              │   getTranslations('zh')     │
              │   getTranslations('en')     │
              └────────┬────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌──────────────┐          ┌──────────────┐
   │ zh.json      │          │ en.json      │
   │              │          │              │
   │ nav: {...}   │          │ nav: {...}   │
   │ hero: {...}  │          │ hero: {...}  │
   │ about: {...} │          │ about: {...} │
   └──────┬───────┘          └──────┬───────┘
          │                         │
          └──────────┬──────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Render Component with     │
        │  Correct Translations      │
        │                            │
        │  <Header>                  │
        │    - Bilingual Nav         │
        │    - Language Switcher     │
        │  <Hero>                    │
        │    - Title: 欢迎来到...     │
        │    - CTA: 联系我           │
        └────────────────────────────┘
```

---

## Summary

This i18n system:
- ✅ Auto-detects user language from browser settings
- ✅ Provides clean URLs (`/` and `/zh`)
- ✅ Allows manual language switching
- ✅ Remembers user preference in cookie
- ✅ Has proper SEO structure with hreflang tags
- ✅ Uses JSON translation files for easy management
- ✅ Keeps code DRY with utility functions
- ✅ Supports 12+ pages with shared Header/Footer

All components work together seamlessly to provide a professional bilingual experience!

---

## Related Documents

- `README.md` - Setup and quick start guide
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `middleware.ts` - Locale & redirect logic
- `src/locales/` - Translation files

---

**Last Updated:** March 2026
**Framework Version:** Next.js 16.1.6
**Status:** Production Ready
