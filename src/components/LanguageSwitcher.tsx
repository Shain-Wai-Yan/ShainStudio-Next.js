'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect current locale
  const isChineseRoute = pathname.startsWith('/zh');
  const currentLocale = isChineseRoute ? 'zh' : 'en';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const switchLanguage = (newLocale: 'en' | 'zh') => {
    if (currentLocale === newLocale) {
      setIsOpen(false);
      return;
    }

    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Build new path
    let newPath = pathname;
    if (isChineseRoute) {
      // Remove /zh prefix
      newPath = pathname.replace(/^\/zh/, '') || '/';
    }

    if (newLocale === 'zh') {
      newPath = `/zh${newPath === '/' ? '' : newPath}`;
    }

    router.push(newPath);
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-white font-medium hover:bg-[#ffd700]/20 transition-colors duration-300"
        aria-label="Toggle language"
        style={{ color: '#ffffff' }}
      >
        {currentLocale === 'zh' ? '中文' : 'EN'}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-[#ffd700]">
          <button
            onClick={() => switchLanguage('en')}
            className={`w-full text-left px-4 py-2 font-medium transition-colors ${
              currentLocale === 'en'
                ? 'bg-[#ffd700] text-[#191970]'
                : 'text-[#191970] hover:bg-gray-100'
            }`}
          >
            English
          </button>
          <button
            onClick={() => switchLanguage('zh')}
            className={`w-full text-left px-4 py-2 font-medium transition-colors ${
              currentLocale === 'zh'
                ? 'bg-[#ffd700] text-[#191970]'
                : 'text-[#191970] hover:bg-gray-100'
            }`}
          >
            中文
          </button>
        </div>
      )}
    </div>
  );
}
