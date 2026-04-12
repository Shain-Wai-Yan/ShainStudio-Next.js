'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { getDictionarySync } from '@/lib/getDictionary';

/* ─── animated verbs ──────────────────────────────────────────────────── */
const VERBS = ['work', 'wow', 'discover', 'create', 'grow'];
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

  const t = getDictionarySync(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const currentYear = new Date().getFullYear();

  /* animated verb state – simple index only, no animating flag */
  const [verbIdx, setVerbIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVerbIdx((prev) => (prev + 1) % VERBS.length);
    }, VERB_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* social icons */
  const socialLinks = [
    { href: 'https://www.linkedin.com/in/shainwaiyan/', label: 'LinkedIn', icon: FaLinkedin },
    { href: 'https://github.com/Shain-Wai-Yan', label: 'GitHub', icon: FaGithub },
    { href: 'mailto:mail@shainwaiyan.com', label: 'Email', icon: FaEnvelope },
  ];

  /* scroll-to-top */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer-root">
      {/* ── TOP SECTION ────────────────────────────────────────────── */}
      <div className="footer-top">
        {/* Left — editorial headline + CTA */}
        <div className="footer-hero">
          <p className="footer-eyebrow">/ {locale === 'zh' ? '准备好合作了吗？' : "READY TO MAKE IT OFFICIAL?"}</p>

          <div className="footer-headline">
            <span className="footer-hl-line">
              {locale === 'zh' ? '让我们' : "let's"}&nbsp;
              {/*
                Fixed-width verb container: an invisible "discover" (the
                longest word) reserves the space; each real verb is
                absolutely stacked on top. Zero layout shift, Safari-safe.
              */}
              <span
                className="relative inline-block"
                aria-live="polite"
                aria-atomic="true"
              >
                {/* invisible sizer — always "discover" with extra padding so it's never cut off */}
                <span className="invisible select-none pr-2" aria-hidden="true">
                  discover
                </span>

                {/* all verbs stacked; only the current one is visible */}
                {VERBS.map((verb, i) => {
                  let position = 'next';
                  if (i === verbIdx) position = 'active';
                  else if (i === verbIdx - 1 || (verbIdx === 0 && i === VERBS.length - 1)) position = 'prev';

                  return (
                    <span
                      key={verb}
                      className="footer-verb absolute left-0 top-0 w-full h-full flex items-center justify-start"
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
            </span>
            <span className="footer-hl-line footer-hl-line--row">
              {locale === 'zh' ? '一起' : 'together'}
              <button
                onClick={scrollToTop}
                aria-label="Scroll to top / Contact CTA"
                className="footer-cta-btn"
              >
                <span className="footer-cta-arrow">↗</span>
              </button>
            </span>
          </div>
        </div>

        {/* Right — columns */}
        <div className="footer-cols">
          {/* Write to us */}
          <div className="footer-col">
            <p className="footer-col-label">/ {locale === 'zh' ? '联系我们' : 'WRITE TO US'}</p>
            <div className="footer-col-group">
              <p className="footer-col-key">{locale === 'zh' ? '电子邮件' : 'EMAIL'}</p>
              <a href="mailto:mail@shainwaiyan.com" className="footer-col-val footer-link">
                mail@shainwaiyan.com
              </a>
            </div>
            <div className="footer-col-group">
              <p className="footer-col-key">{locale === 'zh' ? '社交媒体' : 'SOCIAL'}</p>
              <div className="footer-social-row">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="footer-social-icon"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigate */}
          <div className="footer-col">
            <p className="footer-col-label">/ {locale === 'zh' ? '网站导航' : 'NAVIGATE'}</p>
            <div className="footer-col-group">
              <Link href={locale === 'en' ? '/' : basePath} className="footer-col-val footer-link">
                {locale === 'zh' ? '首页' : 'Home'}
              </Link>
              <Link href={`${basePath}/about`} className="footer-col-val footer-link">
                {locale === 'zh' ? '关于' : 'About'}
              </Link>
              <Link href={`${basePath}/portfolio`} className="footer-col-val footer-link">
                {locale === 'zh' ? '作品集' : 'Portfolio'}
              </Link>
              <Link href={`${basePath}/contact`} className="footer-col-val footer-link">
                {locale === 'zh' ? '联系' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BACK TO TOP ───────────────────────────────────────────── */}
      <div className="footer-divider" />
      <button onClick={scrollToTop} className="footer-back-top">
        <span className="footer-back-top-arrow">↗</span>
        <span>{locale === 'zh' ? '回到顶部' : 'BACK TO THE TOP'}</span>
      </button>

      {/* ── BOTTOM BAR ────────────────────────────────────────────── */}
      <div className="footer-bottom-wrapper">
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {currentYear} Shain Studio.&nbsp;{t.footer.allRightsReserved}
          </p>

          <div className="footer-bottom-links">
            <Link href={`${basePath}/privacy`} className="footer-bottom-link">
              {t.footer.privacyPolicy}
            </Link>
            <span className="footer-bottom-sep">\</span>
            <Link href={`${basePath}/terms`} className="footer-bottom-link">
              {t.footer.termsOfService}
            </Link>
          </div>
        </div>
      </div>

      {/* ── INLINE STYLES ─────────────────────────────────────────── */}
      <style>{`
        /* ── root ── */
        .footer-root {
          background-color: #191970;
          color: #e8e8e8;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          width: 100%;
          border-top: 3px solid #ffd700;
        }

        /* dark mode override */
        @media (prefers-color-scheme: dark) {
          .footer-root { background-color: #0c0c14; }
        }
        :global(.dark-mode) .footer-root,
        .dark .footer-root {
          background-color: #0c0c14;
        }

        /* ── top section ── */
        .footer-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          padding: 4rem 5vw 2rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .footer-top { grid-template-columns: 1fr; padding: 3rem 1.5rem 1.5rem; }
        }

        /* ── hero ── */
        .footer-hero { display: flex; flex-direction: column; gap: 1rem; }

        .footer-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          color: #808080;
          text-transform: uppercase;
          margin: 0;
          font-weight: 500;
        }

        .footer-headline {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          line-height: 1;
        }

        .footer-hl-line {
          display: block;
          font-size: clamp(3rem, 7vw, 6rem);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          line-height: 1.05;
          text-transform: lowercase;
          font-family: 'Poppins', 'Inter', sans-serif;
        }

        .footer-hl-line--row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* ── animated verb (color + italic only; transitions via inline style) ── */
        .footer-verb {
          color: #ffd700;
          font-style: italic;
          will-change: opacity, transform;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ── CTA circle button ── */
        .footer-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3.2rem;
          height: 3.2rem;
          border-radius: 50%;
          background: #ffffff;
          color: #0c0c14;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.25s ease, transform 0.25s ease;
          font-size: 1.1rem;
        }
        .footer-cta-btn:hover {
          background: #ffd700;
          transform: rotate(45deg) scale(1.08);
        }
        .footer-cta-arrow { line-height: 1; }

        /* ── columns ── */
        .footer-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding-top: 2rem;
        }
        @media (max-width: 480px) {
          .footer-cols { grid-template-columns: 1fr; }
        }

        .footer-col { display: flex; flex-direction: column; gap: 1.2rem; }

        .footer-col-label {
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          color: #666;
          text-transform: uppercase;
          margin: 0;
          font-weight: 500;
        }

        .footer-col-group { display: flex; flex-direction: column; gap: 0.25rem; }

        .footer-col-key {
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          font-weight: 700;
          color: #aaaaaa;
          text-transform: uppercase;
          margin: 0 0 0.15rem;
        }

        .footer-col-val {
          font-size: 0.82rem;
          color: #cccccc;
          margin: 0;
          line-height: 1.7;
        }

        .footer-link {
          text-decoration: none;
          color: #cccccc;
          transition: color 0.2s ease;
        }
        .footer-link:hover { color: #ffd700; }

        /* social row */
        .footer-social-row {
          display: flex;
          gap: 0.6rem;
          margin-top: 0.3rem;
          flex-wrap: wrap;
        }
        .footer-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 6px;
          background: rgba(255,215,0,0.08);
          border: 1px solid rgba(255,215,0,0.15);
          color: #cccccc;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .footer-social-icon:hover {
          background: #ffd700;
          color: #0c0c14;
          transform: translateY(-2px);
          border-color: #ffd700;
        }

        /* ── divider ── */
        .footer-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 0 5vw;
        }

        /* ── back to top ── */
        .footer-back-top {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 5vw;
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .footer-back-top:hover { color: #ffd700; }
        .footer-back-top-arrow { font-size: 0.9rem; }

        /* ── bottom bar wrapper (white card, flush to bottom) ── */
        .footer-bottom-wrapper {
          padding: 0 5vw 0;
        }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem 2rem;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: #ffffff;
          border-radius: 16px 16px 0 0;
        }

        .footer-copy {
          font-size: 0.7rem;
          color: #333333;
          margin: 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .footer-bottom-link {
          font-size: 0.7rem;
          color: #333333;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .footer-bottom-link:hover { color: #191970; }

        .footer-bottom-sep { color: #aaaaaa; font-size: 0.75rem; }
      `}</style>
    </footer>
  );
};

export default Footer;
