import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MarketingInMotionClient } from '@/components/marketing-in-motion/MarketingInMotionClient';

export const metadata: Metadata = {
  title: 'Marketing in Motion | Shain Studio - Strategies & Campaigns',
  description:
    "Explore Shain Studio's marketing strategies, campaigns, and case studies. From coursework to self-initiated experiments, see how I think, plan, and execute as a modern marketer.",
  keywords: [
    'marketing campaigns',
    'marketing strategy',
    'case studies',
    'digital marketing',
    'brand strategy',
    'Shain Wai Yan',
    'Shain Studio',
  ],
  alternates: {
    canonical: 'https://www.shainwaiyan.com/portfolio/marketing-in-motion',
    languages: {
      en: 'https://www.shainwaiyan.com/portfolio/marketing-in-motion',
      zh: 'https://www.shainwaiyan.com/zh/portfolio/marketing-in-motion',
    },
  },
  openGraph: {
    type: 'website',
    title: 'Marketing in Motion | Shain Studio - Strategies & Campaigns',
    description:
      "Explore Shain Studio's marketing strategies, campaigns, and case studies. From coursework to self-initiated experiments, see how I think, plan, and execute as a modern marketer.",
    images: [{ url: '/images/Shain Studio.png' }],
    siteName: 'Shain Wai Yan Portfolio',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing in Motion | Shain Studio',
    description:
      "Explore marketing strategies, campaigns, and case studies by Shain Wai Yan.",
    images: ['/images/Shain Studio.png'],
  },
};

const EN_LABELS = {
  heroTitle: 'Marketing Strategies, Campaigns, & Case Studies I\'ve Created',
  heroDescription:
    'From coursework to self-initiated experiments — each one reflects how I think, plan, and execute as a modern marketer.',
  featuredTitle: 'Featured Projects',
  searchPlaceholder: 'Search projects...',
  allCategories: 'All Categories',
  allTools: 'All Tools',
  allTags: 'All Tags',
  allTypes: 'All Types',
  refresh: 'Refresh projects',
  showing: 'Showing',
  of: 'of',
  projects: 'projects',
  viewDetails: 'View Details',
  loadMore: 'Load More Projects',
  loadingText: 'Loading marketing projects...',
  errorText: 'Oops! Something went wrong',
  retryText: 'Try Again',
  noProjects: 'No projects found',
  noProjectsHint: 'Try adjusting your search or filter criteria.',
};

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Marketing in Motion', href: '/portfolio/marketing-in-motion' },
];

export default function MarketingInMotionPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <Suspense fallback={<PageFallback />}>
        <MarketingInMotionClient
          locale="en"
          breadcrumbItems={BREADCRUMBS}
          labels={EN_LABELS}
        />
      </Suspense>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#191970] dark:border-[#a67c00] border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
