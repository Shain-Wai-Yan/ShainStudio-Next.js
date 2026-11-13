import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { getLocalizedRows } from '@/lib/server/localized-content';
import type { ContentLocalization } from '@/types/localization';
import { collectionLocalization, localizedSeo } from '@/lib/content-localization';
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
  // Static Chinese pages. CMS listings and details are added from publication state below.
  // External-feed gaming/AMV pages retain their separate noindex policy.
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
  type SitemapEntry = MetadataRoute.Sitemap[number];
  const pages = new Map<string, SitemapEntry>();
  const addPage = (entry: SitemapEntry) => pages.set(entry.url, { ...pages.get(entry.url), ...entry });
  for (const route of [...staticRoutes.main,...staticRoutes.portfolio,...staticRoutes.zhMain]) {
    addPage({url:`${SITE_URL}${route.path}`,changeFrequency:route.changeFrequency,priority:route.priority});
  }
  const translatedStatic = new Set(['/','/about','/portfolio','/hobbies','/contact']);
  for (const page of pages.values()) {
    const path = new URL(page.url).pathname.replace(/^\/zh(?=\/|$)/,'') || '/';
    if (translatedStatic.has(path)) page.alternates={languages:{en:`${SITE_URL}${path}`,'zh-CN':`${SITE_URL}/zh${path === '/' ? '' : path}`,'x-default':`${SITE_URL}${path}`}};
  }
  // Fetch complete cached locale snapshots; never return a partial sitemap on failure.
  for (const [endpoint,listPath,prefix] of collections) {
    // Read identity, timestamps, indexability and gallery image URLs; never article bodies.
    const queryParams: Record<string, string> = { 'fields[0]': 'updatedAt' };
    if (['blogs','coding-projects','marketing-projects'].includes(endpoint)) {
      queryParams['populate[seo][fields][0]'] = 'noIndex';
    }
    if (['photographies','arts'].includes(endpoint)) queryParams['populate[image][fields][0]'] = 'url';
    const options = { queryParams };
    const [english,rows] = await Promise.all([getLocalizedRows(endpoint,'en',options),getLocalizedRows(endpoint,'zh',options)]);
    const englishById = new Map(english.map(row => [row.documentId,row]));
    const state = collectionLocalization('zh', rows as Array<{localization?: ContentLocalization}>);
    const listPaths = endpoint === 'coding-projects' ? [listPath,`${listPath}/archive`] : [listPath];
    for (const path of listPaths) {
      const alternates = localizedSeo(path,'zh',state).alternates.languages;
      if (alternates?.en) addPage({url:alternates.en,alternates:{languages:alternates}});
      if (state.chinesePublished && alternates?.['zh-CN']) {
        addPage({url:alternates['zh-CN'],changeFrequency:'weekly',priority:path.endsWith('/archive')?0.5:0.7,alternates:{languages:alternates}});
      }
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
      if (!Object.keys(languages).length) continue;
      languages['x-default'] = languages.en ?? languages['zh-CN'];
      for (const language of ['en','zh-CN']) if (languages[language]) {
        const localizedRow = language === 'en' ? englishById.get(row.documentId) : row;
        const image = localizedRow?.image as {url?:unknown} | undefined;
        const images = typeof image?.url === 'string' && /^https?:\/\//i.test(image.url) ? [image.url] : undefined;
        addPage({url:languages[language],lastModified:typeof localizedRow?.updatedAt === 'string' ? localizedRow.updatedAt : undefined,
          changeFrequency:'monthly',priority:0.6,alternates:{languages},...(images?{images}:{})});
      }
    }
  }
  return [...pages.values()];
}
