import { serializeJsonLd } from '@/lib/utils/json-ld';
import { Inter, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import { getDictionary } from '@/lib/getDictionary';
import "@/app/globals.css";
import { getHtmlLang, isSupportedLocale, DEFAULT_LOCALE } from "@/lib/locales";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, LOGO_IMAGE, personJsonLd, websiteJsonLd } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from '@next/third-parties/google';
import SyntaxWidget from "@/components/syntax ai/SyntaxWidget";
import ClarityAnalytics from "@/components/analytics/ClarityAnalytics";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

/**
 * Generate metadata for the locale-specific layout
 */
export async function generateMetadata({ params }: Omit<LocaleLayoutProps, 'children'>): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const isZh = locale === 'zh';
  
  // ── FIX 1 & 2: Strict root routing, NO /en/ directory ──
  const urlPath = locale === 'en' ? '' : `/${locale}`;
  const baseUrl = `${SITE_URL}${urlPath}`;

  return {
    title: {
      default: isZh
        ? "技术营销作品集 | 明元易"
        : "Technical Marketing Portfolio | Shain Wai Yan",
      template: `%s | ${SITE_NAME}`,
    },
    description: isZh
      ? "明元易（Shain Wai Yan，又名 Xolbine）的个人作品集，以 Shain Studio 呈现技术营销、MarTech 与创意科技作品。"
      : "Shain Studio is the personal portfolio of Shain Wai Yan (Xolbine, 明元易), presenting technical marketing, MarTech, and creative technology work.",
    authors: [{ name: isZh ? "明元易" : "Shain Wai Yan" }],
    robots: "index, follow, max-image-preview:large",
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': SITE_URL,
        'zh': `${SITE_URL}/zh`,
        'x-default': SITE_URL,
      },
      types: {
        'application/rss+xml': `${SITE_URL}/feed.xml`,
      },
    },
    openGraph: {
      type: 'website',
      url: baseUrl,
      title: isZh
        ? '技术营销从业者 | 明元易'
        : 'Technical Marketer | Shain Wai Yan',
      description: isZh
        ? '在明元易（Shain Wai Yan，又名 Xolbine）的作品集中探索AI驱动的营销活动、内容策略和市场分析。'
        : 'Explore AI-powered campaigns, content strategy, and market analysis in the portfolio of Shain Wai Yan (Xolbine).',
      images: DEFAULT_OG_IMAGE,
      siteName: SITE_NAME,
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh
        ? '技术营销从业者 | 明元易'
        : 'Technical Marketer | Shain Wai Yan',
      description: isZh
        ? '在明元易（Shain Wai Yan，又名 Xolbine）的作品集中探索AI驱动的营销活动、内容策略和市场分析。'
        : 'Explore AI-powered campaigns, content strategy, and market analysis in the portfolio of Shain Wai Yan (Xolbine).',
      images: [DEFAULT_OG_IMAGE],
    },
    icons: {
      icon: [
        { url: LOGO_IMAGE, type: 'image/png' },
        { url: LOGO_IMAGE, sizes: '32x32', type: 'image/png' },
        { url: LOGO_IMAGE, sizes: '96x96', type: 'image/png' },
        { url: LOGO_IMAGE, sizes: '192x192', type: 'image/png' },
      ],
      shortcut: LOGO_IMAGE,
      apple: LOGO_IMAGE,
    }
  };
}

/**
 * LocaleLayout component
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const htmlLang = getHtmlLang(locale);
  const t = await getDictionary(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      personJsonLd(locale),
      websiteJsonLd(locale),
    ],
  };

  return (
    <html lang={htmlLang} suppressHydrationWarning dir="ltr" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
          />
          <Header translations={{ nav: t.nav }} />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer t={{ footer: t.footer }} />
          <SyntaxWidget />
          {process.env.NODE_ENV === 'production' && <ClarityAnalytics />}
          {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
