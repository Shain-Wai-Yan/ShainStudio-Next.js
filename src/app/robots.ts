import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.shainwaiyan.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          // ── English pages — all allowed ──────────────────────────────────
          '/about',
          '/blog',
          '/blog/',           // blog index
          '/certificate',
          '/contact',
          '/portfolio',
          '/portfolio/',

          // ── Chinese STATIC translated pages only ─────────────────────────
          // These have genuine translations and are worth indexing
          '/zh',
          '/zh/about',
          '/zh/portfolio',        // portfolio INDEX page only — not individual projects
          '/zh/contact',
        ],
        disallow: [
          // ── System paths ─────────────────────────────────────────────────
          '/api/',
          '/_next/',
          '/private/',

          // ── Chinese dynamic blog posts ────────────────────────────────────
          // Same Strapi content as English, not translated
          '/zh/blog', 
          // This blocks /zh/blog/any-slug
          '/zh/blog/',

          // ── Chinese portfolio dynamic pages ───────────────────────────────
          // All fetched from same Strapi/GitHub/YouTube as English
          // No translation, pure duplicate content
          '/zh/portfolio/',

          // ── Chinese certificate page ──────────────────────────────────────
          // Same Credly badges, no translation
          '/zh/certificate',
        ],
      },

      // ── Block AI training bots ────────────────────────────────────────────
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Google-Extended'],
        disallow: ['/'],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}