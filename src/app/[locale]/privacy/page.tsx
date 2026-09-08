import { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { brandedTitle } from '@/lib/seo';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}
export const dynamicParams = false;

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: PrivacyPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;
  return {
    title: { absolute: brandedTitle(t.privacy.title, 'Shain Studio') },
    description: t.privacy.introduction,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `https://www.shainwaiyan.com${basePath}/privacy`,
      languages: {
        en: `https://www.shainwaiyan.com/privacy`,
        zh: `https://www.shainwaiyan.com/zh/privacy`,
        'x-default': `https://www.shainwaiyan.com/privacy`,
      },
    },
  };
}

export default async function PrivacyPage(props: PrivacyPageProps) {
  const { locale: rawLocale } = await props.params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const sections: { title: string; content: string }[] =
    Array.isArray(t.privacy.sections) ? t.privacy.sections : [];

  return (
    <main className="min-h-screen bg-[#F7F5F0] dark:bg-[#0d0d0d] py-12 md:py-20 px-4 sm:px-6">

      <div className="max-w-3xl mx-auto">

        {/* ── Masthead ── */}
        <header className="mb-16 md:mb-24">
          {/* Top rule bar */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gray-900 dark:bg-gray-200" />
            <span className="text-[9px] tracking-[0.4em] uppercase font-semibold text-gray-500 dark:text-gray-400 shrink-0">
              Shain Studio · Legal
            </span>
            <div className="h-px flex-1 bg-gray-900 dark:bg-gray-200" />
          </div>

          {/* Large display title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50 uppercase"
            style={{ letterSpacing: '-0.02em' }}
          >
            {t.privacy.title}
          </h1>

          {/* Sub-rule + date row */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-300 dark:border-gray-700 py-3">
            <span className="text-[10px] tracking-[0.25em] uppercase font-medium text-gray-400 dark:text-gray-500">
              {t.privacy.effectiveDate}
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase font-medium text-gray-400 dark:text-gray-500">
              www.shainwaiyan.com
            </span>
          </div>

          {/* Preamble */}
          <p className="mt-10 text-base md:text-lg text-gray-600 dark:text-gray-400 font-light leading-[1.9] max-w-2xl">
            {t.privacy.introduction}
          </p>
        </header>

        {/* ── Sections ── */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800 mt-2">
          {sections.map((section: { title: string; content: string }, index: number) => (
            <div key={index} className="py-8 md:py-12 flex gap-4 md:gap-8 items-start">
              {/* Ornamental section number */}
              <span
                className="text-3xl sm:text-4xl font-serif font-bold text-gray-400 dark:text-[#a67c52] leading-none select-none shrink-0 w-8 sm:w-10 pt-0.5"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="space-y-4">
                {/* Section heading — strip the leading "1. " numbering that's already in the title */}
                <h2 className="text-sm md:text-base font-semibold uppercase tracking-[0.18em] text-gray-900 dark:text-gray-100">
                  {section.title.replace(/^\d+\.\s*/, '')}
                </h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-light leading-[2]">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer colophon ── */}
        <footer className="mt-16 md:mt-24 border-t border-gray-300 dark:border-gray-700 pt-12 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            {/* Monogram seal */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-gray-400 dark:border-gray-600 flex items-center justify-center shrink-0">
                <span className="text-base font-serif font-bold text-gray-700 dark:text-gray-300 select-none">SW</span>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-700 dark:text-gray-300">Shain Wai Yan</p>
                <p className="text-[10px] tracking-wider uppercase text-gray-400 dark:text-gray-500">Shain Studio</p>
              </div>
            </div>

            {/* Contact */}
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-2">
                Legal enquiries
              </p>
              <a
                href="mailto:contact@shainwaiyan.com"
                className="text-sm md:text-base font-light text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300 underline underline-offset-4 decoration-1"
              >
                contact@shainwaiyan.com
              </a>
            </div>
          </div>

          <p className="mt-10 text-[10px] uppercase tracking-[0.25em] text-gray-300 dark:text-gray-700 text-center">
            © {new Date().getFullYear()} Shain Studio · All rights reserved
          </p>
        </footer>

      </div>
    </main>
  );
}
