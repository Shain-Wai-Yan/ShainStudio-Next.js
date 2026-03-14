# i18n Architecture Diagram

## How Language Detection Works

```
┌─────────────────────────────────────────────────────────────┐
│                        User Visits Site                       │
│                      www.yoursite.com/                        │
└────────────────────────┬────────────────────────────────────┘
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

---

## Request Flow Diagram

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
        └───────────────┬───────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
        [Language Switcher Visible]
        
        Click "中文" → Redirect to /zh
        Click "EN"   → Redirect to /
        
        Cookie persists for 1 year ✓
```

---

## File Organization & Data Flow

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

## Component Hierarchy

```
RootLayout (src/app/layout.tsx)
│
├─ Header (src/components/Header.tsx)
│  ├─ Logo (multilingual title)
│  ├─ Nav Links (dynamic based on locale)
│  │  ├─ Home (/  or /zh)
│  │  ├─ About (/about or /zh/about)
│  │  ├─ Portfolio (with dropdown)
│  │  │  ├─ Business Plans
│  │  │  ├─ Marketing Plans
│  │  │  ├─ Marketing in Motion
│  │  │  ├─ Coding Projects
│  │  │  ├─ Photography
│  │  │  └─ AMV Editing
│  │  ├─ Certificate
│  │  ├─ Blog
│  │  └─ Contact
│  │
│  └─ LanguageSwitcher (src/components/LanguageSwitcher.tsx)
│     └─ Dropdown (English / 中文)
│
├─ Main Content (pages)
│  ├─ English Pages (src/app/*/page.tsx)
│  │  └─ Uses: getTranslations('en')
│  │           locales/en.json
│  │
│  └─ Chinese Pages (src/app/zh/*/page.tsx)
│     └─ Uses: getTranslations('zh')
│              locales/zh.json
│
└─ Footer (src/components/Footer.tsx)
   └─ Translations from JSON files
```

---

## Page Routing Structure

```
ENGLISH ROUTES (/)
┌──────────────────────────────────────────┐
│ /                    (Home)               │
│ /about               (About Page)         │
│ /portfolio           (Portfolio Main)     │
│ ├─ /business-plan    (Sub-page)          │
│ ├─ /marketing-plan   (Sub-page)          │
│ ├─ /marketing-in-motion (Sub-page)       │
│ ├─ /coding-projects  (Sub-page)          │
│ ├─ /photography      (Sub-page)          │
│ └─ /amv-editing      (Sub-page)          │
│ /certificate         (Certificate Page)  │
│ /blog                (Blog Page)          │
│ └─ /contact          (Contact Page)      │
└──────────────────────────────────────────┘

CHINESE ROUTES (/zh)
┌──────────────────────────────────────────┐
│ /zh                  (首页)               │
│ /zh/about            (关于页面)          │
│ /zh/portfolio        (作品集主页)        │
│ ├─ /business-plan    (子页面)            │
│ ├─ /marketing-plan   (子页面)            │
│ ├─ /marketing-in-motion (子页面)         │
│ ├─ /coding-projects  (子页面)            │
│ ├─ /photography      (子页面)            │
│ └─ /amv-editing      (子页面)            │
│ /zh/certificate      (证书页面)          │
│ /zh/blog             (博客页面)          │
│ └─ /zh/contact       (联系页面)          │
└──────────────────────────────────────────┘

Both versions are served separately and independently
Each has its own translations and metadata
```

---

## Translation System

```
┌─────────────────────────────────────────┐
│     Translation Files (JSON)            │
│                                         │
│  src/locales/en.json                    │
│  {                                      │
│    "nav": { ... },                      │
│    "hero": { ... },                     │
│    "about": { ... },                    │
│    "portfolio": { ... }                 │
│  }                                      │
│                                         │
│  src/locales/zh.json                    │
│  {                                      │
│    "nav": { ... },                      │
│    "hero": { ... },                     │
│    "about": { ... },                    │
│    "portfolio": { ... }                 │
│  }                                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   i18n Utility Function                 │
│   src/lib/i18n.ts                       │
│                                         │
│   getTranslations(locale: 'en'|'zh')    │
│   └─ Returns: JSON object               │
│                                         │
│   Usage:                                │
│   const translations =                  │
│     getTranslations('zh');              │
│                                         │
│   translations.nav.home                 │
│   → "首页"                              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Component/Page File                   │
│   src/app/about/page.tsx (English)      │
│   src/app/zh/about/page.tsx (Chinese)   │
│                                         │
│   const trans = getTranslations('en')   │
│   const trans = getTranslations('zh')   │
│                                         │
│   <h1>{trans.about.title}</h1>          │
│   <p>{trans.about.bio}</p>              │
└──────────────────────────────────────────┘
```

