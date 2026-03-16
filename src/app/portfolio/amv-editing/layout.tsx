import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AMV Editing Portfolio | Shain Wai Yan (xolbine)',
  description:
    'Explore Shain Wai Yan\'s (xolbine, 明元易) AMV (Anime Music Video) editing portfolio featuring dynamic video edits that blend storytelling with impactful visuals.',
  keywords:
    'Shain Wai Yan, xolbine, 明元易, AMV, anime music video, video editing, portfolio, animation, music videos',
  authors: [{ name: 'Shain Wai Yan' }],
  openGraph: {
    title: 'AMV Editing Portfolio | Shain Wai Yan',
    description:
      'Dynamic video edits that blend storytelling with impactful visuals.',
    type: 'website',
    url: 'https://www.shainwaiyan.com/portfolio/amv-editing',
    siteName: 'Shain Wai Yan Portfolio',
    locale: 'en_US',
    alternateLocale: 'zh_CN',
  },
  alternates: {
    canonical: '/portfolio/amv-editing',
    languages: {
      en: '/portfolio/amv-editing',
      zh: '/zh/portfolio/amv-editing',
    },
  },
};

export default function AMVEditingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
