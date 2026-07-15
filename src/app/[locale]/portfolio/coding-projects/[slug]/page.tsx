import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  fetchCodingProjectBySlug,
  fetchCodingProjects,
  fetchRelatedCodingProjects,
  type CodingProject,
} from '@/lib/strapi/coding-projects';

import CodingProjectHeader from '@/components/coding-project/CodingProjectHeader';
import CodingProjectContent from '@/components/coding-project/CodingProjectContent';
import CodingProjectGallery from '@/components/coding-project/CodingProjectGallery';
import RelatedCodingProjects from '@/components/coding-project/RelatedCodingProjects';
import TableOfContents from '@/components/shared/TableOfContents';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { SITE_URL, DEFAULT_OG_IMAGE, PERSON_ID, orgRef } from '@/lib/seo';

export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow new projects to be fetched at runtime

export async function generateStaticParams() {
  const { projects } = await fetchCodingProjects(1, 100);
  const locales = ['en', 'zh'];

  return locales.flatMap((locale) =>
    projects.map((project) => ({
      locale,
      slug: project.slug,
    }))
  );
}

interface CodingProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(
  { params }: CodingProjectPageProps
): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { project, error } = await fetchCodingProjectBySlug(slug);

  if (error || !project) {
    return { title: 'Project Not Found | Shain Studio' };
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const safeKeywords = [
    ...(project.tags || []),
    ...(project.toolsUsed || []),
    project.category,
  ].filter(Boolean).join(', ');

  return {
    title: project.seo?.metaTitle || `${project.title} | Software Architecture | Shain Studio`,
    description: project.seo?.metaDescription || project.summary,

    keywords: safeKeywords,
    alternates: {
      canonical: `${SITE_URL}${basePath}/portfolio/coding-projects/${project.slug}`,
      languages: {
        en: `${SITE_URL}/portfolio/coding-projects/${project.slug}`,
        zh: `${SITE_URL}/zh/portfolio/coding-projects/${project.slug}`,
        'x-default': `${SITE_URL}/portfolio/coding-projects/${project.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}${basePath}/portfolio/coding-projects/${project.slug}`,
      title: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.summary,
      images: project.seo?.ogImage ? [project.seo.ogImage] : project.coverImage ? [project.coverImage] : [],
      authors: ['Shain Wai Yan'],
      publishedTime: project.projectDate ? new Date(project.projectDate).toISOString() : undefined,
      modifiedTime: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo?.metaTitle || project.title,
      description: project.seo?.metaDescription || project.summary,
      images: project.seo?.ogImage ? [project.seo.ogImage] : project.coverImage ? [project.coverImage] : [],
    },
  };
}

export default async function CodingProjectDetailPage({ params }: CodingProjectPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const [ { project, error }, t ] = await Promise.all([
    fetchCodingProjectBySlug(slug),
    getDictionary(locale)
  ]);

  if (error || !project) {
    notFound();
  }

  let relatedProjects: CodingProject[] = [];
  try {
    const { projects, error: relatedError } = await fetchRelatedCodingProjects(
      project.category,
      project.slug,
      3,
      1500 // 1.5s timeout for related content
    );
    if (!relatedError) {
      relatedProjects = projects;
    }
  } catch (err) {
    console.warn(`[CodingProjectDetailPage] Failed to fetch related projects for "${slug}":`, err);
    // silently degrade
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const jsonLdProject = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': project.title,
    'image': project.seo?.ogImage || project.coverImage || DEFAULT_OG_IMAGE,
    'description': project.summary,
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Web, Cross-platform',
    'url': `${SITE_URL}${basePath}/portfolio/coding-projects/${project.slug}`,
    'author': {
      '@type': 'Person',
      '@id': PERSON_ID,
      'name': 'Shain Wai Yan',
      'url': SITE_URL
    },
    'publisher': orgRef(),
    'datePublished': project.projectDate ? new Date(project.projectDate).toISOString() : undefined,
    'dateModified': project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
    'keywords': [...(project.tags || []), ...(project.toolsUsed || [])].filter(Boolean).join(', '),
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${basePath}/portfolio/coding-projects/${project.slug}`
    }
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t.marketingInMotion.breadcrumbs.home, // Reuse home breadcrumb
        "item": `${SITE_URL}${basePath}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.marketingInMotion.breadcrumbs.portfolio,
        "item": `${SITE_URL}${basePath}/portfolio`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t.nav.codingProjects,
        "item": `${SITE_URL}${basePath}/portfolio/coding-projects`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": project.title,
        "item": `${SITE_URL}${basePath}/portfolio/coding-projects/${project.slug}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLdProject, jsonLdBreadcrumb]) }}
      />
      
      {/* Breadcrumb */}
      <nav className="bg-[#f8f9fa] dark:bg-[#1e1e1e] px-4 sm:px-6 lg:px-8 py-3 border-b border-[#d0d0d0] dark:border-[#444]">
        <ol className="flex items-center gap-1.5 text-xs max-w-5xl mx-auto flex-wrap">
          <li>
            <Link
              href={basePath || '/'}
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              {t.marketingInMotion.breadcrumbs.home}
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link
              href={`${basePath}/portfolio`}
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              {t.marketingInMotion.breadcrumbs.portfolio}
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link
              href={`${basePath}/portfolio/coding-projects`}
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              {t.nav.codingProjects}
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li className="text-[#333] dark:text-[#e0e0e0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {project.title}
          </li>
        </ol>
      </nav>

      {/* Project Header */}
      <CodingProjectHeader project={project} language={locale as 'en' | 'zh'} />

      {/* Floating table of contents (desktop) */}
      <TableOfContents language={locale as 'en' | 'zh'} />

      {/* Project Content */}
      <CodingProjectContent project={project} language={locale as 'en' | 'zh'} />

      {/* Image Gallery */}
      {project.imageGallery && project.imageGallery.length > 0 && (
        <CodingProjectGallery
          images={project.imageGallery}
          title={project.title}
          language={locale as 'en' | 'zh'}
        />
      )}

      {/* Related Projects */}
      {relatedProjects && relatedProjects.length > 0 && (
        <RelatedCodingProjects projects={relatedProjects} language={locale as 'en' | 'zh'} />
      )}
    </main>
  );
}
