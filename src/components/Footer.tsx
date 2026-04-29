'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { getDictionarySync } from '@/lib/getDictionary';

/* ─── animated verbs ──────────────────────────────────────────────────── */
const VERB_INTERVAL = 2200; // ms between swaps

const Footer = () => {
  const pathname = usePathname();

  /* locale resolution */
  const pathSegments = pathname.split('/').filter(Boolean);
  let locale: 'en' | 'zh' = DEFAULT_LOCALE as 'en' | 'zh';
  if (pathSegments.length > 0) {
    if (isSupportedLocale(pathSegments[0])) {
      locale = pathSegments[0] as 'en' | 'zh';
    } else if (pathname.startsWith('/zh')) {
      locale = 'zh';
    }
  }

  /* ── localization ── */
  const t = getDictionarySync(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const currentYear = new Date().getFullYear();

  const verbs = (t.footer.verbs as string[]) || ['work', 'wow', 'discover', 'create', 'grow'];
  const longestVerb = (t.footer.longestVerb as string) || 'discover';

  /* animated verb state – simple index only, no animating flag */
  const [verbIdx, setVerbIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVerbIdx((prev) => (prev + 1) % verbs.length);
    }, VERB_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [verbs.length]);

  /* social icons */
  const socialLinks = [
    { href: 'https://www.linkedin.com/in/shainwaiyan/', label: 'LinkedIn', icon: FaLinkedin },
    { href: 'https://github.com/Shain-Wai-Yan', label: 'GitHub', icon: FaGithub },
    { href: 'mailto:mail@shainwaiyan.com', label: 'Email', icon: FaEnvelope },
  ];

  /* scroll-to-top */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="w-full border-t-[3px] border-[#ffd700] bg-[#191970] dark:bg-[#0c0c14] text-[#e8e8e8] font-sans transition-colors duration-300">
      {/* ── TOP SECTION ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-12 px-6 md:px-[5vw] pt-12 md:pt-16 pb-6 md:pb-8 items-start">
        {/* Left — editorial headline + CTA */}
        <div className="flex flex-col gap-4">
          <p className="text-[0.7rem] tracking-[0.18em] text-[#808080] uppercase m-0 font-medium">/ {locale === 'zh' ? '准备好合作了吗？' : "READY TO MAKE IT OFFICIAL?"}</p>

          <div className="flex flex-col gap-0.5 leading-[1]">
            <span className="block text-[clamp(3rem,8vw,6rem)] font-[800] text-white tracking-[-0.03em] leading-[1.05] lowercase font-secondary">
              {locale === 'zh' ? '让我们一起' : "let's"}&nbsp;
              {locale === 'en' && (
                <span
                  className="relative inline-block"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {/* invisible sizer — always longestVerb with extra padding so it's never cut off */}
                  <span className="invisible select-none pr-2" aria-hidden="true">
                    {longestVerb}
                  </span>

                  {/* all verbs stacked; only the current one is visible */}
                  {verbs.map((verb, i) => {
                    let position = 'next';
                    if (i === verbIdx) position = 'active';
                    else if (i === verbIdx - 1 || (verbIdx === 0 && i === verbs.length - 1)) position = 'prev';

                    return (
                      <span
                        key={verb}
                        className="bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] bg-clip-text text-transparent italic inline-block antialiased absolute left-0 top-0 w-full h-full flex items-center justify-start"
                        style={{
                          opacity: position === 'active' ? 1 : 0,
                          transform: 
                            position === 'active' ? 'translateY(0)' :
                            position === 'prev' ? 'translateY(-100%)' : 'translateY(100%)',
                          transition: position === 'next' ? 'none' : 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                          WebkitTransition: position === 'next' ? 'none' : 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), -webkit-transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                          pointerEvents: position === 'active' ? 'auto' : 'none',
                        }}
                        aria-hidden={position !== 'active'}
                      >
                        {verb}
                      </span>
                    );
                  })}
                </span>
              )}
            </span>
            <span className="flex items-center gap-4 text-[clamp(3rem,9vw,6rem)] font-[800] text-white tracking-[-0.03em] leading-[1.05] lowercase font-secondary">
              {locale === 'zh' && (
                <span
                  className="relative inline-block"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="invisible select-none pr-2" aria-hidden="true">
                    {longestVerb}
                  </span>
                  {verbs.map((verb, i) => {
                    let position = 'next';
                    if (i === verbIdx) position = 'active';
                    else if (i === verbIdx - 1 || (verbIdx === 0 && i === verbs.length - 1)) position = 'prev';

                    return (
                      <span
                        key={verb}
                        className="bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] bg-clip-text text-transparent italic inline-block antialiased absolute left-0 top-0 w-full h-full flex items-center justify-start"
                        style={{
                          opacity: position === 'active' ? 1 : 0,
                          transform: 
                            position === 'active' ? 'translateY(0)' :
                            position === 'prev' ? 'translateY(-100%)' : 'translateY(100%)',
                          transition: position === 'next' ? 'none' : 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                          WebkitTransition: position === 'next' ? 'none' : 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), -webkit-transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                          pointerEvents: position === 'active' ? 'auto' : 'none',
                        }}
                        aria-hidden={position !== 'active'}
                      >
                        {verb}
                      </span>
                    );
                  })}
                </span>
              )}
              {locale === 'en' && 'together'}
              <button
                onClick={scrollToTop}
                aria-label="Scroll to top / Contact CTA"
                className="inline-flex items-center justify-center w-[3.2rem] h-[3.2rem] rounded-full bg-white text-[#0c0c14] border-none cursor-pointer shrink-0 transition-all duration-300 ease-out hover:bg-[#ffd700] hover:rotate-45 hover:scale-105 text-[1.1rem]"
              >
                <span className="leading-none text-xl">↗</span>
              </button>
            </span>
          </div>
        </div>

        {/* Right — columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
          {/* Write to us */}
          <div className="flex flex-col gap-5">
            <p className="text-[0.65rem] tracking-[0.18em] text-[#666] uppercase m-0 font-medium">/ {locale === 'zh' ? '联系我们' : 'WRITE TO US'}</p>
            <div className="flex flex-col gap-1">
              <p className="text-[0.7rem] tracking-[0.12em] font-bold text-[#aaaaaa] uppercase m-0 mb-0.5">{locale === 'zh' ? '电子邮件' : 'EMAIL'}</p>
              <a href="mailto:mail@shainwaiyan.com" className="text-[0.82rem] text-[#cccccc] dark:text-[#cccccc] m-0 leading-[1.7] no-underline transition-colors duration-200 hover:text-[#ffd700] dark:hover:text-[#ffd700]">
                mail@shainwaiyan.com
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[0.7rem] tracking-[0.12em] font-bold text-[#aaaaaa] uppercase m-0 mb-0.5">{locale === 'zh' ? '社交媒体' : 'SOCIAL'}</p>
              <div className="flex gap-2.5 mt-1 flex-wrap">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-[#ffd700]/10 border border-[#ffd700]/15 text-[#cccccc] transition-all duration-200 hover:bg-[#ffd700] hover:text-[#0c0c14] hover:-translate-y-0.5 hover:border-[#ffd700]"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigate */}
          <div className="flex flex-col gap-5">
            <p className="text-[0.65rem] tracking-[0.18em] text-[#666] uppercase m-0 font-medium">/ {locale === 'zh' ? '网站导航' : 'NAVIGATE'}</p>
            <div className="flex flex-col gap-1">
              <Link href={locale === 'en' ? '/' : basePath} className="text-[0.82rem] text-[#cccccc] dark:text-[#cccccc] m-0 leading-[1.7] no-underline transition-colors duration-200 hover:text-[#ffd700] dark:hover:text-[#ffd700]">
                {locale === 'zh' ? '首页' : 'Home'}
              </Link>
              <Link href={`${basePath}/about`} className="text-[0.82rem] text-[#cccccc] dark:text-[#cccccc] m-0 leading-[1.7] no-underline transition-colors duration-200 hover:text-[#ffd700] dark:hover:text-[#ffd700]">
                {locale === 'zh' ? '关于' : 'About'}
              </Link>
              <Link href={`${basePath}/portfolio`} className="text-[0.82rem] text-[#cccccc] dark:text-[#cccccc] m-0 leading-[1.7] no-underline transition-colors duration-200 hover:text-[#ffd700] dark:hover:text-[#ffd700]">
                {locale === 'zh' ? '作品集' : 'Portfolio'}
              </Link>
              <Link href={`${basePath}/contact`} className="text-[0.82rem] text-[#cccccc] dark:text-[#cccccc] m-0 leading-[1.7] no-underline transition-colors duration-200 hover:text-[#ffd700] dark:hover:text-[#ffd700]">
                {locale === 'zh' ? '联系' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BACK TO TOP ───────────────────────────────────────────── */}
      <div className="h-[1px] bg-white/10 mx-[5vw]" />
      <button onClick={scrollToTop} className="inline-flex items-center gap-2 px-[5vw] py-4 bg-transparent border-none cursor-pointer text-[#888] text-[0.68rem] tracking-[0.16em] uppercase font-semibold transition-colors duration-200 hover:text-[#ffd700]">
        <span className="text-[0.9rem]">↗</span>
        <span>{locale === 'zh' ? '回到顶部' : 'BACK TO THE TOP'}</span>
      </button>

      {/* ── BOTTOM BAR ────────────────────────────────────────────── */}
      <div className="px-6 md:px-[5vw]">
        <div className="flex items-center justify-between py-[1.2rem] px-[2rem] flex-wrap gap-3 bg-white rounded-t-[16px] transition-colors duration-300">
          <p className="text-[0.7rem] text-[#333333] m-0 tracking-[0.05em] uppercase font-medium transition-colors duration-300">
            &copy; {currentYear} Shain Studio.&nbsp;{t.footer.allRightsReserved}
          </p>

          <div className="flex items-center gap-2.5">
            <Link href={`${basePath}/privacy`} className="text-[0.7rem] text-[#333333] no-underline uppercase tracking-[0.06em] font-medium transition-colors duration-300 hover:text-[#191970]">
              {t.footer.privacyPolicy}
            </Link>
            <span className="text-[#aaaaaa] text-[0.75rem] transition-colors duration-300">\</span>
            <Link href={`${basePath}/terms`} className="text-[0.7rem] text-[#333333] no-underline uppercase tracking-[0.06em] font-medium transition-colors duration-300 hover:text-[#191970]">
              {t.footer.termsOfService}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
