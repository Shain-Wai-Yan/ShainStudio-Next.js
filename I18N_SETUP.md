# Bilingual Portfolio i18n Setup Guide

## Overview
Your portfolio now supports automatic language detection with English and Chinese versions. Users from China will automatically see Chinese content, while others see English.

---

## What Has Been Implemented

### 1. **Automatic Language Detection**
- **How it works**: Middleware checks user's `Accept-Language` header on first visit
- **For Chinese users**: Automatically redirected to `/zh` routes
- **For English users**: Stays on `/` routes
- **Memory**: Language preference is stored in a cookie (`NEXT_LOCALE`) for 1 year

### 2. **File Structure Created**
```
src/
├── locales/                    # Translation files
│   ├── en.json                 # English translations
│   └── zh.json                 # Chinese translations
├── lib/
│   └── i18n.ts                 # i18n utilities & functions
├── middleware.ts               # Language detection middleware
├── components/
│   └── LanguageSwitcher.tsx    # Language toggle button (in Header)
├── app/
│   ├── layout.tsx              # Updated with i18n metadata
│   ├── page.tsx                # Home page (English)
│   └── zh/
│       ├── layout.tsx          # Chinese-specific metadata
│       └── page.tsx            # Home page (Chinese)
└── components/
    └── Header.tsx              # Updated with LanguageSwitcher
```

### 3. **URL Structure**
- **English**: `/` (root) + English pages (`/about`, `/portfolio`, etc.)
- **Chinese**: `/zh` + Chinese pages (`/zh/about`, `/zh/portfolio`, etc.)

### 4. **Navigation Links**
- Header automatically adjusts all navigation links based on current language
- Portfolio dropdown menus work in both languages
- Mobile menu supports both languages

### 5. **Language Switcher**
- Located in Header (top-right)
- Shows current language: "EN" or "中文"
- Click to toggle between English and Chinese
- Persists choice in cookie

---

## How to Add More Pages

### For Each New Page, Follow This Pattern:

#### **1. Create English Page**
```tsx
// src/app/about/page.tsx
'use client';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';

export default function AboutPage() {
  const translations = getTranslations('en');
  
  return (
    <main>
      <h1>{translations.hero.title}</h1>
      {/* Your content */}
    </main>
  );
}
```

#### **2. Create Chinese Page (Mirror)**
```tsx
// src/app/zh/about/page.tsx
'use client';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n';

export default function AboutPageZH() {
  const translations = getTranslations('zh');
  
  return (
    <main>
      <h1>{translations.hero.title}</h1>
      {/* Same structure, uses Chinese translations */}
    </main>
  );
}
```

**Key Points:**
- Both pages have identical structure
- Only translations differ (from `locales/en.json` vs `locales/zh.json`)
- Links should use locale-aware paths: `/about` (EN) vs `/zh/about` (ZH)

---

## Managing Translations

### Translation Files Structure

**File**: `src/locales/en.json` and `src/locales/zh.json`

```json
{
  "nav": {
    "home": "Home",
    "about": "About Me"
  },
  "hero": {
    "title": "Welcome to Shain's Studio",
    "subtitle": "Where creativity meets results."
  }
}
```

### To Add New Translations:
1. Open `src/locales/en.json`
2. Add your new keys and English text
3. Open `src/locales/zh.json`
4. Add the same keys with Chinese translations
5. Use in components: `translations.section.key`

---

## Using Translations in Components

### In Page Components:
```tsx
import { getTranslations } from '@/lib/i18n';

export default function Page() {
  const translations = getTranslations('en');
  
  return <h1>{translations.nav.home}</h1>;
}
```

### In Client Components (if needed):
```tsx
'use client';
import { getTranslations } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

export default function MyComponent() {
  const pathname = usePathname();
  const locale = pathname.startsWith('/zh') ? 'zh' : 'en';
  const translations = getTranslations(locale);
  
  return <h1>{translations.nav.home}</h1>;
}
```

---

## Dynamic Content (Strapi Integration)

For semi-dynamic content from Strapi:

### 1. Create Strapi Utility
```tsx
// src/lib/strapi.ts
export async function getPortfolioItems(locale: 'en' | 'zh') {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/portfolio-items?locale=${locale}`
  );
  return res.json();
}
```

### 2. Use in Page
```tsx
// src/app/portfolio/page.tsx
import { getPortfolioItems } from '@/lib/strapi';

