import { serializeJsonLd } from '@/lib/utils/json-ld';
import { Inter, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import { getDictionary } from '@/lib/getDictionary';
import "@/app/globals.css";
import { getHtmlLang, isSupportedLocale, DEFAULT_LOCALE } from "@/lib/locales";
import { SITE_URL, DEFAULT_OG_IMAGE, LOGO_IMAGE, personJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
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
        ? "技术营销从业者 | Shain Wai Yan (xolbine)"
        : "Technical Marketer | Shain Wai Yan (xolbine)",
      template: `%s | Shain Wai Yan (xolbine)`,
    },
    description: isZh
      ? "Shain Wai Yan (xolbine、明元易) 的作品集 — 技术营销从业者、MarTech 爱好者、创意科技实践者。探索我在数字营销、技术、数据与AI领域的作品。"
      : "Portfolio of Shain Wai Yan (aka xolbine, 明元易) — Technical Marketer, MarTech Enthusiast, and Creative Technologist. Explore my work in digital marketing, technology, data, and AI.",
    authors: [{ name: "Shain Wai Yan" }],
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
        ? '技术营销从业者 | Shain Wai Yan'
        : 'Technical Marketer | Shain Wai Yan',
      description: isZh
        ? '在Shain Wai Yan (xolbine)的作品集中探索AI驱动的营销活动、内容策略和市场分析。'
        : 'Explore AI‑powered campaigns, content strategy, & market analysis in the portfolio of Shain Wai Yan (xolbine).',
      images: DEFAULT_OG_IMAGE,
      siteName: isZh ? "Shain的作品集" : "Shain's Portfolio",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh
        ? '技术营销从业者 | Shain Wai Yan'
        : 'Technical Marketer | Shain Wai Yan',
      description: isZh
        ? '在Shain Wai Yan (xolbine)的作品集中探索AI驱动的营销活动、内容策略和市场分析。'
        : 'Explore AI‑powered campaigns, content strategy, & market analysis in the portfolio of Shain Wai Yan (xolbine).',
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
      organizationJsonLd(),
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
          <ClarityAnalytics />
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}