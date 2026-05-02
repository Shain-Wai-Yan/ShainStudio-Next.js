# Shain Wai Yan — Portfolio

A bilingual (English & Chinese) personal portfolio website built with **Next.js 16 App Router**.

## Tech Stack

| | |
|-|-|
| Framework | Next.js 16.1.6 (App Router) |
| React | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| CMS | Strapi (headless, hosted on Render) |
| Animation | GSAP 3 + @gsap/react |
| Theme | next-themes (dark / light mode) |
| Image CDN | Cloudinary |
| Deployment | Vercel |

## Features

- **Bilingual** — English (`/`) and Chinese (`/zh`) via a single `[locale]` dynamic route
- **Dark / Light Mode** — `next-themes` class-based theming
- **GSAP Animations** — Hero, bento grid, marquee, scroll-triggered reveals
- **Blog** — Strapi CMS with dynamic slug routing
- **Coding Projects** — GitHub API + Strapi, with detail pages and archive
- **Marketing in Motion** — Strapi project gallery with detail pages
- **Photography** — Cloudinary-hosted masonry gallery
- **AMV Editing** — YouTube API integration with video modal
- **Certificates** — Animated marquee carousel
- **Analytics** — Google Analytics 4, Microsoft Clarity, Vercel Analytics

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx
STRAPI_API_URL=https://your-strapi-url
STRAPI_API_TOKEN=your-strapi-token
GITHUB_TOKEN=your-github-token
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Lint

```bash
npm run build    # Production build
npm run lint     # ESLint check
```

## Project Structure

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full detailed architecture reference.

```
src/
├── app/                # Next.js App Router (pages, API routes)
│   ├── [locale]/       # All pages (EN + ZH via single source)
│   └── api/            # 8 API route handlers
├── components/         # Reusable React components (28 subdirs)
├── lib/                # Utilities, Strapi client, GitHub/YouTube API
├── locales/            # en.json & zh.json translations
└── types/              # Shared TypeScript types
```

## i18n

- English: served at `/`
- Chinese: served at `/zh`
- Auto-detection via `Accept-Language` header on first visit
- Language preference stored in `NEXT_LOCALE` cookie (1 year)

See [`I18N_QUICK_START.md`](./I18N_QUICK_START.md) for adding translations and pages.

## Deployment

Deployed on **Vercel** with automatic deploys on push to `main`.

- Production: `https://www.shainwaiyan.com`
- CMS API: `https://api.shainwaiyan.com`