export default async function PortfolioPage() {
  const items = await getPortfolioItems('en');
  return <Portfolio items={items} />;
}
```

---

## Header Integration

Your Header component now:
- ✅ Displays navigation links in current language
- ✅ Highlights active routes correctly
- ✅ Includes language switcher button
- ✅ Works on mobile and desktop
- ✅ Redirects links to correct language version

**Example Navigation Updates:**
```tsx
// Links automatically adjust based on locale
const basePath = isChineseRoute ? '/zh' : '';
const aboutLink = `${basePath}/about`;  // '/about' or '/zh/about'
```

---

## SEO & Metadata

### What's Implemented:
- ✅ Separate metadata for English and Chinese versions
- ✅ `hreflang` tags for language alternates
- ✅ Correct `lang` attribute on HTML (`<html lang="en">` or implicit Chinese in `/zh`)
- ✅ Both versions in sitemap (requires sitemap update)
- ✅ OpenGraph metadata includes locale

### For New Pages - Add Metadata:
```tsx
// src/app/portfolio/page.tsx
export const metadata: Metadata = {
  title: "Portfolio | Shain Wai Yan",
  description: "View my portfolio projects...",
};

// src/app/zh/portfolio/page.tsx
export const metadata: Metadata = {
  title: "作品集 | Shain Wai Yan",
  description: "查看我的作品集...",
};
```

---

## Testing the Setup

### Test Language Detection:
1. **Clear browser language preference** (simulate English user)
   - Browser DevTools → Settings → Languages
   - Visit root path `/` → Should see English
   
2. **Simulate Chinese user** (set Accept-Language to `zh-CN`)
   - Use browser DevTools → Network → Edit request headers
   - Set `Accept-Language: zh-CN,zh;q=0.9`
   - Visit `/` → Should redirect to `/zh`

### Test Language Switcher:
1. On any page, click language button (top-right)
2. Select different language
3. Page should update and URL should change
4. Refresh page → Should stay in selected language (cookie works)

### Test Navigation Links:
1. English version: All links should start with `/`
2. Chinese version: All links should start with `/zh`
3. Check mobile menu on both versions

---

## Current Status

### ✅ Completed:
- [x] Automatic language detection (middleware)
- [x] JSON translation files (en.json, zh.json)
- [x] i18n utility functions
- [x] Language switcher component
- [x] Header updated with translations & switcher
- [x] Home page in English (`/page.tsx`)
- [x] Home page in Chinese (`/zh/page.tsx`)
- [x] Chinese-specific metadata (`/zh/layout.tsx`)
- [x] SEO alternates & hreflang tags

### 📋 Still Needed (for 12 pages):
- [ ] Create 11 more page pairs (each in EN and ZH)
  - About page
  - Portfolio pages (6 sub-pages)
  - Certificate page
  - Blog page
  - Contact page

---

## Next Steps - Create Remaining Pages

### Quick Reference - Pages to Create:
```
EN Version                          ZH Version
✅ /page.tsx                         ✅ /zh/page.tsx
❌ /about/page.tsx                   ❌ /zh/about/page.tsx
❌ /portfolio/page.tsx               ❌ /zh/portfolio/page.tsx
❌ /portfolio/business-plan/...      ❌ /zh/portfolio/business-plan/...
❌ /portfolio/marketing-plan/...     ❌ /zh/portfolio/marketing-plan/...
❌ /portfolio/marketing-in-motion/.. ❌ /zh/portfolio/marketing-in-motion/...
❌ /portfolio/coding-projects/...    ❌ /zh/portfolio/coding-projects/...
❌ /portfolio/photography/...        ❌ /zh/portfolio/photography/...
❌ /portfolio/amv-editing/...        ❌ /zh/portfolio/amv-editing/...
❌ /certificate/page.tsx             ❌ /zh/certificate/page.tsx
❌ /blog/page.tsx                    ❌ /zh/blog/page.tsx
❌ /contact/page.tsx                 ❌ /zh/contact/page.tsx
```

### For Each Page:
1. Create the structure with translations
2. Use `getTranslations()` for UI text
3. Add translations to `src/locales/en.json` and `src/locales/zh.json`
4. Mirror pages in both `/app` and `/app/zh`

---

## Troubleshooting

### Issue: Links not switching language
**Solution**: Check that `basePath` is correctly set in Header:
```tsx
const basePath = isChineseRoute ? '/zh' : '';
const href = `${basePath}/about`;  // Correct
```

### Issue: Translations not showing
**Solution**: Ensure you're importing correctly:
```tsx
import { getTranslations } from '@/lib/i18n';  // ✅ Correct path
```

### Issue: Language switcher not persisting
**Solution**: Check browser allows cookies and cookie isn't being cleared

### Issue: Page still in English after switching
**Solution**: Clear browser cache and try again, or open in incognito mode

---

## Support Files

- **Utility Functions**: `src/lib/i18n.ts`
- **Middleware**: `src/middleware.ts`
- **Translations**: `src/locales/en.json`, `src/locales/zh.json`
- **Language Switcher**: `src/components/LanguageSwitcher.tsx`
- **Header (Updated)**: `src/components/Header.tsx`

All components are ready to use - just follow the patterns shown above for new pages!
