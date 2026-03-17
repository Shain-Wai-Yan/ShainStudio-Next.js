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

interface ChineseMarketingProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: ChineseMarketingProjectPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const { project } = await fetchMarketingProjectBySlug(slug);

  if (!project) {
    return { title: '项目未找到 | Shain Studio' };
  }

  return {
    title: `${project.seo.metaTitle} | 营销实战 | Shain Studio`,
    description: project.seo.metaDescription,
    keywords: [...project.tags, ...project.toolsUsed, project.category].join(', '),
    alternates: {
      canonical: `/zh/portfolio/marketing-in-motion/${project.slug}`,
      languages: {
        en: `/portfolio/marketing-in-motion/${project.slug}`,
        zh: `/zh/portfolio/marketing-in-motion/${project.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `https://www.shainwaiyan.com/zh/portfolio/marketing-in-motion/${project.slug}`,
      title: project.seo.metaTitle,
      description: project.seo.metaDescription,
      images: project.seo.ogImage ? [project.seo.ogImage] : [],
      authors: ['Shain Wai Yan'],
      publishedTime: project.projectDate,
      modifiedTime: project.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo.metaTitle,
      description: project.seo.metaDescription,
      images: project.seo.ogImage ? [project.seo.ogImage] : [],
    },
  };
}

export default async function ChineseMarketingProjectPage(
  props: ChineseMarketingProjectPageProps
) {
  const { slug } = await props.params;
  const { project, error } = await fetchMarketingProjectBySlug(slug);

  if (error || !project) {
    notFound();
  }

  // ── Fetch related projects via list + client-side filter.
  // Strapi's category relation field cannot be reliably filtered by string
  // via the API (causes 503). Fetch all and filter in JS instead.
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

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      {/* Breadcrumb */}
      <nav className="bg-[#f8f9fa] dark:bg-[#1e1e1e] px-4 sm:px-6 lg:px-8 py-3 border-b border-[#d0d0d0] dark:border-[#444]">
        <ol className="flex items-center gap-1.5 text-xs max-w-5xl mx-auto flex-wrap">
          <li>
            <Link
              href="/zh"
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              主页
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link
              href="/zh/portfolio"
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              作品集
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link
              href="/zh/portfolio/marketing-in-motion"
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              营销实战
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li className="text-[#333] dark:text-[#e0e0e0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {project.title}
          </li>
        </ol>
      </nav>

      {/* Project Header */}
      <ProjectHeader project={project} language="zh" />

      {/* Project Content (includes low-profile back link at bottom) */}
      <ProjectContent project={project} language="zh" />

      {/* Image Gallery */}
      {project.imageGallery.length > 0 && (
        <ProjectGallery
          images={project.imageGallery}
          title={project.title}
          language="zh"
        />
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <RelatedProjects projects={relatedProjects} language="zh" />
      )}
    </main>
  );
}