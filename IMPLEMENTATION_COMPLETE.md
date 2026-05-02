# Implementation Reference — Current State ✅

> **Note:** This document reflects the **current production state** of the portfolio as audited in April 2026. It supersedes the original i18n-only implementation notes from the initial setup phase.

---

## Current Implementation Status

### ✅ Infrastructure

| Feature | Status | Details |
|---------|--------|---------|
| i18n (EN/ZH) | ✅ Complete | Unified `[locale]` route, auto-detection, cookie persistence |
| Dark/Light Mode | ✅ Complete | `next-themes` v0.4.6, `.dark` class on `<html>` |
| GSAP Animations | ✅ Complete | ScrollTrigger, SplitText, Marquee, Hero, Bento |
| Strapi CMS | ✅ Complete | 7 content types connected |
| GitHub API | ✅ Complete | Profile, repos, contributions, pinned repos |
| YouTube API | ✅ Complete | Channel info + video list with fallback mock data |
| Cloudinary | ✅ Complete | Custom loader + `CImage` component + optimizer utils |
| Analytics | ✅ Complete | GA4 + Microsoft Clarity + Vercel Analytics + Speed Insights |
| Security Headers | ✅ Complete | CSP (report-only), HSTS, XFO, COOP, permissions policy |
| SEO | ✅ Complete | Sitemap (30+ URLs), hreflang, robots.txt, `generateMetadata` per page |
| Legacy Redirects | ✅ Complete | 14+ 301 redirect rules in middleware (EN + ZH variants) |

### ✅ Pages Implemented

| Page | EN | ZH | Notes |
|------|----|----|-------|
| Home | ✅ | ✅ | GSAP hero, bento, stats, marquee, marketing, CTA |
| About | ✅ | ✅ | Scroll-reveal text animations |
| Blog Listing | ✅ | ✅ | Strapi-powered, filter + search |
| Blog Post | ✅ | ✅ | Dynamic `[slug]`, DOMPurify-sanitised HTML |
| Certificate | ✅ | ✅ | Auto-scrolling marquee carousel |
| Contact | ✅ | ✅ | Form with Server Actions |
| Privacy | ✅ | ✅ | Legal page |
| Terms | ✅ | ✅ | Legal page |
| Portfolio Hub | ✅ | ✅ | GSAP horizontal scroll gallery |
| AMV Editing | ✅ | ✅ | YouTube API + modal player |
| Business Plans | ✅ | ✅ | Strapi PDF viewer |
| Coding Projects | ✅ | ✅ | Strapi + GitHub, detail + archive pages |
| Marketing in Motion | ✅ | ✅ | Strapi gallery, detail `[slug]` pages |
| Marketing Plans | ✅ | ✅ | Strapi PDF viewer |
| Photography | ✅ | ✅ | Cloudinary masonry + lightbox |

### ✅ API Routes

| Endpoint | Source | Description |
|----------|--------|-------------|
| `GET /api/amv-editing` | YouTube API | Channel info + video list |
| `GET /api/blogs` | Strapi | Blog listing |
| `GET /api/blogs/:slug` | Strapi | Single blog post |
| `GET /api/business-plans` | Strapi | Business plans list |
| `GET /api/coding-projects` | Strapi | Coding projects list |
| `GET /api/github` | GitHub API | Profile + repos |
| `GET /api/marketing-in-motion` | Strapi | Marketing projects list |
| `GET /api/marketing-plans` | Strapi | Marketing plans list |
| `GET /api/photography` | Strapi | Photography list |

---

## Key Architecture Patterns

### Translation Pattern (Server Components)
```tsx
// In any page.tsx
export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = getDictionarySync(locale);
  return <h1>{t.section.title}</h1>;
}
```

### Translation Pattern (Client Components)
```tsx
'use client';
import { usePathname } from 'next/navigation';
import { getDictionarySync } from '@/lib/getDictionary';

export function MyComponent() {
  const pathname = usePathname();
  const locale = pathname.startsWith('/zh') ? 'zh' : 'en';
  const t = getDictionarySync(locale);
  return <p>{t.section.label}</p>;
}
```

### Dark Mode Theming
```css
/* Tailwind dark mode (class-based) */
.some-element { @apply bg-white dark:bg-neutral-900; }
```
```tsx
// ThemeProvider wraps app in [locale]/layout.tsx
// ThemeToggle in Header switches theme
// next-themes stores preference in localStorage
```

### GSAP in Components
```tsx
import { gsap } from '@/lib/gsapSetup'; // pre-registered plugins
import { useGSAP } from '@gsap/react';

export function AnimatedSection() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(ref.current, { opacity: 0, y: 50, scrollTrigger: ref.current });
  }, { scope: ref });
  return <div ref={ref}>...</div>;
}
```

### Cloudinary Images
```tsx
import CImage from '@/components/ui/CImage';
// or use cloudinaryLoader directly on next/image:
import { cloudinaryLoader } from '@/lib/cloudinaryLoader';
<Image loader={cloudinaryLoader} src="folder/image.jpg" ... />
```

---

## File Location Reference (Current)

| Purpose | Location |
|---------|----------|
| English translations | `src/locales/en.json` |
| Chinese translations | `src/locales/zh.json` |
| Translation loader | `src/lib/getDictionary.ts` |
| Locale helpers | `src/lib/locales.ts` |
| i18n utilities | `src/lib/i18n.ts` |
| Language detection | `middleware.ts` |
| Language toggle | `src/components/LanguageSwitcher.tsx` |
| Theme provider | `src/components/ThemeProvider.tsx` |
| Theme toggle | `src/components/ThemeToggle.tsx` |
| GSAP setup | `src/lib/gsapSetup.ts` |
| Cloudinary loader | `src/lib/cloudinaryLoader.ts` |
| Cloudinary optimizer | `src/lib/utils/cloudinary-optimizer.ts` |
| Portfolio counts | `src/lib/getPortfolioCounts.ts` |
| TypeScript types | `src/types/` |
| All pages | `src/app/[locale]/` |
| API routes | `src/app/api/` |

---

## Troubleshooting Checklist

- [ ] Both `en.json` and `zh.json` have matching keys?
- [ ] New page added to `sitemap.ts`?
- [ ] New GSAP animations using `useGSAP` hook (not `useEffect`)?
- [ ] Cloudinary images using `CImage` or `cloudinaryLoader`?
- [ ] Dark mode using `.dark:` Tailwind variant (not `@media (prefers-color-scheme)`)?
- [ ] All UI strings coming from dictionary, not hardcoded?
- [ ] New API route added to `src/lib/strapi/` with proper types in `src/types/`?

---

**Last Updated:** April 2026
**Status:** All pages implemented and production-ready ✅
