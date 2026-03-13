'use client';
import React from 'react';
import Link from 'next/link';
import { FaLinkedin, FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/about', label: 'About' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/certificate', label: 'Certificates' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const socialLinks = [
    { href: 'https://www.linkedin.com/in/shainwaiyan/', label: 'LinkedIn', icon: FaLinkedin },
    { href: 'https://github.com/Shain-Wai-Yan', label: 'GitHub', icon: FaGithub },
    { href: 'mailto:mail@shainwaiyan.com', label: 'Email', icon: FaEnvelope },
  ];

  return (
    <footer style={{ backgroundColor: '#191970', borderTop: '4px solid #ffd700' }} className="text-white py-16 mt-24 w-full">
      <div className="px-4 sm:px-6 lg:px-8 max-w-full">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-300 w-fit group">
              <img
                src="/images/Shain Studio.png"
                alt="Shain Studio Logo"
                className="w-12 h-12 object-contain rounded group-hover:scale-110 transition-transform duration-300"
              />
              <div>
                <span className="font-bold text-lg block" style={{ color: '#ffd700' }}>Shain's Studio</span>
                <span className="text-xs" style={{ color: '#cccccc' }}>Digital Marketing</span>
              </div>
            </Link>
            <p style={{ color: '#cccccc' }} className="text-sm leading-relaxed max-w-xs mt-2">
              Transforming brands through innovative marketing strategies and creative excellence.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 style={{ color: '#ffd700', borderColor: '#ffd700' }} className="font-bold text-lg mb-6 pb-2 border-b-2">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    style={{ color: '#cccccc' }}
                    className="hover:text-[#ffd700] transition-all duration-300 relative group inline-block font-medium"
                  >
                    {link.label}
                    <span style={{ backgroundColor: '#ffd700', height: '2px' }} className="absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 style={{ color: '#ffd700', borderColor: '#ffd700' }} className="font-bold text-lg mb-6 pb-2 border-b-2">Connect With Me</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 transform hover:scale-120 font-bold text-white hover:shadow-gold"
                    style={{ 
                      backgroundColor: '#2a2a9a',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffd700';
                      e.currentTarget.style.color = '#191970';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2a2a9a';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    aria-label={social.label}
                  >
                    <Icon size={22} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderColor: '#2a2a9a' }} className="border-t my-12"></div>

        {/* Copyright Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p style={{ color: '#e0e0e0' }}>
            &copy; {currentYear} Shain Studio. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" style={{ color: '#cccccc' }} className="hover:text-[#ffd700] transition-colors duration-300 font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: '#cccccc' }} className="hover:text-[#ffd700] transition-colors duration-300 font-medium">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
