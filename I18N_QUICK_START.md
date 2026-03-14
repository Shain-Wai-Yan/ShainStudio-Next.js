# i18n Setup - Quick Start Guide

## What Just Happened? 🎉

Your portfolio now supports **automatic language detection**:
- 🇨🇳 Chinese users → automatically see `/zh` (Chinese version)
- 🇺🇸 English users → see `/` (English version)
- 🔄 Users can toggle language with button in header
- 💾 Choice is remembered in browser cookie

---

## Test It Now

1. **Visit your site**: Open the root URL
2. **Check Header**: You should see a language button (top-right)
3. **Click the button**: Toggle between "EN" and "中文"
4. **Refresh page**: Language preference should persist

---

## Files Created/Modified

### New Files (No changes needed, they work as-is):
```
✅ src/locales/en.json              - English translations
✅ src/locales/zh.json              - Chinese translations  
✅ src/lib/i18n.ts                  - Helper functions
✅ src/middleware.ts                - Language detection
✅ src/components/LanguageSwitcher.tsx - Toggle button
✅ src/app/zh/layout.tsx            - Chinese metadata
✅ src/app/zh/page.tsx              - Chinese home page
✅ I18N_SETUP.md                    - Full documentation
✅ PAGE_TEMPLATE.tsx                - Template for new pages
```

### Modified Files:
```
📝 src/components/Header.tsx        - Added language switcher + bilingual nav
📝 src/app/layout.tsx               - Updated SEO metadata
```

---

## Your Next Steps - Creating 11 More Pages

You have 12 pages total. You've completed 1 (home). Here are the remaining 11:

### Pages to Create:
```
1. About Me              → /about              & /zh/about
2. Portfolio             → /portfolio          & /zh/portfolio
   - Business Plans      → /portfolio/business-plan & /zh/portfolio/business-plan
   - Marketing Plans     → /portfolio/marketing-plan & /zh/portfolio/marketing-plan
   - Marketing in Motion → /portfolio/marketing-in-motion & /zh/portfolio/marketing-in-motion
   - Coding Projects     → /portfolio/coding-projects & /zh/portfolio/coding-projects
   - Photography         → /portfolio/photography & /zh/portfolio/photography
   - AMV Editing         → /portfolio/amv-editing & /zh/portfolio/amv-editing
3. Certificate          → /certificate          & /zh/certificate
4. Blog                 → /blog                 & /zh/blog
5. Contact              → /contact              & /zh/contact
```

---

## How to Create a New Page (Example: About)

### Step 1: Add Translations

Edit `src/locales/en.json` and add:
```json
{
  "about": {
    "title": "About Me",
    "subtitle": "My Story",
    "bio": "Your bio text here...",
    "skills": "My expertise..."
  }
}
```

Edit `src/locales/zh.json` and add same keys with Chinese:
```json
{
  "about": {
    "title": "关于我",
    "subtitle": "我的故事",
    "bio": "你的个人简介...",
    "skills": "我的专业知识..."
  }
}
```

### Step 2: Create English Page

Create file: `src/app/about/page.tsx`

```tsx
'use client';
import React from 'react';
import { getTranslations } from '@/lib/i18n';

export default function AboutPage() {
  const translations = getTranslations('en');

  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '60px' }}>
      <section style={{ padding: '5rem 2rem', backgroundColor: '#f9f9f9' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 style={{ color: '#191970', fontSize: '3rem', fontWeight: 'bold', textAlign: 'center' }}>
            {translations.about.title}
          </h1>
          <p style={{ color: '#666666', fontSize: '1.2rem', textAlign: 'center', marginTop: '1rem' }}>
            {translations.about.subtitle}
          </p>
        </div>
      </section>

      <section style={{ padding: '5rem 2rem' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <p style={{ color: '#333333', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
            {translations.about.bio}
          </p>
          <p style={{ color: '#333333', fontSize: '1rem', lineHeight: '1.7' }}>
            {translations.about.skills}
          </p>
        </div>
      </section>
    </main>
  );
}
```

### Step 3: Create Chinese Page

Create file: `src/app/zh/about/page.tsx` - **Copy the exact same code** but change:
```tsx
const translations = getTranslations('zh');  // Change 'en' to 'zh'
```

