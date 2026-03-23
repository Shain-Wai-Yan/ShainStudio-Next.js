'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { getDictionarySync } from '@/lib/getDictionary';

const Footer = () => {
  const pathname = usePathname();

  // Extract locale from pathname /[locale]/... or fallback to legacy /zh pattern
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

  // Load the Credly script after the component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//cdn.credly.com/assets/utilities/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const socialLinks = [
    { href: 'https://www.linkedin.com/in/shainwaiyan/', label: 'LinkedIn', icon: FaLinkedin },
    { href: 'https://github.com/Shain-Wai-Yan', label: 'GitHub', icon: FaGithub },
    { href: 'mailto:mail@shainwaiyan.com', label: 'Email', icon: FaEnvelope },
  ];

  return (
    <footer className="bg-[#191970] dark:bg-[#0f0f1e] border-t-4 border-[#ffd700] text-white py-16 w-full">
      <div className="px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <Link href={locale === 'en' ? '/' : basePath} className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-300 w-fit group">
              <Image
                src="/images/Shain Studio.png"
                alt="Shain Studio Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain rounded group-hover:scale-110 transition-transform duration-300"
              />
              <div>
                <span className="font-bold text-lg block text-[#ffd700] dark:text-[#d4af37]">{"Shain's Studio"}</span>
                <span className="text-xs text-[#cccccc] dark:text-[#999999]">{t.footer.tagline}</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mt-2 text-[#cccccc] dark:text-[#999999]">
              {t.footer.description}
            </p>
          </div>

          {/* Certifications / Badges Section */}
          <div>
            <h3 className="font-bold text-lg mb-6 pb-2 border-b-2 text-[#ffd700] dark:text-[#d4af37] border-[#ffd700] dark:border-[#d4af37]">
              {t.footer.certifications}
            </h3>
            <div className="flex flex-wrap gap-2 justify-start items-center">
              {/* Badge 1 */}
              <div
                data-iframe-width="120"
                data-iframe-height="240"
                data-share-badge-id="69accbc5-d047-45d9-a997-544af3a0d61a"
                data-share-badge-host="https://www.credly.com"
              ></div>

              {/* Badge 2 */}
              <div
                data-iframe-width="120"
                data-iframe-height="240"
                data-share-badge-id="335116bf-3f68-4605-8c27-26a59e7716c4"
                data-share-badge-host="https://www.credly.com"
              ></div>

              {/* Badge 3 */}
              <div
                data-iframe-width="120"
                data-iframe-height="240"
                data-share-badge-id="a40dacba-cd6a-496d-8275-88339c8f18d4"
                data-share-badge-host="https://www.credly.com"
              ></div>
            </div>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="font-bold text-lg mb-6 pb-2 border-b-2 text-[#ffd700] dark:text-[#d4af37] border-[#ffd700] dark:border-[#d4af37]">
              {t.footer.connectWithMe}
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 transform hover:scale-125 font-bold text-white bg-[#2a2a9a] dark:bg-[#3a3a4a] hover:bg-[#ffd700] dark:hover:bg-[#d4af37] hover:text-[#191970]"
                    aria-label={social.label}
                  >
                    <Icon size={22} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-[#2a2a9a] dark:border-[#333333] my-12"></div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-[#e0e0e0] dark:text-[#999999]">
            &copy; {currentYear} {"Shain Studio"}. {t.footer.allRightsReserved}
          </p>
          <div className="flex gap-8">
            <Link
              href={`${basePath}/privacy`}
              className="text-[#cccccc] dark:text-[#777777] hover:text-[#ffd700] dark:hover:text-[#d4af37] transition-colors duration-300 font-medium"
            >
              {t.footer.privacyPolicy}
            </Link>
            <Link
              href={`${basePath}/terms`}
              className="text-[#cccccc] dark:text-[#777777] hover:text-[#ffd700] dark:hover:text-[#d4af37] transition-colors duration-300 font-medium"
            >
              {t.footer.termsOfService}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
