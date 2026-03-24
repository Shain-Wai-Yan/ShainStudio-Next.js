import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  fetchMarketingProjectBySlug,
  fetchMarketingProjects,
  type MarketingProject,
} from '@/lib/strapi/marketing-in-motion';
import ProjectHeader from '@/components/marketing-in-motion/ProjectHeader';
import ProjectContent from '@/components/marketing-in-motion/ProjectContent';
import ProjectGallery from '@/components/marketing-in-motion/ProjectGallery';
import RelatedProjects from '@/components/marketing-in-motion/RelatedProjects';
import Script from 'next/script';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';

interface MarketingProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(
  props: MarketingProjectPageProps
): Promise<Metadata> {
  const { locale: rawLocale, slug } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { project, error } = await fetchMarketingProjectBySlug(slug);
  const t = await getDictionary(locale); // ✅ CHANGE: async

  if (error || !project) {
    return { title: t.marketingInMotion.seo.projectNotFoundTitle || 'Project Not Found | Shain Studio' };
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;
  const suffix = locale === 'zh' ? '营销实战 | Shain Studio' : 'Marketing in Motion | Shain Studio';

  return {
    title: `${project.seo.metaTitle} | ${suffix}`,
    description: project.seo.metaDescription,
    keywords: project.tags && project.toolsUsed && project.category 
      ? [...project.tags, ...project.toolsUsed, project.category].join(', ')
      : t.marketingInMotion.seo.keywords,
    alternates: {
      canonical: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}`,
      languages: {
        en: `https://www.shainwaiyan.com/portfolio/marketing-in-motion/${project.slug}`,
        zh: `https://www.shainwaiyan.com/zh/portfolio/marketing-in-motion/${project.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}`,
      title: project.seo.metaTitle,
      description: project.seo.metaDescription,
      images: project.seo.ogImage ? [project.seo.ogImage] : [],
      authors: ['Shain Wai Yan'],
      publishedTime: project.projectDate,
      modifiedTime: project.updatedAt,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo.metaTitle,
      description: project.seo.metaDescription,
      images: project.seo.ogImage ? [project.seo.ogImage] : [],
    },
  };
}

// ✅ KEEP DYNAMIC (no force-static)

export default async function MarketingProjectPage(
  props: MarketingProjectPageProps
) {
  const { locale: rawLocale, slug } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { project, error } = await fetchMarketingProjectBySlug(slug);
  const t = await getDictionary(locale); // ✅ CHANGE: async

  if (error || !project) {
    notFound();
  }

  let relatedProjects: MarketingProject[] = [];
  try {
    const { projects: allProjects } = await fetchMarketingProjects(1, 100);
    relatedProjects = allProjects
      .filter((p) => p.category === project.category && p.slug !== project.slug)
      .slice(0, 3);
  } catch {
    // silently degrade
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `https://www.shainwaiyan.com${basePath}/portfolio/marketing-in-motion/${project.slug}#creativework`,
    headline: project.seo.metaTitle || project.title,
    image: project.seo.ogImage ? [{
      '@type': 'ImageObject',
      url: project.seo.ogImage
    }] : [],
    datePublished: project.projectDate || new Date().toISOString(),
    dateModified: project.updatedAt || new Date().toISOString(),
    author: [{
      '@type': 'Person',
      name: 'Shain Wai Yan',
      url: `https://www.shainwaiyan.com${basePath}/about`
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Shain Studio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.shainwaiyan.com/images/Shain Studio.png'
      }
    },
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
      <Script
        id={`schema-article-${project.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <Script
        id={`schema-breadcrumb-${project.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
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