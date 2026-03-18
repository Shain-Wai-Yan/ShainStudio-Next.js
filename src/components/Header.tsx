'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';
import { getTranslations } from '@/lib/i18n';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const pathname = usePathname();
  const isChineseRoute = pathname.startsWith('/zh');
  const translations = getTranslations(isChineseRoute ? 'zh' : 'en');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const togglePortfolio = () => setIsPortfolioOpen(!isPortfolioOpen);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const basePath = isChineseRoute ? '/zh' : '';

  const portfolioItems = [
    { href: `${basePath}/portfolio/business-plans`, label: translations.nav.businessPlans },
    { href: `${basePath}/portfolio/marketing-plans`, label: translations.nav.marketingPlans },
    { href: `${basePath}/portfolio/marketing-in-motion`, label: translations.nav.marketingInMotion },
    { href: `${basePath}/portfolio/coding-projects`, label: translations.nav.codingProjects },
    { href: `${basePath}/portfolio/photography`, label: translations.nav.photography },
    { href: `${basePath}/portfolio/amv-editing`, label: translations.nav.amvEditing },
  ];

  const navLinks = [
    { href: `${basePath}/`, label: translations.nav.home },
    { href: `${basePath}/about`, label: translations.nav.about },
    { href: `${basePath}/portfolio`, label: translations.nav.portfolio, hasDropdown: true },
    { href: `${basePath}/certificate`, label: translations.nav.certificate },
    { href: `${basePath}/blog`, label: translations.nav.blog },
    { href: `${basePath}/contact`, label: translations.nav.contact },
  ];

  const isActiveRoute = (href: string): boolean => {
    if (href === `${basePath}/`) {
      return pathname === `${basePath}/` || pathname === '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isPortfolioActive = pathname.includes('/portfolio');

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 shadow-lg bg-[#191970] dark:bg-[#0f0f1e]">
      {/* Animated gold glow bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden z-10 header-glow-wrapper">
        <div className="header-glow-bar h-full w-full" />
      </div>

      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 max-w-full">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href={basePath || '/'} className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-300">
            <img
              src="/images/Shain Studio.png"
              alt="Shain Studio Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded"
            />
            <span className="font-bold text-lg sm:text-xl hidden sm:inline text-white">
              Shain Studio
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0" role="navigation" aria-label="Main navigation">
          <ul className="flex gap-0 items-center">
            {navLinks.map((link) => {
              const active = link.hasDropdown ? isPortfolioActive : isActiveRoute(link.href);
              return (
                <li key={link.href} className="group relative">
                  {link.hasDropdown ? (
                    <>
                      <Link
                        href={link.href}
                        className={`px-4 py-2 font-medium inline-block transition-all duration-200 border-b-[3px] ${
                          active
                            ? 'text-[#ffd700] border-b-[#ffd700]'
                            : 'text-white border-b-transparent hover:text-[#ffd700] hover:border-b-[#ffd700]'
                        }`}
                      >
                        {link.label}
                      </Link>
                      <ul 
                        className="absolute hidden group-hover:block bg-white dark:bg-[#1e1e2e] text-[#191970] dark:text-white shadow-xl rounded-lg mt-0 py-2 w-64 z-20 border-t-4 border-[#ffd700]"
                        role="menu"
                      >
                        {portfolioItems.map((item) => (
                          <li key={item.href} role="none">
                            <Link
                              href={item.href}
                              className={`block px-4 py-3 text-sm font-medium transition-all duration-300 ${
                                pathname === item.href
                                  ? 'bg-[#ffd700] text-[#191970] dark:bg-[#d4af37]'
                                  : 'text-[#191970] dark:text-white hover:bg-[#ffd700] hover:text-[#191970] dark:hover:bg-[#d4af37] dark:hover:text-[#191970]'
                              }`}
                              role="menuitem"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      className={`px-4 py-2 font-medium inline-block transition-all duration-200 border-b-[3px] ${
                        active
                          ? 'text-[#ffd700] border-b-[#ffd700]'
                          : 'text-white border-b-transparent hover:text-[#ffd700] hover:border-b-[#ffd700]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Language Switcher + Mobile Button */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            className="lg:hidden hover:text-[#ffd700] transition-colors duration-300 flex items-center justify-center p-2 w-12 h-12 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd700]"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#1e1e2e] border-t-4 border-[#ffd700] shadow-xl z-50 max-h-[calc(100vh-80px)] overflow-y-auto"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <nav className="w-full">
            <ul className="flex flex-col" role="menu">
              {navLinks.map((link) => {
                const active = link.hasDropdown ? isPortfolioActive : isActiveRoute(link.href);
                return (
                  <li key={link.href} role="none" className="border-b border-gray-100 dark:border-[#333333]">
                    {link.hasDropdown ? (
                      <>
                        {/* Portfolio main link + expand button container */}
                        <div className="flex items-stretch">
                          {/* Portfolio Link (clickable) */}
                          <Link
                            href={link.href}
                            className={`flex-1 px-6 py-4 font-medium transition-colors duration-300 ${
                              active
                                ? 'text-[#ffd700] bg-[#f8f9fa] dark:bg-[#2a2a3a]'
                                : 'text-[#191970] dark:text-white hover:text-[#ffd700] dark:hover:text-[#d4af37] hover:bg-[#f8f9fa] dark:hover:bg-[#2a2a3a]'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                            role="menuitem"
                          >
                            {link.label}
                          </Link>

                          {/* Expand/Collapse Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              togglePortfolio();
                            }}
                            className={`px-4 py-4 flex items-center justify-center border-l border-gray-100 dark:border-[#333333] transition-colors duration-300 ${
                              active
                                ? 'text-[#ffd700] bg-[#f8f9fa] dark:bg-[#2a2a3a]'
                                : 'text-[#191970] dark:text-white hover:text-[#ffd700] dark:hover:text-[#d4af37] hover:bg-[#f8f9fa] dark:hover:bg-[#2a2a3a]'
                            }`}
                            aria-expanded={isPortfolioOpen}
                            aria-controls="portfolio-menu"
                            aria-label="Toggle portfolio submenu"
                          >
                            <FaChevronDown 
                              size={16} 
                              className={`text-[#ffd700] transition-transform duration-300 ${isPortfolioOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Portfolio Submenu */}
                        {isPortfolioOpen && (
                          <ul 
                            id="portfolio-menu"
                            className="bg-[#f8f9fa] dark:bg-[#2a2a3a] flex flex-col"
                            role="menu"
                          >
                            {portfolioItems.map((item) => (
                              <li key={item.href} role="none" className="border-t border-gray-100 dark:border-[#333333]">
                                <Link
                                  href={item.href}
                                  className={`block px-6 py-3 text-sm transition-colors duration-300 ${
                                    pathname === item.href
                                      ? 'text-[#ffd700] dark:text-[#d4af37] bg-white dark:bg-[#333333] font-semibold'
                                      : 'text-[#191970] dark:text-white hover:text-[#ffd700] dark:hover:text-[#d4af37] hover:bg-white dark:hover:bg-[#333333]'
                                  }`}
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsPortfolioOpen(false);
                                  }}
                                  role="menuitem"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        className={`block px-6 py-4 font-medium transition-colors duration-300 ${
                          active
                            ? 'text-[#ffd700] bg-[#f8f9fa] dark:bg-[#2a2a3a]'
                            : 'text-[#191970] dark:text-white hover:text-[#ffd700] dark:hover:text-[#d4af37] hover:bg-[#f8f9fa] dark:hover:bg-[#2a2a3a]'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                        role="menuitem"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      <style jsx>{`
        @keyframes headerGlow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .header-glow-bar {
          background-image: linear-gradient(90deg, transparent 0%, #3d2800 10%, #a67c00 20%, #d4af37 35%, #f9df85 50%, #d4af37 65%, #a67c00 80%, #3d2800 90%, transparent 100%);
          background-size: 200% 100%;
          animation: headerGlow 4s linear infinite;
          box-shadow: 0 0 12px rgba(212,175,55,0.6), 0 0 24px rgba(212,175,55,0.2);
          filter: blur(0.3px);
        }
      `}</style>
    </header>
  );
};

export default Header;