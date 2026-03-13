'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';

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
    <header style={{ backgroundColor: '#191970', width: '100%' }} className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 shadow-lg">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 max-w-full">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-300">
            <img
              src="/images/Shain Studio.png"
              alt="Shain Studio Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded"
            />
            <span style={{ color: '#ffffff' }} className="font-bold text-lg sm:text-xl hidden sm:inline">Shain's Portfolio</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0">
          <ul className="flex gap-0 items-center">
            {navLinks.map((link) => (
              <li key={link.href} className="group relative">
                {link.dropdown ? (
                  <>
                    <button 
                      style={{ color: pathname.startsWith(link.href) ? '#ffd700' : '#ffffff' }}
                      className="px-4 py-2 font-medium transition-colors duration-300 relative hover:text-[#ffd700]"
                    >
                      {link.label}
                      <span style={{ height: '3px', backgroundColor: '#ffd700' }} className={`absolute bottom-0 left-0 transition-all duration-300 ${
                        pathname.startsWith(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}></span>
                    </button>
                    <ul className="absolute hidden group-hover:block bg-white text-[#191970] shadow-xl rounded-lg mt-0 py-2 w-56 z-20 border-t-4 border-[#ffd700]">
                      {link.dropdown.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`block px-4 py-3 text-sm font-medium transition-all duration-300 ${
                              pathname === item.href 
                                ? 'bg-[#ffd700] text-white' 
                                : 'hover:bg-[#ffd700] hover:text-white text-[#191970]'
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
                    style={{ color: pathname === link.href ? '#ffd700' : '#ffffff' }}
                    className="px-4 py-2 font-medium transition-colors duration-300 relative hover:text-[#ffd700]"
                  >
                    {link.label}
                    <span style={{ height: '3px', backgroundColor: '#ffd700' }} className={`absolute bottom-0 left-0 transition-all duration-300 ${
                      pathname === link.href ? 'w-full' : 'w-0 hover:w-full'
                    }`}></span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          style={{ color: '#ffffff' }}
          className="lg:hidden hover:text-[#ffd700] transition-colors duration-300 flex items-center justify-center p-2"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t-4 border-[#ffd700] shadow-xl z-50">
          <nav className="w-full">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href} className="border-b border-gray-100">
                  {link.dropdown ? (
                    <details className="w-full">
                      <summary className="px-6 py-4 text-[#191970] font-medium hover:bg-[#f8f9fa] cursor-pointer flex justify-between items-center">
                        {link.label}
                        <span className="text-[#ffd700]">+</span>
                      </summary>
                      <ul className="bg-[#f8f9fa] pl-6">
                        {link.dropdown.map((item) => (
                          <li key={item.href} className="border-t border-gray-100">
                            <Link
                              href={item.href}
                              className="block px-6 py-3 text-sm text-[#191970] hover:text-[#ffd700] hover:bg-white transition-colors duration-300"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link
                      href={link.href}
                      className={`block px-6 py-4 font-medium transition-colors duration-300 ${
                        pathname === link.href 
                          ? 'text-[#ffd700] bg-[#f8f9fa]' 
                          : 'text-[#191970] hover:text-[#ffd700] hover:bg-[#f8f9fa]'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
