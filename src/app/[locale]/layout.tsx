import { Inter, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import { use } from "react";
import "@/app/globals.css";
import { getHtmlLang, isSupportedLocale, DEFAULT_LOCALE } from "@/lib/locales";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from '@next/third-parties/google';
import SyntaxWidget from "@/components/syntax ai/SyntaxWidget";
import ClarityAnalytics from "@/components/analytics/ClarityAnalytics";

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
  const baseUrl = `https://www.shainwaiyan.com${urlPath}`;

  return {
    title: {
      default: isZh 
        ? "数字营销与品牌策略师 | Shain Wai Yan (xolbine)"
        : "Digital Marketing & Brand Strategist | Shain Wai Yan (xolbine)",
      template: `%s | Shain Wai Yan (xolbine)`,
    },
    description: isZh
      ? "Shain Wai Yan (xolbine、明元易) 的数字营销与品牌策略作品集。探索AI驱动的营销活动、内容策略和市场分析。"
      : "Digital Marketing & Brand Strategy portfolio of Shain Wai Yan (aka xolbine, 明元易). Explore AI‑powered campaigns, content strategy, & market analysis.",
    authors: [{ name: "Shain Wai Yan" }],
    robots: "index, follow, max-image-preview:large",
    metadataBase: new URL("https://www.shainwaiyan.com"),
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': 'https://www.shainwaiyan.com',
        'zh': 'https://www.shainwaiyan.com/zh',
        'x-default': 'https://www.shainwaiyan.com',
      },
    },
    openGraph: {
      type: 'website',
      url: baseUrl,
      title: isZh
        ? '数字营销与品牌策略师 | Shain Wai Yan'
        : 'Digital Marketing & Brand Strategist | Shain Wai Yan',
      description: isZh
        ? '在Shain Wai Yan (xolbine)的作品集中探索AI驱动的营销活动、内容策略和市场分析。'
        : 'Explore AI‑powered campaigns, content strategy, & market analysis in the portfolio of Shain Wai Yan (xolbine).',
      images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
      siteName: isZh ? "Shain的作品集" : "Shain's Portfolio",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh
        ? '数字营销与品牌策略师 | Shain Wai Yan'
        : 'Digital Marketing & Brand Strategist | Shain Wai Yan',
      description: isZh
        ? '在Shain Wai Yan (xolbine)的作品集中探索AI驱动的营销活动、内容策略和市场分析。'
        : 'Explore AI‑powered campaigns, content strategy, & market analysis in the portfolio of Shain Wai Yan (xolbine).',
      images: ['https://www.shainwaiyan.com/images/Shain Studio.png'],
    },
    icons: {
      icon: [
        { url: '/images/Shain Studio.png', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '32x32', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '96x96', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '192x192', type: 'image/png' },
      ],
      shortcut: '/images/Shain Studio.png',
      apple: '/images/Shain Studio.png',
    }
  };
}

/**
 * LocaleLayout component
 */
export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = use(params);
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const htmlLang = getHtmlLang(locale);

  const isZh = locale === 'zh';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://www.shainwaiyan.com/#person',
        name: 'Shain Wai Yan',
        alternateName: ['xolbine', '明元易'],
        url: 'https://www.shainwaiyan.com',
        image: 'https://www.shainwaiyan.com/images/Shain Studio.png',
        jobTitle: isZh ? '数字营销与品牌策略师' : 'Digital Marketing & Brand Strategist',
        description: isZh
          ? 'AI驱动的数字营销与品牌策略专家，专注于内容策略与市场分析。'
          : 'AI-powered digital marketing & brand strategy expert specialising in content strategy and market analysis.',
        knowsAbout: [
          'Digital Marketing',
          'Brand Strategy',
          'AI Marketing',
          'Content Strategy',
          'Market Analysis',
          'Social Media Marketing',
          'SEO',
        ],
        sameAs: [
          'https://www.linkedin.com/in/shainwaiyan/',
          'https://github.com/Shain-Wai-Yan',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.shainwaiyan.com/#website',
        url: 'https://www.shainwaiyan.com',
        name: isZh ? 'Shain的作品集' : "Shain's Portfolio",
        description: isZh
          ? 'Shain Wai Yan (xolbine) 的数字营销与品牌策略作品集。'
          : 'Digital Marketing & Brand Strategy portfolio of Shain Wai Yan (xolbine).',
        // ── FIX 3: String instead of Array ──
        inLanguage: isZh ? 'zh-CN' : 'en-US',
        publisher: { '@id': 'https://www.shainwaiyan.com/#person' },
      },
    ],
  };

  return (
    <html lang={htmlLang} suppressHydrationWarning dir="ltr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <SyntaxWidget />
        <ClarityAnalytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}