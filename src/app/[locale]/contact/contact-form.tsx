'use client';

import { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { getDictionarySync } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import Image from 'next/image';
import { gsap } from 'gsap';

export function ContactForm() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  let locale: 'en' | 'zh' = DEFAULT_LOCALE as 'en' | 'zh';
  
  if (pathSegments.length > 0) {
    if (isSupportedLocale(pathSegments[0])) {
      locale = pathSegments[0] as 'en' | 'zh';
    } else if (pathname.startsWith('/zh')) {
      locale = 'zh';
    }
  }

  const t = getDictionarySync(locale).contactPage;

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    message: '',
  });
  const [charCount, setCharCount] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // GSAP Refs for the 10 Refined Shards + 2 Glare Shards + Base Medusa
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Apollo Shards (6 Shards)
  const apolloRift1Ref = useRef<HTMLDivElement>(null);
  const apolloRift2Ref = useRef<HTMLDivElement>(null);
  const apolloRift3Ref = useRef<HTMLDivElement>(null);
  const apolloRift4Ref = useRef<HTMLDivElement>(null); // Upper Arm (Far Left)
  const apolloRift5Ref = useRef<HTMLDivElement>(null); // Lower Arm (Far Left)
  const apolloRift6Ref = useRef<HTMLDivElement>(null); // Apollo Crossover Shoulder (Bottom-Right)
  
  // Athena Shards (4 Shards)
  const athenaRift1Ref = useRef<HTMLDivElement>(null);
  const athenaRift2Ref = useRef<HTMLDivElement>(null);
  const athenaRift3Ref = useRef<HTMLDivElement>(null);
  const athenaRift4Ref = useRef<HTMLDivElement>(null); // Athena Crossover Shoulder (Bottom-Left)

  // Glares & Base Medusa
  const glareShard1Ref = useRef<HTMLDivElement>(null);
  const glareShard2Ref = useRef<HTMLDivElement>(null);
  const baseMedusaRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'message') {
      setCharCount(Math.max(0, 500 - value.length));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // GSAP Refined Gentle Parallax (Subtle luxury separation)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Gentle separation for Apollo-containing Shards (max shift 12px)
    if (apolloRift1Ref.current) gsap.to(apolloRift1Ref.current, { x: x * -10, y: y * -8, duration: 0.7, ease: 'power1.out' });
    if (apolloRift2Ref.current) gsap.to(apolloRift2Ref.current, { x: x * -12, y: y * -10, duration: 0.7, ease: 'power1.out' });
    if (apolloRift3Ref.current) gsap.to(apolloRift3Ref.current, { x: x * -14, y: y * -12, duration: 0.7, ease: 'power1.out' });
    if (apolloRift4Ref.current) gsap.to(apolloRift4Ref.current, { x: x * -15, y: y * -14, duration: 0.7, ease: 'power1.out' }); // Upper Arm
    if (apolloRift5Ref.current) gsap.to(apolloRift5Ref.current, { x: x * -13, y: y * -16, duration: 0.7, ease: 'power1.out' }); // Lower Arm
    if (apolloRift6Ref.current) gsap.to(apolloRift6Ref.current, { x: x * 10, y: y * -10, duration: 0.7, ease: 'power1.out' }); // Crossover bottom-right

    // Gentle separation for Athena-containing Shards (max shift 12px)
    if (athenaRift1Ref.current) gsap.to(athenaRift1Ref.current, { x: x * 10, y: y * 8, duration: 0.7, ease: 'power1.out' });
    if (athenaRift2Ref.current) gsap.to(athenaRift2Ref.current, { x: x * 12, y: y * 10, duration: 0.7, ease: 'power1.out' });
    if (athenaRift3Ref.current) gsap.to(athenaRift3Ref.current, { x: x * 14, y: y * 12, duration: 0.7, ease: 'power1.out' });
    if (athenaRift4Ref.current) gsap.to(athenaRift4Ref.current, { x: x * -12, y: y * 12, duration: 0.7, ease: 'power1.out' }); // Crossover bottom-left

    // Empty polished glare glass shards
    if (glareShard1Ref.current) gsap.to(glareShard1Ref.current, { x: x * -15, y: y * -18, rotation: x * 5, duration: 0.8, ease: 'power1.out' });
    if (glareShard2Ref.current) gsap.to(glareShard2Ref.current, { x: x * 15, y: y * 12, rotation: y * -6, duration: 0.8, ease: 'power1.out' });

    // Subtle background Medusa depth drift
    if (baseMedusaRef.current) gsap.to(baseMedusaRef.current, { x: x * 3, y: y * 3, duration: 0.9, ease: 'power1.out' });
  };

  const handleMouseLeave = () => {
    const returnConfig = { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'power2.out' };
    
    // Reset Apollo Shards
    if (apolloRift1Ref.current) gsap.to(apolloRift1Ref.current, returnConfig);
    if (apolloRift2Ref.current) gsap.to(apolloRift2Ref.current, returnConfig);
    if (apolloRift3Ref.current) gsap.to(apolloRift3Ref.current, returnConfig);
    if (apolloRift4Ref.current) gsap.to(apolloRift4Ref.current, returnConfig);
    if (apolloRift5Ref.current) gsap.to(apolloRift5Ref.current, returnConfig);
    if (apolloRift6Ref.current) gsap.to(apolloRift6Ref.current, returnConfig);
    
    // Reset Athena Shards
    if (athenaRift1Ref.current) gsap.to(athenaRift1Ref.current, returnConfig);
    if (athenaRift2Ref.current) gsap.to(athenaRift2Ref.current, returnConfig);
    if (athenaRift3Ref.current) gsap.to(athenaRift3Ref.current, returnConfig);
    if (athenaRift4Ref.current) gsap.to(athenaRift4Ref.current, returnConfig);

    // Reset Glares & Medusa
    if (glareShard1Ref.current) gsap.to(glareShard1Ref.current, returnConfig);
    if (glareShard2Ref.current) gsap.to(glareShard2Ref.current, returnConfig);
    if (baseMedusaRef.current) gsap.to(baseMedusaRef.current, returnConfig);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const hutkMatch = document.cookie.match(/(?:^|; )hubspotutk=([^;]*)/);
      const hutk = hutkMatch ? hutkMatch[1] : null;

      const fields = [
        { name: 'email', value: formData.email },
        { name: 'firstname', value: formData.firstName },
        { name: 'lastname', value: formData.lastName },
        { name: 'message', value: formData.message },
      ];

      const payload = {
        portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
        formId: process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID,
        fields: fields,
        context: {
          hutk: hutk,
          pageUri: typeof window !== 'undefined' ? window.location.href : '',
          pageName: 'Contact Page',
        },
      };

      const response = await fetch(
        process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://form-collector.shainwaiyan.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setSubmitMessage(t.submitSuccess || 'Thank you! Your message has been sent successfully.');
        setSubmitStatus('success');
        setFormData({ email: '', firstName: '', lastName: '', message: '' });
        setCharCount(500);
      } else {
        throw new Error(responseData.error || 'Form submission failed');
      }
    } catch (error) {
      setSubmitMessage(t.submitError || 'Oops! Something went wrong. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 6000);
    }
  };

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#0c0b11] text-stone-900 dark:text-stone-100 overflow-hidden font-sans transition-colors duration-500 select-none">
      
      {/* ── Background Plaster Noise Texture Overlay (Replicating Certificate Hero Background) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.025)_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] bg-repeat pointer-events-none bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=20')]" />

      {/* ── Modern Technical Blueprint Grid Lines ── */}
      <div className="absolute inset-x-0 top-16 h-[1px] bg-stone-900/10 dark:bg-stone-100/5 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-16 h-[1px] bg-stone-900/10 dark:bg-stone-100/5 pointer-events-none" />
      <div className="absolute left-[8%] inset-y-0 w-[1px] bg-stone-900/10 dark:bg-stone-100/5 pointer-events-none hidden xl:block" />
      <div className="absolute right-[8%] inset-y-0 w-[1px] bg-stone-900/10 dark:bg-stone-100/5 pointer-events-none hidden xl:block" />

      {/* ── Outer Editorial Frame Grid Borders ── */}
      <div className="absolute inset-0 border-[1px] border-stone-300/40 dark:border-stone-850/40 pointer-events-none m-6 md:m-8" />
      
      {/* ── Left Monospace Rotated Sidebar ── */}
      <div className="hidden xl:flex absolute left-0 inset-y-0 w-8 items-center justify-center border-r border-stone-200 dark:border-stone-900 select-none">
        <span 
          className="text-[9px] font-mono tracking-[0.3em] text-stone-400 dark:text-stone-600 whitespace-nowrap uppercase"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {locale === 'zh' ? '设计 · 系统 · 智能 · 连接' : 'SKILLS · SYSTEMS · AGENTS · BYOK · LOCAL-FIRST'}
        </span>
      </div>

      {/* ── Right Monospace Rotated Sidebar ── */}
      <div className="hidden xl:flex absolute right-0 inset-y-0 w-8 items-center justify-center border-l border-stone-200 dark:border-stone-900 select-none">
        <span 
          className="text-[9px] font-mono tracking-[0.3em] text-stone-400 dark:text-stone-600 whitespace-nowrap uppercase"
          style={{ transform: 'rotate(90deg)' }}
        >
          SHAIN STUDIO — VOL. 01 — ISSUE Nº 26 — MADE ON EARTH — LANG: {locale.toUpperCase()}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 pt-32 pb-24 relative z-10">
        
        {/* ── Top Fine-Line Status Header ── */}
        <header className="flex flex-row items-center justify-between border-b border-stone-200 dark:border-stone-900 pb-6 mb-16 gap-2 md:gap-6 w-full overflow-hidden">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] md:text-[10px] font-mono font-extrabold tracking-wider md:tracking-widest text-[#191970] dark:text-[#ffd700] whitespace-nowrap">
              OD / 2026
            </span>
            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] md:text-[10px] font-mono tracking-wider md:tracking-widest text-stone-400 dark:text-stone-600 uppercase whitespace-nowrap">
              <span className="hidden sm:inline">FILED UNDER: </span>DESIGN &bull; INTELLIGENCE
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6 text-[7.5px] xs:text-[8.5px] sm:text-[9px] md:text-[10px] font-mono text-stone-400 dark:text-stone-600 uppercase tracking-wider md:tracking-widest whitespace-nowrap">
            <span className="hidden xs:inline">LIVE &bull; V0.8.0</span>
            <span className="text-[#191970] dark:text-[#ffd700] font-bold">
              <span className="hidden sm:inline">AVAILABILITY: </span>RECEPTIVE
            </span>
          </div>
        </header>

        {/* ── Insane Editorial Split Screen Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ── LEFT COLUMN: The Typographic Statement & Minimalist Form ── */}
          <div className="contents lg:block lg:col-span-7 lg:space-y-12">
            
            <div className="contents lg:block lg:space-y-4">
              <div className="space-y-4 order-1 lg:order-none">
                <span className="text-[10px] font-mono tracking-[0.25em] text-stone-400 dark:text-stone-500 uppercase font-bold block">
                  {t.collaboratorsBadge || "COLLABORATORS • Nº 06"}
                </span>
                
                <h2 className="text-[28px] xs:text-[32px] sm:text-5xl md:text-[54px] font-extrabold tracking-tight text-stone-950 dark:text-white leading-[1.1] sm:leading-[1.08] mb-6">
                  &ldquo;{t.headlinePart1} <br className="block sm:hidden" />
                  <span className="font-serif italic font-normal text-[#191970] dark:text-[#ffd700]">{t.headlinePart2}</span>{' '}
                  {t.headlinePart3}{' '}
                  <span className="font-serif italic font-normal text-[#191970] dark:text-[#ffd700]">
                    {t.headlinePart4} <br className="block sm:hidden" /> {t.headlinePart5}
                  </span>
                  &rdquo;
                </h2>
              </div>

              <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed font-medium order-3 lg:order-none">
                {t.heroSubtitle}
              </p>
            </div>

            {/* ── The Minimalist Editorial Form ── */}
            <form onSubmit={handleSubmit} className="space-y-8 border-t border-stone-200 dark:border-stone-900 pt-10 order-4 lg:order-none">
              
              {/* Field 01: Email */}
              <div className="group relative border-b border-stone-200 dark:border-stone-900 pb-3 transition-colors duration-300 focus-within:border-stone-955 dark:focus-within:border-white">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <label htmlFor="email" className="text-xs font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase flex items-center gap-2">
                    <span>01 /</span>
                    <span className="font-serif italic font-normal text-stone-900 dark:text-stone-100 text-sm normal-case">{t.emailLabel}</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    placeholder={t.emailPlaceholder}
                    className="w-full sm:w-[65%] bg-transparent border-none outline-none p-0 text-base font-bold text-stone-950 dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-700 placeholder:font-serif placeholder:italic placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Field 02 & 03: Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* First Name */}
                <div className="group relative border-b border-stone-200 dark:border-stone-900 pb-3 transition-colors duration-300 focus-within:border-stone-955 dark:focus-within:border-white">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <label htmlFor="firstName" className="text-xs font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase flex items-center gap-2">
                      <span>02 /</span>
                      <span className="font-serif italic font-normal text-stone-900 dark:text-stone-100 text-sm normal-case">{t.firstNameLabel}</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      placeholder={t.firstNamePlaceholder}
                      className="w-full sm:w-[55%] bg-transparent border-none outline-none p-0 text-base font-bold text-stone-950 dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-700 placeholder:font-serif placeholder:italic placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="group relative border-b border-stone-200 dark:border-stone-900 pb-3 transition-colors duration-300 focus-within:border-stone-955 dark:focus-within:border-white">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <label htmlFor="lastName" className="text-xs font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase flex items-center gap-2">
                      <span>03 /</span>
                      <span className="font-serif italic font-normal text-stone-900 dark:text-stone-100 text-sm normal-case">{t.lastNameLabel}</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      placeholder={t.lastNamePlaceholder}
                      className="w-full sm:w-[55%] bg-transparent border-none outline-none p-0 text-base font-bold text-stone-950 dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-700 placeholder:font-serif placeholder:italic placeholder:font-normal"
                    />
                  </div>
                </div>

              </div>

              {/* Field 04: Message */}
              <div className="group relative border-b border-stone-200 dark:border-stone-900 pb-3 transition-colors duration-300 focus-within:border-stone-955 dark:focus-within:border-white">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <label htmlFor="message" className="text-xs font-mono tracking-widest text-stone-400 dark:text-stone-500 uppercase flex items-center gap-2">
                      <span>04 /</span>
                      <span className="font-serif italic font-normal text-stone-900 dark:text-stone-100 text-sm normal-case">{t.messageLabel}</span>
                    </label>
                    <span className="text-[10px] font-mono tracking-widest text-stone-400 dark:text-stone-500">
                      {charCount} CAP
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    rows={4}
                    placeholder={t.messagePlaceholder}
                    className="w-full bg-transparent border-none outline-none p-0 text-base font-bold text-stone-950 dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-700 placeholder:font-serif placeholder:italic placeholder:font-normal resize-none"
                  />
                </div>
              </div>

              {/* Submit Dispatch Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Trilingual badge note */}
                <div className="flex gap-2">
                  {['EN', '中文', 'MM'].map((lang) => (
                    <span key={lang} className="text-[9px] font-mono border border-stone-200 dark:border-stone-850 px-2 py-0.5 rounded text-stone-400">
                      {lang}
                    </span>
                  ))}
                  <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider">
                    MULTILINGUAL CONNECTOR
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white bg-stone-950 dark:bg-white dark:text-stone-955 hover:opacity-90 transform active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      TRANSMITTING...
                    </>
                  ) : (
                    <>
                      <span>{t.sendMessage}</span>
                      <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Alert Notification */}
              {submitStatus !== 'idle' && (
                <div className={`p-4 rounded-xl text-center font-bold animate-fade-in border text-xs tracking-wider uppercase
                  ${submitStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 border-rose-500/20'
                  }`}>
                  {submitMessage}
                </div>
              )}

            </form>

            {/* Direct Connect Quick Avenues */}
            <div className="border-t border-stone-200 dark:border-stone-900 pt-8 flex flex-wrap gap-x-8 gap-y-4 text-xs font-mono order-5 lg:order-none">
              <a 
                href="https://www.linkedin.com/in/shainwaiyan/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-400 dark:text-stone-500 hover:text-[#191970] dark:hover:text-[#ffd700] transition-colors"
              >
                <FaLinkedin /> LINKEDIN
              </a>
              <a 
                href="https://github.com/Shain-Wai-Yan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-400 dark:text-stone-500 hover:text-[#191970] dark:hover:text-[#ffd700] transition-colors"
              >
                <FaGithub /> GITHUB
              </a>
              <a 
                href="mailto:contact@shainwaiyan.com"
                className="flex items-center gap-2 text-stone-400 dark:text-stone-500 hover:text-[#191970] dark:hover:text-[#ffd700] transition-colors"
              >
                <FaEnvelope /> contact@shainwaiyan.com
              </a>
            </div>

          </div>

          {/* ── RIGHT COLUMN: The Interactive Shattered-Glass Reflective Collage Canvas ── */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-5 relative w-full aspect-square md:aspect-[4/5] lg:aspect-[3/4] overflow-hidden order-2 lg:order-none"
            style={{
              background: 'linear-gradient(145deg, #faf9f6 0%, #f4f3ef 35%, #e9e7e2 70%, #dcdad0 100%)',
            }}
          >
            {/* Dark mode gradient override */}
            <div className="absolute inset-0 dark:block hidden" style={{ background: 'linear-gradient(145deg, #111827 0%, #0f172a 40%, #0c1220 70%, #080d18 100%)' }} />

            {/* ── Thick outer border frame ── */}
            <div className="absolute inset-0 border-2 border-stone-300/40 dark:border-stone-600/60 pointer-events-none z-30" />

            {/* ── Inner inset border rule (8px gap from outer) ── */}
            <div className="absolute inset-[7px] border border-stone-300/20 dark:border-stone-600/20 pointer-events-none z-30" />

            {/* ── Scanline texture overlay (premium print feel) ── */}
            <div 
              className="absolute inset-0 pointer-events-none z-30 opacity-[0.015] dark:opacity-[0.06]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,1) 3px, rgba(0,0,0,1) 4px)' }}
            />

            {/* ── Blueprint cross-rule grid lines ── */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-stone-400/10 dark:bg-stone-400/5 pointer-events-none z-20" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-stone-400/10 dark:bg-stone-400/5 pointer-events-none z-20" />
            <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-stone-400/6 dark:bg-stone-400/3 pointer-events-none z-20" />
            <div className="absolute left-3/4 top-0 bottom-0 w-[1px] bg-stone-400/6 dark:bg-stone-400/3 pointer-events-none z-20" />

            {/* ── Corner bracket accents (precision editorial tick marks) ── */}
            {/* Top-Left */}
            <div className="absolute top-[14px] left-[14px] z-40 pointer-events-none">
              <div className="w-5 h-[1.5px] bg-stone-400/40 dark:bg-stone-300/60" />
              <div className="w-[1.5px] h-5 bg-stone-400/40 dark:bg-stone-300/60 mt-0" />
            </div>
            {/* Top-Right */}
            <div className="absolute top-[14px] right-[14px] z-40 pointer-events-none flex flex-col items-end">
              <div className="w-5 h-[1.5px] bg-stone-400/40 dark:bg-stone-300/60" />
              <div className="w-[1.5px] h-5 bg-stone-400/40 dark:bg-stone-300/60 self-end" />
            </div>
            {/* Bottom-Left */}
            <div className="absolute bottom-[14px] left-[14px] z-40 pointer-events-none flex flex-col justify-end">
              <div className="w-[1.5px] h-5 bg-stone-400/40 dark:bg-stone-300/60" />
              <div className="w-5 h-[1.5px] bg-stone-400/40 dark:bg-stone-300/60" />
            </div>
            {/* Bottom-Right */}
            <div className="absolute bottom-[14px] right-[14px] z-40 pointer-events-none flex flex-col items-end justify-end">
              <div className="w-[1.5px] h-5 bg-stone-400/40 dark:bg-stone-300/60 self-end" />
              <div className="w-5 h-[1.5px] bg-stone-400/40 dark:bg-stone-300/60" />
            </div>

            {/* ── Header editorial meta strip ── */}
            <div className="absolute top-0 left-0 right-0 h-[32px] border-b border-stone-300/20 dark:border-stone-600/30 flex items-center justify-between px-5 z-40 pointer-events-none">
              <span className="text-[8px] font-mono tracking-[0.28em] text-stone-400 dark:text-stone-550 uppercase">FIG.01 &nbsp;/&nbsp; OD-2026</span>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[8px] font-mono tracking-[0.28em] text-stone-400 dark:text-stone-550 uppercase">PLATE&nbsp;Nº&nbsp;08</span>
              </div>
            </div>

            {/* ── Bottom editorial caption strip ── */}
            <div className="absolute bottom-0 left-0 right-0 h-[32px] border-t border-stone-300/20 dark:border-stone-600/30 flex items-center justify-between px-5 z-40 pointer-events-none">
              <span className="text-[8px] font-mono tracking-[0.28em] text-stone-400 dark:text-stone-550 uppercase">SHATTERED&nbsp;MATRIX&nbsp;&bull;&nbsp;VOL.01</span>
              <span className="text-[8px] font-mono tracking-[0.28em] text-[#191970]/50 dark:text-[#ffd700]/50 uppercase font-bold">SYNTHESIS</span>
            </div>

            {/* ── Left ruled margin bar ── */}
            <div className="absolute top-[32px] bottom-[32px] left-[36px] w-[1px] border-l border-dashed border-stone-300/20 dark:border-stone-600/15 pointer-events-none z-20" />
            {/* ── Right ruled margin bar ── */}
            <div className="absolute top-[32px] bottom-[32px] right-[36px] w-[1px] border-r border-dashed border-stone-300/20 dark:border-stone-600/15 pointer-events-none z-20" />

            {/* Collage Center Canvas Area */}
            <div className="relative w-full h-full flex items-center justify-center pt-[32px] pb-[32px]">

              {/* ── Dramatic editorial background: sharp-cornered gradient block ── */}
              <div
                className="absolute inset-x-10 inset-y-4 pointer-events-none"
                style={{
                  background: 'linear-gradient(160deg, rgba(224,91,62,0.10) 0%, rgba(200,70,43,0.04) 40%, rgba(25,25,112,0.03) 70%, rgba(10,10,64,0.06) 100%)',
                }}
              />
              <div className="absolute inset-0 dark:block hidden pointer-events-none inset-x-10 inset-y-4"
                style={{
                  background: 'linear-gradient(160deg, rgba(25,25,112,0.25) 0%, rgba(10,10,64,0.12) 40%, rgba(224,91,62,0.08) 70%, rgba(200,70,43,0.18) 100%)',
                }}
              />

              {/* ── The Masterpiece 10-Shard Refined Glass-Shattered Frame ── */}
              <div className="relative w-[80%] h-[90%] select-none">
                
                {/* ── Layer 1: Base Medusa Statue (Normal full-size bust centered in background) ── */}
                <div 
                  ref={baseMedusaRef}
                  className="absolute inset-0 w-full h-full select-none"
                >
                  <Image
                    src="/images/statue_medusa.png"
                    alt="Base Medusa Statue Bust"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>

                {/* ── Layer 2: Apollo Shard 1 (Serene Eye & Brow - Box Cut, Center-Left) ── */}
                <div 
                  ref={apolloRift1Ref}
                  style={{ 
                    clipPath: 'polygon(24% 18%, 44% 14%, 38% 46%, 18% 50%)',
                    filter: 'var(--contact-shard-shadow-apollo)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none overflow-hidden"
                >
                  <Image
                    src="/images/statue_apollo.png"
                    alt="Apollo Eye Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain -translate-x-[14%] scale-105"
                    priority
                  />
                </div>

                {/* ── Layer 3: Apollo Shard 2 (Lips & Chin - Box Cut, Lower Center-Left) ── */}
                <div 
                  ref={apolloRift2Ref}
                  style={{ 
                    clipPath: 'polygon(20% 54%, 40% 50%, 36% 76%, 16% 80%)',
                    filter: 'var(--contact-shard-shadow-apollo)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none overflow-hidden"
                >
                  <Image
                    src="/images/statue_apollo.png"
                    alt="Apollo Lips Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain -translate-x-[14%] scale-105"
                    priority
                  />
                </div>

                {/* ── Layer 4: Apollo Shard 3 (Curls/Hair - Elegant Triangle, Upper Left) ── */}
                <div 
                  ref={apolloRift3Ref}
                  style={{ 
                    clipPath: 'polygon(6% 12%, 26% 8%, 18% 34%)',
                    filter: 'var(--contact-shard-shadow-apollo)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none overflow-hidden"
                >
                  <Image
                    src="/images/statue_apollo.png"
                    alt="Apollo Curls Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain -translate-x-[14%] scale-105"
                    priority
                  />
                </div>

                {/* ── Layer 5: Apollo Shard 4 (Upper Shoulder/Arm - Slanted Box on Far Left) ── */}
                <div 
                  ref={apolloRift4Ref}
                  style={{ 
                    clipPath: 'polygon(6% 56%, 26% 52%, 22% 68%, 5% 70%)',
                    filter: 'var(--contact-shard-shadow-apollo)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none overflow-hidden"
                >
                  <Image
                    src="/images/statue_apollo.png"
                    alt="Apollo Upper Shoulder Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain -translate-x-[14%] scale-105"
                    priority
                  />
                </div>

                {/* ── Layer 6: Apollo Shard 5 (Lower Shoulder/Arm - Sharp Canted Triangle - Pedestal Stand Deleted!) ── */}
                <div 
                  ref={apolloRift5Ref}
                  style={{ 
                    clipPath: 'polygon(5% 72%, 24% 70%, 14% 75%)',
                    filter: 'var(--contact-shard-shadow-apollo)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none overflow-hidden"
                >
                  <Image
                    src="/images/statue_apollo.png"
                    alt="Apollo Lower Shoulder Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain -translate-x-[14%] scale-105"
                    priority
                  />
                </div>

                {/* ── Layer 7: Apollo Shard 6 (Crossover Shoulder - Placed Bottom-Right-Center - Pedestal Stand Deleted!) ── */}
                <div 
                  ref={apolloRift6Ref}
                  style={{ 
                    clipPath: 'polygon(48% 62%, 74% 58%, 66% 77%)',
                    filter: 'var(--contact-shard-shadow-apollo)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none overflow-hidden"
                >
                  <Image
                    src="/images/statue_apollo.png"
                    alt="Apollo Drape Crossover Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain -translate-x-[14%] scale-105"
                    priority
                  />
                </div>

                {/* ── Layer 8: Athena Shard 1 (strategic Helmet - Box Cut, Upper Center-Right) ── */}
                <div 
                  ref={athenaRift1Ref}
                  style={{ 
                    clipPath: 'polygon(54% 8%, 76% 12%, 70% 38%, 48% 34%)',
                    filter: 'var(--contact-shard-shadow-athena)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none"
                >
                  <Image
                    src="/images/statue_athena.png"
                    alt="Athena Helmet Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain"
                    priority
                  />
                </div>

                {/* ── Layer 9: Athena Shard 2 (Serene Face & Eye - Box Cut, Center-Right) ── */}
                <div 
                  ref={athenaRift2Ref}
                  style={{ 
                    clipPath: 'polygon(52% 42%, 74% 38%, 68% 68%, 46% 72%)',
                    filter: 'var(--contact-shard-shadow-athena)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-15 pointer-events-none"
                >
                  <Image
                    src="/images/statue_athena.png"
                    alt="Athena Eye/Face Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain"
                    priority
                  />
                </div>

                {/* ── Layer 10: Athena Shard 3 (Collar & Helmet Spine - Elegant Triangle, Upper Right) ── */}
                <div 
                  ref={athenaRift3Ref}
                  style={{ 
                    clipPath: 'polygon(76% 42%, 94% 48%, 84% 68%)',
                    filter: 'var(--contact-shard-shadow-athena)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none"
                >
                  <Image
                    src="/images/statue_athena.png"
                    alt="Athena Collar Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain"
                    priority
                  />
                </div>

                {/* ── Layer 11: Athena Shard 4 (Crossover Shoulder - Placed Bottom-Left-Center, displaying Athena) ── */}
                <div 
                  ref={athenaRift4Ref}
                  style={{ 
                    clipPath: 'polygon(16% 82%, 42% 78%, 34% 96%)',
                    filter: 'var(--contact-shard-shadow-athena)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-350 ease-out z-10 pointer-events-none"
                >
                  <Image
                    src="/images/statue_athena.png"
                    alt="Athena Breastplate Crossover Shard"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-contain"
                    priority
                  />
                </div>

                {/* ── Layer 12: Empty Glossy Glare Shard 1 (Top Left Margin Glare) ── */}
                <div 
                  ref={glareShard1Ref}
                  style={{ 
                    clipPath: 'polygon(5% 42%, 22% 32%, 12% 58%)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-300 ease-out z-20 pointer-events-none backdrop-blur-[2.5px] bg-white/10 dark:bg-white/5 border border-white/30 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                />

                {/* ── Layer 13: Empty Glossy Glare Shard 2 (Bottom Right Margin Glare) ── */}
                <div 
                  ref={glareShard2Ref}
                  style={{ 
                    clipPath: 'polygon(82% 48%, 95% 62%, 86% 75%)'
                  }}
                  className="absolute inset-0 w-full h-full transition-all duration-300 ease-out z-20 pointer-events-none backdrop-blur-[2px] bg-white/10 dark:bg-white/5 border border-white/30 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                />

              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
