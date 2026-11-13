'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { SiGoogletranslate } from 'react-icons/si';
import { switchLocalePath, type Locale } from '@/lib/locales';

function selectLanguage(event: MouseEvent<HTMLAnchorElement>, locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  event.currentTarget.closest('details')?.removeAttribute('open');
}

export default function LanguageSwitcher({ previewPath }: { previewPath?: string } = {}) {
  const currentPathname = usePathname();
  const pathname = previewPath ?? currentPathname;
  const currentLocale: Locale = pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';

  return (
    <details className="relative group/language">
      <summary
        className="flex list-none cursor-pointer items-center gap-2 rounded-md px-3 py-2 font-medium text-white transition-colors duration-300 hover:bg-[#ffd700]/20 hover:text-[#ffd700] [&::-webkit-details-marker]:hidden"
        aria-label={currentLocale === 'zh' ? '切换语言' : 'Change language'}
      >
        <SiGoogletranslate className="w-5 h-5 transition-colors" />
        <BsChevronDown className="w-3 h-3 transition-transform duration-300 group-open/language:rotate-180" />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-32 overflow-hidden rounded-lg border border-[#ffd700] bg-white shadow-xl">
        {(['en', 'zh'] as const).map((locale) => (
          <Link
            key={locale}
            href={switchLocalePath(pathname, locale)}
            hrefLang={locale === 'zh' ? 'zh-CN' : 'en'}
            lang={locale === 'zh' ? 'zh-CN' : 'en'}
            prefetch={false}
            onClick={(event) => selectLanguage(event, locale)}
            aria-current={currentLocale === locale ? 'page' : undefined}
            className={`block w-full px-4 py-2 text-left font-medium transition-colors ${currentLocale === locale ? 'bg-[#ffd700] text-[#191970]' : 'text-[#191970] hover:bg-gray-100'}`}
          >
            {locale === 'zh' ? '中文' : 'English'}
          </Link>
        ))}
      </div>
    </details>
  );
}
