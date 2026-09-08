import { MetadataRoute } from 'next';
import { fetchFromStrapi } from '@/lib/strapi/client';
import { repository as photographyRepository } from '@/lib/server/photography-data';

const SITE_URL = 'https://www.shainwaiyan.com';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  slug: string;
  updatedAt?: string;
  publishDate?: string;
}

interface MarketingProject {
  slug: string;
  updatedAt?: string;
  projectDate?: string;
}

interface CodingProjectSlug {
  slug: string;
  updatedAt?: string;
  projectDate?: string;
}

interface StrapiSitemapResponse<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
    };
  };
}

function normalizeEntry<T extends { slug: string }>(entry: T & { attributes?: Partial<T> }): T {
  return { ...entry, ...(entry.attributes ?? {}) } as T;
}

// ─── Static Routes Configuration ──────────────────────────────────────────────
// IMPORTANT: Only include pages that are genuinely translated/unique.
// Pages that just serve the same Strapi content with no translation
// are excluded to avoid duplicate content penalties.

const staticRoutes = {
  // English main pages
  main: [
    { path: '/',            priority: 1.0, changeFrequency: 'weekly'  as const },
    { path: '/about',       priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/blog',        priority: 0.9, changeFrequency: 'daily'   as const },
    { path: '/certificate', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact',     priority: 0.8, changeFrequency: 'yearly'  as const },
    // /privacy and /terms are intentionally noindex — keep them out of the sitemap
  ],
  // English portfolio pages
  portfolio: [
    { path: '/portfolio',                             priority: 0.9, changeFrequency: 'weekly'  as const },
    { path: '/portfolio/amv-editing',                 priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/portfolio/business-plans',              priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/portfolio/coding-projects',             priority: 0.8, changeFrequency: 'weekly'  as const },
    { path: '/portfolio/coding-projects/archive',     priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/portfolio/marketing-in-motion',         priority: 0.8, changeFrequency: 'weekly'  as const },
    { path: '/portfolio/marketing-plans',             priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/portfolio/photography',                 priority: 0.7, changeFrequency: 'monthly' as const },
  ],
  // Chinese STATIC pages only — pages with genuine translations
  // Excluded: /zh/blog, /zh/blog/[slug], /zh/portfolio/*, /zh/certificate
  // Reason: those pages serve identical Strapi/GitHub/YouTube content with no translation
  zhMain: [
    { path: '/zh',           priority: 0.9, changeFrequency: 'weekly'  as const },
    { path: '/zh/about',     priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/zh/portfolio', priority: 0.8, changeFrequency: 'weekly'  as const },
    { path: '/zh/contact',   priority: 0.7, changeFrequency: 'yearly'  as const },
  ],
};

// ─── Dynamic Content Fetchers ─────────────────────────────────────────────────
// Using direct Strapi API calls instead of fetchFromStrapi wrapper
// to ensure reliability in sitemap generation context

async function fetchAllBlogSlugs(): Promise<BlogPost[]> {
  try {
    const res = await fetchFromStrapi<StrapiSitemapResponse<BlogPost>>('blogs', {
      queryParams: {
        'pagination[pageSize]': 100,
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
        'fields[2]': 'publishDate',
        'sort': 'publishDate:desc',
      },
      timeout: 10000, // Strapi cold starts exceed the 3s default
    });

    if (res.error) {
      console.error('[Sitemap] Strapi blogs error:', res.error);
      return [];
    }

    const posts = (res.data?.data ?? []).map(normalizeEntry).filter((post) => Boolean(post.slug));
    console.log(`[Sitemap] Fetched ${posts.length} blog posts from Strapi`);
    return posts;
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blog slugs:', error);
    return [];
  }
}

async function fetchAllMarketingProjectSlugs(): Promise<MarketingProject[]> {
  try {
    const res = await fetchFromStrapi<StrapiSitemapResponse<MarketingProject>>('marketing-projects', {
      queryParams: {
        'pagination[pageSize]': 100,
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
        'fields[2]': 'projectDate',
        'sort': 'projectDate:desc',
      },
      timeout: 10000, // Strapi cold starts exceed the 3s default
    });

    if (res.error) {
      console.error('[Sitemap] Strapi marketing-projects error:', res.error);
      return [];
    }

    const projects = (res.data?.data ?? []).map(normalizeEntry).filter((project) => Boolean(project.slug));
    console.log(`[Sitemap] Fetched ${projects.length} marketing projects from Strapi`);
    return projects;
  } catch (error) {
    console.error('[Sitemap] Failed to fetch marketing project slugs:', error);
    return [];
  }
}

async function fetchAllCodingProjectSlugs(): Promise<CodingProjectSlug[]> {
  try {
    const res = await fetchFromStrapi<StrapiSitemapResponse<CodingProjectSlug>>('coding-projects', {
      queryParams: {
        'pagination[pageSize]': 100,
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
        'fields[2]': 'projectDate',
        'sort': 'projectDate:desc',
      },
      timeout: 10000, // Strapi cold starts exceed the 3s default
    });

    if (res.error) {
      console.error('[Sitemap] Strapi coding-projects error:', res.error);
      return [];
    }

    const projects = (res.data?.data ?? []).map(normalizeEntry).filter((project) => Boolean(project.slug));
    console.log(`[Sitemap] Fetched ${projects.length} coding projects from Strapi`);
    return projects;
  } catch (error) {
    console.error('[Sitemap] Failed to fetch coding project slugs:', error);
    return [];
  }
}

// ─── Sitemap Generator ────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const translatedPaths = new Set(['/', '/about', '/portfolio', '/contact']);

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    ...staticRoutes.main,
    ...staticRoutes.portfolio,
    ...staticRoutes.zhMain,
  ].map((route) => {
    const englishPath = route.path.startsWith('/zh')
      ? route.path.replace('/zh', '') || '/'
      : route.path;
    const translated = translatedPaths.has(englishPath);

    return {
      url: `${SITE_URL}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...(translated && {
        alternates: {
          languages: {
            en: `${SITE_URL}${englishPath}`,
            zh: `${SITE_URL}/zh${englishPath === '/' ? '' : englishPath}`,
            'x-default': `${SITE_URL}${englishPath}`,
          },
        },
      }),
    };
  });

  // ── English blog posts ONLY ───────────────────────────────────────────────
  // zh/blog/[slug] pages are NOT included — same Strapi content, not translated
  // No language filter — all posts in Strapi are English by default
  const blogPosts = await fetchAllBlogSlugs();

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // ── English marketing projects ONLY ──────────────────────────────────────
  // zh/portfolio/marketing-in-motion/[slug] pages are NOT included
  // Same content as English, fetched from same Strapi source
  const marketingProjects = await fetchAllMarketingProjectSlugs();

  const marketingPages: MetadataRoute.Sitemap = marketingProjects.map((project) => ({
    url: `${SITE_URL}/portfolio/marketing-in-motion/${project.slug}`,
    lastModified: project.updatedAt || project.projectDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ── English coding projects ONLY ─────────────────────────────────────────
  // Same logic as above: EN URL with ZH alternate
  const codingProjects = await fetchAllCodingProjectSlugs();

  const codingPages: MetadataRoute.Sitemap = codingProjects.map((project) => ({
    url: `${SITE_URL}/portfolio/coding-projects/${project.slug}`,
    lastModified: project.updatedAt || project.projectDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  let photoPages: MetadataRoute.Sitemap = [];
  try {
    const photos = await photographyRepository.getSitemapPhotos();
    photoPages = photos.flatMap((photo) => photo.documentId ? [{
      url: `${SITE_URL}/portfolio/photography/photo/${photo.documentId}`,
      lastModified: photo.updatedAt || undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }] : []);
  } catch (error) {
    console.error('[Sitemap] Failed to fetch photography records:', error);
  }

  // ── Combine all pages ─────────────────────────────────────────────────────
  const allPages = [
    ...staticPages,
    ...blogPages,
    ...marketingPages,
    ...codingPages,
    ...photoPages,
  ];

  console.log(`[Sitemap] Generated sitemap with ${allPages.length} URLs:`);
  console.log(`  - Static pages: ${staticPages.length}`);
  console.log(`  - Blog posts (EN only): ${blogPages.length}`);
  console.log(`  - Marketing projects (EN only): ${marketingPages.length}`);
  console.log(`  - Coding projects (EN only): ${codingPages.length}`);
  console.log(`  - Photography details (EN only): ${photoPages.length}`);

  return allPages;
}
