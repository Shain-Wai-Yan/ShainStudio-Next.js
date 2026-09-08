import { serializeJsonLd } from '@/lib/utils/json-ld';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { MarketingProject } from '@/lib/strapi/marketing-in-motion';
import {
  getMarketingProject,
  getMarketingProjects,
  getRelatedMarketingProjects,
} from '@/lib/server/project-data';
import ProjectHeader from '@/components/marketing-in-motion/ProjectHeader';
import ProjectContent from '@/components/marketing-in-motion/ProjectContent';
import ProjectGallery from '@/components/marketing-in-motion/ProjectGallery';
import RelatedProjects from '@/components/marketing-in-motion/RelatedProjects';
import TableOfContents from '@/components/shared/TableOfContents';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { DEFAULT_OG_IMAGE, PERSON_ID, SITE_URL, brandedTitle, personRef, safeCanonicalUrl } from '@/lib/seo';

export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow new projects to be fetched at runtime

export async function generateStaticParams() {
  const { projects } = await getMarketingProjects(1, 100);
  const locales = ['en', 'zh'];

  return locales.flatMap((locale) =>
    projects.map((project) => ({
      locale,
      slug: project.slug,
    }))
  );
}

interface MarketingProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(
  props: MarketingProjectPageProps
): Promise<Metadata> {
  const { locale: rawLocale, slug } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { project, error } = await getMarketingProject(slug);
  const t = await getDictionary(locale); // ✅ CHANGE: async

  if (error) throw new Error(error);
  if (!project) {
    return { title: t.marketingInMotion.seo.projectNotFoundTitle || 'Project Not Found | Shain Studio' };
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;
  const englishCanonical = safeCanonicalUrl(
    project.seo.canonicalUrl,
    `${SITE_URL}/portfolio/marketing-in-motion/${project.slug}`,
  );

  return {
    title: { absolute: brandedTitle(project.seo.metaTitle || project.title, 'Shain Studio') },
    description: project.seo.metaDescription,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    keywords: project.tags && project.toolsUsed && project.category 
      ? [...project.tags, ...project.toolsUsed, project.category].join(', ')
      : t.marketingInMotion.seo.keywords,
    alternates: {
      canonical: englishCanonical,
    },
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

// ✅ KEEP DYNAMIC (no force-static)

export default async function MarketingProjectPage(
  props: MarketingProjectPageProps
) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const [ { project, error }, t ] = await Promise.all([
    getMarketingProject(slug),
    getDictionary(locale)
  ]);

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
    );
    if (!relatedError) {
      relatedProjects = projects;
    }
  } catch (err) {
    console.warn(`[MarketingProjectPage] Failed to fetch related projects for "${slug}":`, err);
    // silently degrade
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${SITE_URL}${basePath}/portfolio/marketing-in-motion/${project.slug}#creativework`,
    headline: project.seo.metaTitle || project.title,
    image: project.seo.ogImage ? [{
      '@type': 'ImageObject',
      url: project.seo.ogImage
    }] : [],
    datePublished: project.projectDate || undefined,
    dateModified: project.updatedAt || undefined,
    author: [{ '@type': 'Person', '@id': PERSON_ID }],
    publisher: personRef(),
    description: project.seo.metaDescription || project.summary,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}`
    },
    about: project.tags || [],
    keywords: [...(project.tags || []), ...(project.toolsUsed || [])].join(', '),
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
    isPartOf: {
      '@type': 'CollectionPage',
      '@id': `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion#collection`,
      name: locale === 'zh' ? '营销实战 | Shain Studio' : 'Marketing in Motion | Shain Studio',
      url: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion`
    }
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t.marketingInMotion.breadcrumbs.home,
        "item": `https://www.shainwaiyan.com${basePath}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.marketingInMotion.breadcrumbs.portfolio,
        "item": `https://www.shainwaiyan.com${basePath}/portfolio`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t.marketingInMotion.breadcrumbs.marketingInMotion,
        "item": `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": project.title,
        "item": `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([jsonLdArticle, jsonLdBreadcrumb]) }}
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
              href={`${basePath}/portfolio/marketing-in-motion`}
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              {t.marketingInMotion.breadcrumbs.marketingInMotion}
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li className="text-[#333] dark:text-[#e0e0e0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {project.title}
          </li>
        </ol>
      </nav>

      {/* Project Header with Cover Image */}
      <ProjectHeader project={project} language={locale as 'en' | 'zh'} />

      {/* Floating table of contents (desktop) */}
      <TableOfContents language={locale as 'en' | 'zh'} />

      {/* Project Content */}
      <ProjectContent project={project} language={locale as 'en' | 'zh'} />

      {/* Image Gallery */}
      {project.imageGallery && project.imageGallery.length > 0 && (
        <ProjectGallery
          images={project.imageGallery}
          title={project.title}
          language={locale as 'en' | 'zh'}
        />
      )}

      {/* Related Projects */}
      {relatedProjects && relatedProjects.length > 0 && (
        <RelatedProjects projects={relatedProjects} language={locale as 'en' | 'zh'} />
      )}
    </main>
  );
}
