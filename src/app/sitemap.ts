import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { getLocalizedRows } from '@/lib/server/localized-content';
import type { ContentLocalization } from '@/types/localization';
const SITE_URL = 'https://www.shainwaiyan.com';
export const revalidate = 300;
const staticRoutes = {
  // English main pages
  main: [
    { path: '/',            priority: 1.0, changeFrequency: 'weekly'  as const },
    { path: '/about',       priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/blog',        priority: 0.9, changeFrequency: 'daily'   as const },
    { path: '/certificate', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact',     priority: 0.8, changeFrequency: 'yearly'  as const },
    { path: '/hobbies',     priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/hobbies/amv-editing', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/hobbies/gaming', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/hobbies/photography', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/hobbies/pencil-art', priority: 0.7, changeFrequency: 'monthly' as const },
    // /privacy and /terms are intentionally noindex — keep them out of the sitemap
  ],
  // English portfolio pages
  portfolio: [
    { path: '/portfolio',                             priority: 0.9, changeFrequency: 'weekly'  as const },
    { path: '/portfolio/business-plans',              priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/portfolio/coding-projects',             priority: 0.8, changeFrequency: 'weekly'  as const },
    { path: '/portfolio/coding-projects/archive',     priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/portfolio/marketing-in-motion',         priority: 0.8, changeFrequency: 'weekly'  as const },
    { path: '/portfolio/marketing-plans',             priority: 0.7, changeFrequency: 'monthly' as const },
  ],
  // Chinese STATIC pages only — pages with genuine translations
  // Excluded: /zh/blog, /zh/blog/[slug], /zh/portfolio/*, /zh/certificate
  // Reason: those pages serve identical Strapi/GitHub/YouTube content with no translation
  zhMain: [
    { path: '/zh',           priority: 0.9, changeFrequency: 'weekly'  as const },
    { path: '/zh/about',     priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/zh/portfolio', priority: 0.8, changeFrequency: 'weekly'  as const },
    { path: '/zh/contact',   priority: 0.7, changeFrequency: 'yearly'  as const },
    { path: '/zh/hobbies',   priority: 0.6, changeFrequency: 'monthly' as const },
  ],
};


const collections = [
  ['blogs','/blog', '/blog/'],
  ['coding-projects','/portfolio/coding-projects','/portfolio/coding-projects/'],
  ['marketing-projects','/portfolio/marketing-in-motion','/portfolio/marketing-in-motion/'],
  ['photographies','/hobbies/photography','/hobbies/photography/photo/'],
  ['arts','/hobbies/pencil-art','/hobbies/pencil-art/'],
  ['certificates','/certificate',null],
  ['business-plans','/portfolio/business-plans',null],
  ['marketing-plans','/portfolio/marketing-plans',null],
] as const;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The sitemap needs published CMS data at request time, not during deployment.
  // Keep locale snapshot caching/invalidation; unavailable data must still throw.
  await connection();
  const pages: MetadataRoute.Sitemap = [...staticRoutes.main,...staticRoutes.portfolio,...staticRoutes.zhMain].map(route => ({
    url: `${SITE_URL}${route.path}`,changeFrequency:route.changeFrequency,priority:route.priority,
  }));
  const translatedStatic = new Set(['/','/about','/portfolio','/hobbies','/contact']);
  for (const page of pages) {
    const path = new URL(page.url).pathname.replace(/^\/zh(?=\/|$)/,'') || '/';
    if (translatedStatic.has(path)) page.alternates={languages:{en:`${SITE_URL}${path}`,'zh-CN':`${SITE_URL}/zh${path === '/' ? '' : path}`,'x-default':`${SITE_URL}${path}`}};
  }
  // Fetch complete cached locale snapshots; never return a partial sitemap on failure.
  for (const [endpoint,listPath,prefix] of collections) {
    const options = ['blogs','coding-projects','marketing-projects'].includes(endpoint) ? {queryParams:{'populate[seo]':true}} : {};
    const [english,rows] = await Promise.all([getLocalizedRows(endpoint,'en',options),getLocalizedRows(endpoint,'zh',options)]);
    const englishById = new Map(english.map(row => [row.documentId,row]));
    if (rows.some(row => (row.localization as ContentLocalization).chinesePublished)) {
      pages.push({url:`${SITE_URL}/zh${listPath}`,changeFrequency:'weekly',priority:0.7});
      if (endpoint === 'coding-projects') pages.push({url:`${SITE_URL}/zh${listPath}/archive`,changeFrequency:'weekly',priority:0.5});
    }
    if (!prefix) continue;
    for (const row of rows) {
      const identity = endpoint === 'photographies' ? row.documentId : row.slug;
      if (typeof identity !== 'string' || !/^[a-z0-9_-]+$/i.test(identity)) continue;
      const state = row.localization as ContentLocalization;
      const path = `${prefix}${identity}`;
      const languages: Record<string,string> = {};
      const enNoIndex = (englishById.get(row.documentId)?.seo as {noIndex?:boolean} | undefined)?.noIndex;
      const zhNoIndex = (row.seo as {noIndex?:boolean} | undefined)?.noIndex;
      if (state.englishPublished && !enNoIndex) languages.en = `${SITE_URL}${path}`;
      if (state.chinesePublished && !zhNoIndex) languages['zh-CN'] = `${SITE_URL}/zh${path}`;
      languages['x-default'] = languages.en ?? languages['zh-CN'];
      for (const language of ['en','zh-CN']) if (languages[language]) pages.push({
        url:languages[language],lastModified:typeof row.updatedAt === 'string' ? row.updatedAt : undefined,
        changeFrequency:'monthly',priority:0.6,alternates:{languages},
      });
    }
  }
  return pages;
}
