import { localizedSeo } from '@/lib/content-localization';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { MarketingProject } from '@/lib/strapi/marketing-in-motion';
import {
  getMarketingProject,
  getRelatedMarketingProjects,
} from '@/lib/server/project-data';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, brandedTitle } from '@/lib/seo';

// Build no CMS detail pages up front. Each slug is generated on first request,
// cached, and refreshed with ISR without making deployments depend on Strapi.
export const revalidate = 300;
export function generateStaticParams() {
  return [];
}

interface MarketingProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(
  props: MarketingProjectPageProps
): Promise<Metadata> {
  const { locale: rawLocale, slug } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { project, error } = await getMarketingProject(slug, locale);
  const t = await getDictionary(locale); // ✅ CHANGE: async

  if (error) throw new Error(error);
  if (!project) {
    return { title: t.marketingInMotion.seo.projectNotFoundTitle || 'Project Not Found | Shain Studio' };
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  return {
    title: { absolute: brandedTitle(project.seo.metaTitle || project.title, 'Shain Studio') },
    description: project.seo.metaDescription,
    keywords: project.tags && project.toolsUsed && project.category 
      ? [...project.tags, ...project.toolsUsed, project.category].join(', ')
      : t.marketingInMotion.seo.keywords,
    ...localizedSeo(`/portfolio/marketing-in-motion/${project.slug}`, locale === 'zh' ? 'zh' : 'en', project.localization, project.seo?.noIndex, project.seo?.canonicalUrl),
    openGraph: {
      type: 'article',
      url: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}`,
      title: project.seo.metaTitle || project.title,
      description: project.seo.metaDescription || project.summary,
      images: [project.seo.ogImage || project.coverImage || DEFAULT_OG_IMAGE],
      siteName: 'Shain Studio',
      authors: ['Shain Wai Yan'],
      publishedTime: project.projectDate,
      modifiedTime: project.updatedAt,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo.metaTitle || project.title,
      description: project.seo.metaDescription || project.summary,
      images: [project.seo.ogImage || project.coverImage || DEFAULT_OG_IMAGE],
    },
  };
}

import MarketingProjectView from '@/components/content-views/MarketingProjectView';

export default async function MarketingProjectPage(
  props: MarketingProjectPageProps
) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const {project,error}=await getMarketingProject(slug,locale);

  if (error) throw new Error(error);
  if (!project) {
    notFound();
  }

  let relatedProjects: MarketingProject[] = [];
  try {
    const { projects, error: relatedError } = await getRelatedMarketingProjects(
      project.category,
      project.slug,
      3,
      locale,
    );
    if (!relatedError) {
      relatedProjects = projects;
    }
  } catch (err) {
    console.warn(`[MarketingProjectPage] Failed to fetch related projects for "${slug}":`, err);
    // silently degrade
  }

  return <MarketingProjectView project={project} relatedProjects={relatedProjects} locale={locale} />;
}
