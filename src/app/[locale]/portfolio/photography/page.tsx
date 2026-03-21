import { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PhotographyGallery } from '@/components/photography/PhotographyGallery';
import { fetchAllPhotography } from '@/lib/strapi/photography';

export const metadata: Metadata = {
  title: 'Photography Portfolio | Shain Wai Yan',
  description:
    "Explore Shain Wai Yan's photography portfolio featuring stunning images of landscapes, architecture, and more.",
  alternates: { canonical: '/portfolio/photography' },
  openGraph: {
    title: 'Photography Portfolio | Shain Wai Yan',
    description: 'Stunning photography showcasing landscapes, architecture, and beautiful moments.',
    url: '/portfolio/photography',
  },
};

export default async function PhotographyPage() {
  const { photos, error } = await fetchAllPhotography('en', { pageSize: 100 });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Photography', href: '/portfolio/photography' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header — clean, no decorative lines */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#191970] dark:text-white mb-3">
            Photography Gallery
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Capturing moments and memories through the art of photography. Explore my collection of images
            featuring landscapes, architecture, and beautiful moments from around the world.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium text-sm">
              Unable to load photos. Please try again later.
            </p>
          </div>
        ) : photos.length > 0 ? (
          <PhotographyGallery initialPhotos={photos} language="en" />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 dark:text-gray-500 font-medium">No photos available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}