# Project Blueprint: Shain Studio Portfolio

## 1. Overview & Purpose
Shain Studio is the personal portfolio of Shain Wai Yan (Xolbine, 明元易), a Technical Marketer and MarTech specialist. The application showcases technical marketing work, MarTech engineering, AI-driven automation, creative technology, and personal hobbies.

Built on Next.js (App Router), React 19, Tailwind CSS v4, and integrated with Strapi CMS and YouTube Data APIs, the portfolio presents an editorial, high-performance experience with strict internationalization (English & Chinese), SEO optimization, and rich theme styling (light mode and dark mode).

---

## 2. Project Architecture & Feature Outline

### Core Tech Stack
- **Framework:** Next.js (App Router with dynamic `[locale]` routing: `en` root, `/zh` for Chinese)
- **Styling:** Tailwind CSS v4 with custom design tokens (`--color-midnight`, `--color-gold`, etc.)
- **Theming:** `next-themes` with class-based `.dark` mode and system fallback
- **CMS & Backend:** Strapi v5 (Cloudinary asset storage) & YouTube Data API
- **Fonts:** Inter (`--font-sans`) and Playfair Display (`--font-serif`)

### Key Routes & Features
- `/` & `/zh`: Home landing page.
- `/about`: Professional journey, technical skill matrix, and philosophy.
- `/portfolio`: Client projects, case studies, and marketing systems.
- `/hobbies`: Personal creative studio hub for hobbies.
- `/hobbies/photography`: Curated photography gallery with infinite scroll, collections filtering, and lightbox.
- `/hobbies/amv-editing`: Video editing showcase featuring YouTube channel integration and video playback.
- `/contact`: Interactive contact gateway.

---

## 3. Current Task: Clean & Minimalist Hobbies Landing Page Redesign (`/hobbies`)

### Guidelines & Scope
- **Target Page ONLY:** `src/app/[locale]/hobbies/page.tsx`. Photography and AMV editing sub-pages remain unchanged.
- **Light Mode Background:** Pure, crisp white background (`bg-white`), dark mode (`dark:bg-[#0e0e10]`).
- **Clean, Decluttered Layout:** Avoid messy widgets, fake timeline counters, artificial equalizer bars, or pretentious marketing over-claims.
- **Honest & Authentic Tone:** A genuine personal space for hobbies outside daily work.
- **Modular Structure for Future Pursuits:**
  - Active pursuits: **01 Photography** (landscapes, light, everyday captures) and **02 AMV Editing** (anime music videos & rhythm cuts).
  - In the pipeline / future pursuits: **Piano** (practicing soundtrack pieces and classical melodies) and **Gaming** (favorite titles and casual storytelling).
