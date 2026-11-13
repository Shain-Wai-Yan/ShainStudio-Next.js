import { localizedSeo } from '@/lib/content-localization';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CodingProject } from '@/lib/strapi/coding-projects';
import {
  getCodingProject,
  getRelatedCodingProjects,
} from '@/lib/server/project-data';

import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { SITE_URL, DEFAULT_OG_IMAGE, brandedTitle } from '@/lib/seo';

// Build no CMS detail pages up front. Each slug is generated on first request,
// cached, and refreshed with ISR without making deployments depend on Strapi.
export const revalidate = 300;
export function generateStaticParams() {
  return [];
}

interface CodingProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(
  { params }: CodingProjectPageProps
): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { project, error } = await getCodingProject(slug, locale);

  if (error) throw new Error(error);
  if (!project) {
    return { title: 'Project Not Found | Shain Studio' };
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const safeKeywords = [
    ...(project.tags || []),
    ...(project.toolsUsed || []),
    project.category,
  ].filter(Boolean).join(', ');

  return {
    title: { absolute: brandedTitle(project.seo?.metaTitle || `${project.title} | ${locale === 'zh' ? '软件架构' : 'Software Architecture'}`, 'Shain Studio') },
    description: project.seo?.metaDescription || project.summary,

    keywords: safeKeywords,
    ...localizedSeo(`/portfolio/coding-projects/${project.slug}`, locale === 'zh' ? 'zh' : 'en', project.localization, project.seo?.noIndex, project.seo?.canonicalUrl),
    openGraph: {
      type: 'article',
      url: `${SITE_URL}${basePath}/portfolio/coding-projects/${project.slug}`,
      title: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.summary,
      images: [project.seo?.ogImage || project.coverImage || DEFAULT_OG_IMAGE],
      siteName: 'Shain Studio',
      authors: ['Shain Wai Yan'],
      publishedTime: project.projectDate ? new Date(project.projectDate).toISOString() : undefined,
      modifiedTime: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.summary,
      images: [project.seo?.ogImage || project.coverImage || DEFAULT_OG_IMAGE],
    },
  };
}

import CodingProjectView from '@/components/content-views/CodingProjectView';

export default async function CodingProjectDetailPage({ params }: CodingProjectPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const {project,error}=await getCodingProject(slug,locale);

  if (error) throw new Error(error);
  if (!project) {
    notFound();
  }

  let relatedProjects: CodingProject[] = [];
  try {
    const { projects, error: relatedError } = await getRelatedCodingProjects(
      project.category,
      project.slug,
      3,
      locale,
    );
    if (!relatedError) {
      relatedProjects = projects;
    }
  } catch (err) {
    console.warn(`[CodingProjectDetailPage] Failed to fetch related projects for "${slug}":`, err);
    // silently degrade
  }

  return <CodingProjectView project={project} relatedProjects={relatedProjects} locale={locale} />;
}
