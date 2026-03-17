import { Metadata } from 'next';
import { GithubGallery } from '@/components/coding-project/GithubGallery';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Coding Projects - GitHub Profile Viewer',
  description: 'Explore coding projects by Shain Wai Yan (xolbine) including a GitHub profile viewer and other hobby programming projects.',
  alternates: { canonical: '/portfolio/coding-project' },
  openGraph: {
    title: 'Coding Projects - GitHub Profile Viewer | Shain Wai Yan',
    description: 'Explore coding projects by Shain Wai Yan (xolbine) including a GitHub profile viewer and other hobby programming projects.',
    url: '/portfolio/coding-project',
  },
};

export default function CodingProjectPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Coding Projects', href: '/portfolio/coding-project' },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#191970] dark:text-[#d4af37]">
            Coding Projects
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            As a digital marketer and brand strategist with a passion for technology, I've developed
            coding skills to enhance my marketing capabilities and create interactive tools. While
            I'm not a professional programmer or CS major graduate by trade, coding has become an
            invaluable complement to my business and marketing expertise, allowing me to build
            custom solutions that bridge strategy and implementation.
          </p>
        </div>

        <section aria-labelledby="github-heading" className="mb-12">
          <h2 id="github-heading" className="text-xl font-bold mb-6 text-[#191970] dark:text-[#d4af37]">
            My GitHub Gallery
          </h2>
          <GithubGallery />
        </section>
      </div>
    </main>
  );
}