import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale } from '@/lib/locales';
import { CodingProjectArchiveClient } from '@/components/coding-project/CodingProjectArchiveClient';
import { fetchCodingProjects, type CodingProject } from '@/lib/strapi/coding-projects';

export const revalidate = 3600; // Revalidate every hour

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const dict = await getDictionary(locale);
  const archiveTitle = dict.codingProjects.archive?.title || 'Complete Project Archive';
  const archiveDescription = dict.codingProjects.archive?.description || 'Browse the complete database of my software engineering projects.';

  const basePath = locale === 'en' ? '' : `/${locale}`;
  const url = `https://shainwaiyan.com${basePath}/portfolio/coding-projects/archive`;
  const defaultOgImage = 'https://shainwaiyan.com/images/Shain%20Studio.png';

  return {
    title: `${archiveTitle} | Shain Studio`,
    description: archiveDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        'en': `https://shainwaiyan.com/portfolio/coding-projects/archive`,
        'zh': `https://shainwaiyan.com/zh/portfolio/coding-projects/archive`,
        'x-default': `https://shainwaiyan.com/portfolio/coding-projects/archive`,
      },
    },
    openGraph: {
      title: archiveTitle,
      description: archiveDescription,
      url,
      siteName: 'Shain Studio',
      images: [{ url: defaultOgImage, width: 1200, height: 630 }],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: archiveTitle,
      description: archiveDescription,
      images: [defaultOgImage],
    },
  };
}

export default async function CodingProjectsArchivePage({ params }: Props) {
  const { locale } = await params;
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const defaultOgImage = 'https://shainwaiyan.com/images/Shain%20Studio.png';

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale);
  const archiveTitle = dict.codingProjects.archive?.title || 'Complete Project Archive';
  const archiveDescription = dict.codingProjects.archive?.description || 'Browse the complete database of my software engineering projects.';

  // Fetch coding projects from Strapi
  const { projects: strapiProjects } = await fetchCodingProjects();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': archiveTitle,
    'description': archiveDescription,
    'url': `https://shainwaiyan.com${basePath}/portfolio/coding-projects/archive`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': strapiProjects.map((project: CodingProject, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'SoftwareApplication',
          'name': project.title,
          'description': project.summary || project.seo?.metaDescription || archiveDescription,
          'image': project.coverImage || defaultOgImage,
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'Web, Cross-platform',
          'url': `https://shainwaiyan.com${basePath}/portfolio/coding-projects/${project.slug}`
        }
      }))
    }
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": dict.marketingInMotion.breadcrumbs.home,
        "item": `https://shainwaiyan.com${basePath}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": dict.marketingInMotion.breadcrumbs.portfolio,
        "item": `https://shainwaiyan.com${basePath}/portfolio`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": dict.codingProjects.title,
        "item": `https://shainwaiyan.com${basePath}/portfolio/coding-projects`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": archiveTitle,
        "item": `https://shainwaiyan.com${basePath}/portfolio/coding-projects/archive`
      }
    ]
  };

  const breadcrumbItems = [
    { label: dict.marketingInMotion.breadcrumbs.home, href: '/' },
    { label: dict.marketingInMotion.breadcrumbs.portfolio, href: '/portfolio' },
    { label: dict.codingProjects.title, href: '/portfolio/coding-projects' },
    { label: archiveTitle, href: '/portfolio/coding-projects/archive' }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, jsonLdBreadcrumb]) }}
      />
      
      <CodingProjectArchiveClient
        locale={locale as 'en' | 'zh'}
        breadcrumbItems={breadcrumbItems}
        initialProjects={strapiProjects}
        labels={{
          heroTitle: archiveTitle,
          heroDescription: archiveDescription,
          searchPlaceholder: dict.codingProjects.labels.searchPlaceholder,
          allCategories: dict.codingProjects.labels.allCategories,
          allTools: dict.codingProjects.labels.allTools,
          allTags: dict.codingProjects.labels.allTags,
          allTypes: dict.codingProjects.labels.allTypes,
          refresh: dict.codingProjects.labels.refresh,
          showing: dict.codingProjects.archive.showing,
          of: dict.codingProjects.archive.of,
          projects: dict.codingProjects.archive.projects,
          viewDetails: dict.codingProjects.labels.viewDetails,
          loadMore: dict.codingProjects.labels.loadMore,
          loadingText: dict.codingProjects.labels.loadingText,
          errorText: dict.codingProjects.labels.errorText,
          retryText: dict.codingProjects.labels.retryText,
          noProjects: dict.codingProjects.labels.noProjects,
          noProjectsHint: dict.codingProjects.labels.noProjectsHint,
        }}
      />
    </>
  );
}