---

## Language Switcher Flow

```
┌──────────────────────────┐
│  User Clicks Language    │
│  Button in Header        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  LanguageSwitcher Component          │
│  (src/components/LanguageSwitcher)   │
│                                      │
│  Detects: pathname                   │
│  ├─ /about → isChineseRoute = false  │
│  └─ /zh/about → isChineseRoute = true│
└────────────┬─────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   EN Button     ZH Button
      │             │
      │ Click       │ Click
      │             │
      ▼             ▼
  Set Cookie    Set Cookie
  NEXT_LOCALE   NEXT_LOCALE
  = 'en'        = 'zh'
      │             │
      └──────┬──────┘
             │
             ▼
  ┌────────────────────┐
  │  Navigate to:      │
  │                    │
  │  /about (EN)       │
  │  or                │
  │  /zh/about (ZH)    │
  └────────────────────┘
```

---

## SEO Structure

```
www.site.com/

┌─────────────────────────────────────────┐
│ <html lang="en">                        │
│                                         │
│ <head>                                  │
│   <link rel="canonical"                 │
│         href="/"/>                      │
│                                         │
│   <link rel="alternate"                 │
│         hreflang="en"                   │
│         href="/"/>                      │
│                                         │
│   <link rel="alternate"                 │
│         hreflang="zh"                   │
│         href="/zh"/>                    │
│ </head>                                 │
│                                         │
│ <body>...</body>                        │
│                                         │
│ </html>                                 │
└─────────────────────────────────────────┘

BOTH VERSIONS IN SITEMAP:
sitemap.xml
├─ /
├─ /about
├─ /portfolio
├─ /zh
├─ /zh/about
└─ /zh/portfolio

GOOGLE UNDERSTANDS:
✓ /        = English version
✓ /zh      = Chinese version
✓ Both are equally important
✓ No duplicate content penalty
```

---

## Data Flow Example: User Visits /about

```
User navigates to: www.site.com/about

                        │
                        ▼
        ┌───────────────────────────┐
        │   URL is /about           │
        │   No /zh prefix           │
        │   → English Page          │
        └───────────┬───────────────┘
                    │
                    ▼
        ┌────────────────────────────────┐
        │  Load: src/app/about/page.tsx  │
        └───────────┬────────────────────┘
                    │
                    ▼
        ┌────────────────────────────┐
        │  getTranslations('en')     │
        └───────────┬────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Load: locales/en.json   │
        │                          │
        │  {                       │
        │    "about": {            │
        │      "title": "About Me" │
        │    }                     │
        │  }                       │
        └───────────┬──────────────┘
                    │
                    ▼
        ┌────────────────────────────────┐
        │  Render Page                   │
        │                                │
        │  <h1>About Me</h1>             │
        │  <p>About content in English   │
        └────────────────────────────────┘


User navigates to: www.site.com/zh/about

                        │
                        ▼
        ┌───────────────────────────┐
        │   URL is /zh/about        │
        │   Has /zh prefix          │
        │   → Chinese Page          │
        └───────────┬───────────────┘
                    │
                    ▼
        ┌────────────────────────────────┐
        │  Load: src/app/zh/about/page   │
        └───────────┬────────────────────┘
                    │
                    ▼
        ┌────────────────────────────┐
        │  getTranslations('zh')     │
        └───────────┬────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Load: locales/zh.json   │
        │                          │
        │  {                       │
        │    "about": {            │
        │      "title": "关于我"   │
        │    }                     │
        │  }                       │
        └───────────┬──────────────┘
                    │
                    ▼
        ┌────────────────────────────────┐
        │  Render Page                   │
        │                                │
        │  <h1>关于我</h1>               │
        │  <p>中文内容...               │
        └────────────────────────────────┘
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
