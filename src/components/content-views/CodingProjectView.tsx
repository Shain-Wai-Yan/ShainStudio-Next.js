import Link from 'next/link';
import type {CodingProject} from '@/lib/strapi/coding-projects';
import CodingProjectHeader from '@/components/coding-project/CodingProjectHeader';
import CodingProjectContent from '@/components/coding-project/CodingProjectContent';
import CodingProjectGallery from '@/components/coding-project/CodingProjectGallery';
import RelatedCodingProjects from '@/components/coding-project/RelatedCodingProjects';
import TableOfContents from '@/components/shared/TableOfContents';
import ContentLanguageNotice from '@/components/shared/ContentLanguageNotice';
import {serializeJsonLd} from '@/lib/utils/json-ld';
import {SITE_URL,PERSON_ID,personRef,DEFAULT_OG_IMAGE} from '@/lib/seo';
import {getDictionary} from '@/lib/getDictionary';

/** Shared by the published route and authenticated saved-draft preview. */
export default async function CodingProjectView({project, relatedProjects, locale}: {project: CodingProject; relatedProjects: CodingProject[]; locale: 'en' | 'zh'}) {
  const t=await getDictionary(locale);
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
    'publisher': personRef(),
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
      <ContentLanguageNotice localization={project.localization} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([jsonLdProject, jsonLdBreadcrumb]) }}
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
