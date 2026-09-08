import { serializeJsonLd } from '@/lib/utils/json-ld';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale } from '@/lib/locales';
import { GithubGallery } from '@/components/coding-project/GithubGallery';
import type { CodingProject } from '@/lib/strapi/coding-projects';
import { getCodingProjects } from '@/lib/server/project-data';
import { SITE_URL, DEFAULT_OG_IMAGE, brandedTitle } from '@/lib/seo';

export const revalidate = 3600; // Revalidate every hour

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const dict = await getDictionary(locale);
  const seo = dict.codingProjects.seo;

  const basePath = locale === 'en' ? '' : `/${locale}`;
  const url = `${SITE_URL}${basePath}/portfolio/coding-projects`;
  const defaultOgImage = DEFAULT_OG_IMAGE; 

  return {
    title: { absolute: brandedTitle(seo.title, 'Shain Studio') },
    description: seo.description,
    robots: locale === 'zh' ? { index: false, follow: true } : { index: true, follow: true },
    alternates: {
      canonical: `${SITE_URL}/portfolio/coding-projects`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: 'Shain Studio',
      images: [{ url: defaultOgImage, width: 1200, height: 630 }],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [defaultOgImage],
    },
  };
}

export default async function CodingProjectsPage({ params }: Props) {
  const { locale } = await params;
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const defaultOgImage = DEFAULT_OG_IMAGE;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale);
  
  // Fetch coding projects from Strapi
  const { projects: strapiProjects } = await getCodingProjects();

  // Prepare structured data
  const topProjectsForSeo = strapiProjects.slice(0, 10);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': dict.codingProjects.seo.title,
    'description': dict.codingProjects.seo.description,
    'url': `${SITE_URL}${basePath}/portfolio/coding-projects`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': topProjectsForSeo.map((project: CodingProject, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'SoftwareApplication',
          'name': project.title,
          'description': project.summary || project.seo?.metaDescription || dict.codingProjects.seo.description,
          'image': project.coverImage || defaultOgImage,
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'Web, Cross-platform',
          'url': `${SITE_URL}${basePath}/portfolio/coding-projects/${project.slug}`
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
        "item": `${SITE_URL}${basePath}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": dict.marketingInMotion.breadcrumbs.portfolio,
        "item": `${SITE_URL}${basePath}/portfolio`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": dict.codingProjects.title,
        "item": `${SITE_URL}${basePath}/portfolio/coding-projects`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([jsonLd, jsonLdBreadcrumb]) }}
      />
      
      <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 tracking-tight text-[#191970] dark:text-[#d4af37] leading-tight">
            {dict.codingProjects.title}
          </h1>
          <div className="w-full">
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {dict.codingProjects.description}
            </p>
          </div>
        </header>

        <section id="projects" className="space-y-16">
          <GithubGallery 
            initialStrapiProjects={strapiProjects}
            labels={{
              shelf: dict.codingProjects.shelf
            }}
          />
        </section>
      </main>
    </>
  );
}
