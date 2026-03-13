'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Load the Credly script after the component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//cdn.credly.com/assets/utilities/embed.js";
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
    <footer style={{ backgroundColor: '#191970', borderTop: '4px solid #ffd700' }} className="text-white py-16 mt-24 w-full">
      <div className="px-4 sm:px-6 lg:px-8 max-w-full">
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

          {/* Badges Section (Replaced Quick Links) */}
          <div>
            <h3 style={{ color: '#ffd700', borderColor: '#ffd700' }} className="font-bold text-lg mb-6 pb-2 border-b-2">Certifications</h3>
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
                    className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 transform hover:scale-125 font-bold text-white"
                    style={{ backgroundColor: '#2a2a9a' }}
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

        <div style={{ borderColor: '#2a2a9a' }} className="border-t my-12"></div>

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