'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Me' },
    {
      href: '/portfolio',
      label: 'Portfolio',
      dropdown: [
        { href: '/portfolio/business-plan', label: 'Business Plans' },
        { href: '/portfolio/marketing-plan', label: 'Marketing Plans' },
        { href: '/portfolio/marketing-in-motion', label: 'Marketing in Motion' },
        { href: '/portfolio/coding-projects', label: 'Coding Projects' },
        { href: '/portfolio/photography', label: 'Photography' },
        { href: '/portfolio/amv-editing', label: 'AMV Editing' },
      ],
    },
    { href: '/certificate', label: 'Certificate' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact Me' },
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo">
          <Link href="/">
            <img
              src="/images/Shain Studio.png"
              alt="Shain Studio Logo"
              className="logo-image"
            />
            <span>Shain's Portfolio</span>
          </Link>
        </div>
        <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href} className="group relative">
                {link.dropdown ? (
                  <>
                    <Link href={link.href} className={pathname.startsWith(link.href) ? 'active' : ''}>
                      {link.label}
                    </Link>
                    <ul className="absolute hidden group-hover:block bg-white text-black shadow-lg rounded-md mt-2 py-2 w-48 z-20">
                      {link.dropdown.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                              pathname === item.href ? 'font-bold' : ''
                            }`}>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={pathname === link.href ? 'active' : ''}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
