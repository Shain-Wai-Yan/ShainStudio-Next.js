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
import { getDictionarySync } from '@/lib/getDictionary';

interface MarketingProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(
  props: MarketingProjectPageProps
): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const { project, error } = await fetchMarketingProjectBySlug(slug);
  const t = getDictionarySync(locale as 'en' | 'zh');

  if (error || !project) {
    return { title: t.marketingInMotion.seo.projectNotFoundTitle || 'Project Not Found | Shain Studio' };
  }

  const suffix = locale === 'zh' ? '营销实战 | Shain Studio' : 'Marketing in Motion | Shain Studio';

  return {
    title: `${project.seo.metaTitle} | ${suffix}`,
    description: project.seo.metaDescription,
    keywords: project.tags && project.toolsUsed && project.category 
      ? [...project.tags, ...project.toolsUsed, project.category].join(', ')
      : t.marketingInMotion.seo.keywords,
    alternates: {
      canonical: locale === 'en' ? `https://www.shainwaiyan.com/portfolio/marketing-in-motion/${project.slug}` : `https://www.shainwaiyan.com/${locale}/portfolio/marketing-in-motion/${project.slug}`,
      languages: {
        en: `https://www.shainwaiyan.com/portfolio/marketing-in-motion/${project.slug}`,
        zh: `https://www.shainwaiyan.com/zh/portfolio/marketing-in-motion/${project.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `https://www.shainwaiyan.com${locale === 'en' ? '' : `/${locale}`}/portfolio/marketing-in-motion/${project.slug}`,
      title: project.seo.metaTitle,
      description: project.seo.metaDescription,
      images: project.seo.ogImage ? [project.seo.ogImage] : [],
      authors: ['Shain Wai Yan'],
      publishedTime: project.projectDate,
      modifiedTime: project.updatedAt,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo.metaTitle,
      description: project.seo.metaDescription,
      images: project.seo.ogImage ? [project.seo.ogImage] : [],
    },
  };
}

export default async function MarketingProjectPage(
  props: MarketingProjectPageProps
) {
  const { locale, slug } = await props.params;
  const { project, error } = await fetchMarketingProjectBySlug(slug);
  const t = getDictionarySync(locale as 'en' | 'zh');

  if (error || !project) {
    notFound();
  }

  // ── Fetch related projects client-side via the list endpoint and filter locally.
  let relatedProjects: MarketingProject[] = [];
  try {
    const { projects: allProjects } = await fetchMarketingProjects(1, 100);
    relatedProjects = allProjects
      .filter(
        (p) => p.category === project.category && p.slug !== project.slug
      )
      .slice(0, 3);
  } catch {
    // silently degrade — related section just won't show
  }

  const basePath = locale === 'en' ? '' : `/${locale}`;

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
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