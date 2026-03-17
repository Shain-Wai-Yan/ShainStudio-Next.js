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

interface MarketingProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: MarketingProjectPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const { project } = await fetchMarketingProjectBySlug(slug);

  if (!project) {
    return { title: 'Project Not Found | Shain Studio' };
  }

  return {
    title: `${project.seo.metaTitle} | Marketing in Motion | Shain Studio`,
    description: project.seo.metaDescription,
    keywords: [...project.tags, ...project.toolsUsed, project.category].join(', '),
    alternates: {
      canonical: `/portfolio/marketing-in-motion/${project.slug}`,
      languages: {
        en: `/portfolio/marketing-in-motion/${project.slug}`,
        zh: `/zh/portfolio/marketing-in-motion/${project.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `https://www.shainwaiyan.com/portfolio/marketing-in-motion/${project.slug}`,
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

export default async function MarketingProjectPage(
  props: MarketingProjectPageProps
) {
  const { slug } = await props.params;
  const { project, error } = await fetchMarketingProjectBySlug(slug);

  if (error || !project) {
    notFound();
  }

  // ── Fetch related projects client-side via the list endpoint and filter locally.
  // Strapi's category field is a relation, so filtering by string via the API
  // returns 503 intermittently. Fetching all and filtering in JS is more reliable.
  let relatedProjects: MarketingProject[] = [];
  try {
    const { projects: allProjects } = await fetchMarketingProjects(1, 100);
    relatedProjects = allProjects
      .filter(
        (p) =>
          p.category === project.category && p.slug !== project.slug
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
              href="/"
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              Home
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link
              href="/portfolio"
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              Portfolio
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link
              href="/portfolio/marketing-in-motion"
              className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors"
            >
              Marketing in Motion
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li className="text-[#333] dark:text-[#e0e0e0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {project.title}
          </li>
        </ol>
      </nav>

      {/* Project Header with Cover Image */}
      <ProjectHeader project={project} language="en" />

      {/* Project Content */}
      <ProjectContent project={project} language="en" />

      {/* Image Gallery */}
      {project.imageGallery.length > 0 && (
        <ProjectGallery
          images={project.imageGallery}
          title={project.title}
          language="en"
        />
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <RelatedProjects projects={relatedProjects} language="en" />
      )}
    </main>
  );
}