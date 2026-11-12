import Link from 'next/link';
import type {MarketingProject} from '@/lib/strapi/marketing-in-motion';
import ProjectHeader from '@/components/marketing-in-motion/ProjectHeader';
import ProjectContent from '@/components/marketing-in-motion/ProjectContent';
import ProjectGallery from '@/components/marketing-in-motion/ProjectGallery';
import RelatedProjects from '@/components/marketing-in-motion/RelatedProjects';
import TableOfContents from '@/components/shared/TableOfContents';
import ContentLanguageNotice from '@/components/shared/ContentLanguageNotice';
import {serializeJsonLd} from '@/lib/utils/json-ld';
import {SITE_URL,PERSON_ID,personRef} from '@/lib/seo';
import {getDictionary} from '@/lib/getDictionary';

/** Shared by the published route and authenticated saved-draft preview. */
export default async function MarketingProjectView({project, relatedProjects, locale}: {project: MarketingProject; relatedProjects: MarketingProject[]; locale: 'en' | 'zh'}) {
  const t=await getDictionary(locale);
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
      <ContentLanguageNotice localization={project.localization} />
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
