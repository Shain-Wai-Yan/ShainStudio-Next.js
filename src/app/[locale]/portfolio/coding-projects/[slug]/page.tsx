import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  fetchCodingProjectBySlug,
  fetchRelatedCodingProjects,
  type CodingProject,
} from '@/lib/strapi/coding-projects';

import CodingProjectHeader from '@/components/coding-project/CodingProjectHeader';
import CodingProjectContent from '@/components/coding-project/CodingProjectContent';
import CodingProjectGallery from '@/components/coding-project/CodingProjectGallery';
import RelatedCodingProjects from '@/components/coding-project/RelatedCodingProjects';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';

export const revalidate = 3600; // Revalidate every hour

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
    title: project.seo?.metaTitle || `${project.title} | Shain Studio`,
    description: project.seo?.metaDescription || project.summary,
    keywords: safeKeywords,
    alternates: {
      canonical: `https://shainwaiyan.com${basePath}/portfolio/coding-projects/${project.slug}`,
      languages: {
        en: `https://shainwaiyan.com/portfolio/coding-projects/${project.slug}`,
        zh: `https://shainwaiyan.com/zh/portfolio/coding-projects/${project.slug}`,
        'x-default': `https://shainwaiyan.com/portfolio/coding-projects/${project.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `https://shainwaiyan.com${basePath}/portfolio/coding-projects/${project.slug}`,
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
  const { project, error } = await fetchCodingProjectBySlug(slug);
  const t = await getDictionary(locale);

  if (error || !project) {
    notFound();
  }

  let relatedProjects: CodingProject[] = [];
  try {
    const { projects } = await fetchRelatedCodingProjects(project.category, project.slug, 3);
    relatedProjects = projects;
  } catch {
    // silently degrade
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const jsonLdProject = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': project.title,
    'image': project.seo?.ogImage || project.coverImage || 'https://shainwaiyan.com/images/Shain Studio.png',
    'description': project.summary,
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Web, Cross-platform',
    'url': `https://shainwaiyan.com${basePath}/portfolio/coding-projects/${project.slug}`,
    'author': {
      '@type': 'Person',
      'name': 'Shain Wai Yan',
      'url': 'https://shainwaiyan.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Shain Studio',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://shainwaiyan.com/logo.png' 
      }
    },
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
      '@id': `https://shainwaiyan.com${basePath}/portfolio/coding-projects/${project.slug}`
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
        "item": `https://shainwaiyan.com${basePath}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.marketingInMotion.breadcrumbs.portfolio,
        "item": `https://shainwaiyan.com${basePath}/portfolio`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t.nav.codingProjects,
        "item": `https://shainwaiyan.com${basePath}/portfolio/coding-projects`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": project.title,
        "item": `https://shainwaiyan.com${basePath}/portfolio/coding-projects/${project.slug}`
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