That's it! Both pages will now work with their respective translations.

---

## Key Patterns to Remember

### Pattern 1: Using Translations
```tsx
// Always import and get translations at the top
import { getTranslations } from '@/lib/i18n';

const translations = getTranslations('en');  // 'en' or 'zh'

// Use them anywhere
<h1>{translations.section.title}</h1>
<p>{translations.section.description}</p>
```

### Pattern 2: Language-Aware Links
```tsx
// Header already handles this, but for your pages:
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MyComponent() {
  const pathname = usePathname();
  const isChineseRoute = pathname.startsWith('/zh');
  const basePath = isChineseRoute ? '/zh' : '';
  
  return (
    <Link href={`${basePath}/portfolio`}>
      View Portfolio
    </Link>
  );
}
```

### Pattern 3: Directory Structure
```
For a new page named "services":
- English version:  src/app/services/page.tsx
- Chinese version:  src/app/zh/services/page.tsx

For nested pages like portfolio sub-items:
- English: src/app/portfolio/[name]/page.tsx
- Chinese: src/app/zh/portfolio/[name]/page.tsx
```

---

## Translation File Structure

Keep translations organized like this:

```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "portfolio": "Portfolio",
    "contact": "Contact"
  },
  "hero": {
    "title": "Welcome",
    "subtitle": "Subtitle text",
    "cta": "Call to action"
  },
  "about": {
    "title": "About Me",
    "bio": "Your bio",
    "skills": "Skills text"
  },
  "portfolio": {
    "title": "My Work",
    "description": "Portfolio description"
  },
  "contact": {
    "title": "Get In Touch",
    "email": "Email",
    "phone": "Phone"
  }
}
```

---

## Important Notes

### ✅ DO:
- Use `getTranslations()` for all text content
- Keep English and Chinese JSON files in sync (same keys)
- Create pages in pairs (one in `/app`, one in `/app/zh`)
- Use consistent styling for both language versions

### ❌ DON'T:
- Hardcode text in components (use translations)
- Create pages only in English or only in Chinese
- Import translation files directly - use `getTranslations()`
- Forget to add metadata to new pages

---

## Tips for Efficient Creation

### Use Batch Creation:
1. Create all English pages first in `/app`
2. Mirror them all to `/app/zh` by changing:
   - `getTranslations('en')` → `getTranslations('zh')`
3. Add all translations to JSON files at once

### Use Existing Component Structure:
Your current home page has all the components you need:
- Hero sections
- Card layouts
- Skill bars
- Certificate cards
- Call-to-action sections

Copy these patterns for other pages.

### Test As You Go:
After creating each page:
1. View English version: `yoursite.com/about`
2. View Chinese version: `yoursite.com/zh/about`
3. Click language switcher to confirm both work

---

## Troubleshooting

### Links show 404
**Check**: Do both English and Chinese page files exist?
- `src/app/about/page.tsx` ✅
- `src/app/zh/about/page.tsx` ✅

### Translations show as undefined
**Check**: Is the translation key defined in both JSON files?
```json
// en.json AND zh.json must have:
{ "about": { "title": "..." } }
```

### Header navigation doesn't switch language
**This is normal** - The header switches based on URL:
- `/about` → English nav links to `/about`
- `/zh/about` → Chinese nav links to `/zh/about`

Click the language toggle button to switch.

---

## File Locations Quick Reference

| File | Purpose |
|------|---------|
| `src/locales/en.json` | English text translations |
| `src/locales/zh.json` | Chinese text translations |
| `src/lib/i18n.ts` | Helper functions (don't edit) |
| `src/middleware.ts` | Language detection (don't edit) |
| `src/components/LanguageSwitcher.tsx` | Language toggle (don't edit) |
| `src/components/Header.tsx` | Navigation (updated, ready to use) |
| `src/app/[pagename]/page.tsx` | English pages |
| `src/app/zh/[pagename]/page.tsx` | Chinese pages |

---

## You're All Set! 🚀

Everything is configured and working. Now you just need to:

1. ✅ Understand the pattern (see examples above)
2. ✅ Create 11 more page pairs
3. ✅ Add translations for each
4. ✅ Deploy!

For detailed documentation, see `I18N_SETUP.md` in the root directory.
