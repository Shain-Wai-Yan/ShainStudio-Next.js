import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { GithubGallery } from '@/components/coding-project/GithubGallery';
import { Breadcrumb } from '@/components/Breadcrumb';

interface CodingProjectPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: CodingProjectPageProps): Promise<Metadata> {
  const params = await props.params;
  const locale = params?.locale || 'en';
  const t = await getDictionary(locale);

  const urlPath = locale === 'en' ? '/portfolio/coding-projects' : `/${locale}/portfolio/coding-projects`;

  return {
    title: t.codingProjects.seo.title,
    description: t.codingProjects.seo.description,
    alternates: {
      canonical: urlPath,
      languages: { en: '/portfolio/coding-projects', zh: '/zh/portfolio/coding-projects' },
    },
    openGraph: {
      type: 'website',
      url: `https://www.shainwaiyan.com${urlPath}`,
      title: t.codingProjects.seo.title,
      description: t.codingProjects.seo.description,
      images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      alternateLocale: locale === 'en' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function CodingProjectPage(props: CodingProjectPageProps) {
  const params = await props.params;
  const locale = (params?.locale || 'en') as 'en' | 'zh';
  const t = await getDictionary(locale);

  const breadcrumbItems = [
    { label: t.nav.home, href: locale === 'en' ? '/' : `/${locale}` },
    { label: t.nav.portfolio, href: locale === 'en' ? '/portfolio' : `/${locale}/portfolio` },
    { label: t.nav.codingProjects, href: locale === 'en' ? '/portfolio/coding-projects' : `/${locale}/portfolio/coding-projects` },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#191970] dark:text-[#d4af37]">
            {t.codingProjects.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            {t.codingProjects.description}
          </p>
        </div>

        <section aria-labelledby="github-heading" className="mb-12">
          <h2 id="github-heading" className="text-xl font-bold mb-6 text-[#191970] dark:text-[#d4af37]">
            {t.codingProjects.myGitHub}
          </h2>
          <GithubGallery />
        </section>
      </div>
    </main>
  );
}
