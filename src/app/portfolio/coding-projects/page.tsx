import { Metadata } from 'next';
import { GithubGallery } from '@/components/coding-project/GithubGallery';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Coding Projects - GitHub Profile Viewer',
  description: 'Explore coding projects by Shain Wai Yan (xolbine) including a GitHub profile viewer and other hobby programming projects. Interactive web applications built with modern design principles.',
  alternates: {
    canonical: '/portfolio/coding-project',
  },
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#191970' }}>
            Coding Projects
          </h1>
          {/* text-sm on mobile, text-base on desktop — no max-width cap so it fills the row */}
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            As a digital marketer and brand strategist with a passion for technology, I've developed
            coding skills to enhance my marketing capabilities and create interactive tools. While
            I'm not a professional programmer or CS major graduate by trade, coding has become an
            invaluable complement to my business and marketing expertise, allowing me to build
            custom solutions that bridge strategy and implementation.
          </p>
        </div>

        {/* GitHub Gallery Section */}
        <section aria-labelledby="github-heading" className="mb-12">
          <h2 id="github-heading" className="text-xl font-bold mb-6" style={{ color: '#191970' }}>
            My GitHub Gallery
          </h2>
          <GithubGallery />
        </section>
      </div>
    </main>
  );
}