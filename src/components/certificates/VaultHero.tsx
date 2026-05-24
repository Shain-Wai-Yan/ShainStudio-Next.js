'use client';

import { useState, useRef, useEffect } from 'react';
import CImage from '@/components/ui/CImage';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { gsap } from '@/lib/gsapSetup';

interface FeaturedCertificate {
  id: number;
  title: string;
  issuedBy: string;
  imageUrl: string;
  formattedDate: string;
}

interface VaultHeroProps {
  certificates: FeaturedCertificate[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  onCardClick: (id: number) => void;
}

export function VaultHero({ certificates, dictionary, onCardClick }: VaultHeroProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState(1); // Default highlight index

  // 3D Parallax Mouse Move Listener
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const artwork = artworkRef.current;
    if (!artwork) return;

    const rect = artwork.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalize coordinates from -0.5 to 0.5
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  // GSAP reveal animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in background grid & details
      gsap.fromTo(
        '.editorial-grid-line',
        { opacity: 0 },
        { opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power2.out' }
      );

      // Slide in main vertical sidebar bands
      gsap.fromTo(
        '.vertical-brand-band',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 0.5, duration: 1.5, stagger: 0.2, ease: 'power3.out' }
      );

      // Elegant typographic reveal
      gsap.fromTo(
        '.editorial-reveal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
      );

      // Artwork and its collage overlays fade-in zoom
      gsap.fromTo(
        artworkRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Compute 3D rotations based on mouse coordinate vectors
  const rotateX = isHovered ? coords.y * -15 : 0;
  const rotateY = isHovered ? coords.x * 15 : 0;

  const t = dictionary.certificate;

  // Modern Neoclassical Menu List Items
  const menuItems = [
    { num: '01', key: 'FOUNDATIONS', label: t.foundations || 'FOUNDATIONS' },
    { num: '02', key: 'MASTERIES', label: t.masteries || 'MASTERIES' },
    { num: '03', key: 'CREATIVES', label: t.creatives || 'CREATIVES' },
    { num: '04', key: 'EXPERTISE', label: t.expertise || 'EXPERTISE' },
  ];

  const topCert = certificates[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-16 md:py-24 lg:py-28 bg-white dark:bg-gray-950 border-b border-stone-200 dark:border-stone-900 transition-colors duration-500"
    >
      {/* Background Plaster Noise Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] bg-repeat pointer-events-none bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=20')]" />

      {/* Modern Technical Blueprint Grid Lines */}
      <div className="absolute inset-x-0 top-12 h-[1px] bg-stone-900/10 dark:bg-stone-100/5 editorial-grid-line pointer-events-none" />
      <div className="absolute inset-x-0 bottom-12 h-[1px] bg-stone-900/10 dark:bg-stone-100/5 editorial-grid-line pointer-events-none" />
      <div className="absolute left-[8%] inset-y-0 w-[1px] bg-stone-900/10 dark:bg-stone-100/5 editorial-grid-line pointer-events-none hidden md:block" />
      <div className="absolute right-[8%] inset-y-0 w-[1px] bg-stone-900/10 dark:bg-stone-100/5 editorial-grid-line pointer-events-none hidden md:block" />

      {/* Far Left Edge: Vertical Branding Strip */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 [writing-mode:vertical-lr] rotate-180 text-[10px] font-bold tracking-[0.3em] uppercase text-stone-500/60 dark:text-stone-400/40 select-none vertical-brand-band hidden xl:block">
        SKILLS &bull; SYSTEMS &bull; CREDENTIALS &bull; ERAS
      </div>

      {/* Far Right Edge: Vertical Branding Strip */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 [writing-mode:vertical-lr] text-[10px] font-bold tracking-[0.3em] uppercase text-stone-500/60 dark:text-stone-400/40 select-none vertical-brand-band hidden xl:block">
        SHAIN WAI YAN &mdash; ISSUE N&deg; 26 &mdash; NEOCLASSICAL STUDIO
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: Premium Editorial Typography & Details */}
          <div ref={leftTextRef} className="lg:col-span-7 space-y-8 text-left">
            
            {/* Coral/Terracotta Pulsing Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e05b3e]/10 dark:bg-[#e05b3e]/20 border border-[#e05b3e]/20 dark:border-[#e05b3e]/30 shadow-sm backdrop-blur-sm editorial-reveal select-none">
              <span className="w-2 h-2 rounded-full bg-[#e05b3e] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#e05b3e] uppercase">
                {t.labels.heroBadge || '• THE CREDENTIAL VAULT'}
              </span>
            </div>

            {/* Technical Sub-heading and Issue stamp */}
            <div className="flex items-center gap-3 editorial-reveal select-none">
              <span className="text-[11px] font-bold text-[#e05b3e] tracking-widest uppercase">
                &mdash; SHAIN WAI YAN
              </span>
              <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                {t.labels.heroStamp || 'N° 01 / PRES.ERA'}
              </span>
            </div>

            {/* Beautiful neoclassical high-contrast mixed headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-stone-900 dark:text-white font-sans editorial-reveal">
              {t.labels.heroHeadlinePart1 || 'Sculpting'}{' '}
              <span className="font-serif italic font-normal text-stone-700 dark:text-stone-300">
                {t.labels.heroHeadlinePart2 || 'Credentials'}
              </span>,<br />
              {t.labels.heroHeadlinePart3 || 'curated in'}{' '}
              <span className="font-serif italic font-normal text-stone-700 dark:text-stone-300">
                {t.labels.heroHeadlinePart4 || 'Prestige'}
              </span>.
            </h1>

            {/* Clean editorial paragraph with generous spacing */}
            <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg max-w-2xl font-normal leading-relaxed font-sans editorial-reveal">
              {t.labels.heroDescription || 
                "An artistic visual shelf showcasing verified technical certifications, cloud architecture masteries, and premium corporate achievements solo-engineered with absolute digital precision."}
            </p>

            {/* Interactive Spotlight Preview Widget */}
            {topCert && (
              <div className="editorial-reveal pt-4">
                <div 
                  onClick={() => onCardClick(topCert.id)}
                  className="group inline-flex items-center gap-6 p-4 md:p-5 rounded-2xl cursor-pointer bg-white/70 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800/80 backdrop-blur-md hover:border-[#e05b3e]/40 hover:bg-white dark:hover:bg-stone-900 transition-all duration-500 shadow-md hover:shadow-xl select-none"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden relative border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex-shrink-0 flex items-center justify-center p-0.5">
                    <CImage 
                      src={topCert.imageUrl}
                      alt={topCert.title}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="64px"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#e05b3e] uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      LATEST FEATURED PRESTIGE
                    </span>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm md:text-base line-clamp-1 leading-snug group-hover:text-[#e05b3e] transition-colors duration-300">
                      {topCert.title}
                    </h4>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-bold m-0 p-0">
                      {topCert.issuedBy} &bull; {topCert.formattedDate}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center bg-stone-50 dark:bg-stone-900 group-hover:bg-[#e05b3e] group-hover:border-[#e05b3e] transition-all duration-500 flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-stone-400 dark:text-stone-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Breathtaking Neoclassical Artwork Collage */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end select-none">
            <div 
              ref={artworkRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: isHovered ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full max-w-[420px] aspect-[1/1] rounded-2xl overflow-visible bg-[#f5f2eb] dark:bg-stone-900/50 p-4 border border-stone-300/40 dark:border-stone-800/60 shadow-[0_30px_70px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_90px_rgba(0,0,0,0.5)] group"
            >
              {/* Inner Luxury Double border frame */}
              <div className="absolute inset-2 rounded-xl border border-stone-400/20 dark:border-stone-700/20 pointer-events-none" />
              <div className="absolute inset-3 rounded-lg border-2 border-double border-[#e05b3e]/20 pointer-events-none" />

              {/* Technical Blueprint Coordinates & Text */}
              <div className="absolute top-5 left-5 text-[8px] font-mono tracking-widest text-stone-400 dark:text-stone-600">
                FIG. 01 / OD-26
              </div>
              <div className="absolute top-5 right-5 text-[8px] font-mono tracking-widest text-stone-400 dark:text-stone-600">
                PLATE N&deg; 08
              </div>
              <div className="absolute bottom-5 left-5 text-[8px] font-mono tracking-widest text-stone-400 dark:text-stone-600">
                SHA - a1b2c3d
              </div>
              <div className="absolute bottom-5 right-5 text-[8px] font-mono tracking-widest text-stone-400 dark:text-stone-600 text-right">
                COMPOSITION
              </div>

              {/* The Spectacular Statue Collage Image */}
              <div 
                style={{ transform: 'translateZ(30px)' }}
                className="relative w-full h-full rounded-lg overflow-hidden shadow-inner border border-stone-300/60 dark:border-stone-900/80 bg-white dark:bg-stone-950"
              >
                <CImage
                  src="/images/neoclassical_statue_collage.png"
                  alt="Neoclassical Greek Marble Bust Collage Artwork"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="450px"
                  priority
                />
              </div>

              {/* Floating Vertical Steps/Menu Overlay (Exactly like Reference Design) */}
              <div 
                style={{ transform: 'translateZ(50px)' }}
                className="absolute right-[-24px] md:right-[-48px] top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-3 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-[0_15px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md"
              >
                {menuItems.map((item, index) => {
                  const isActive = activeMenuIndex === index;
                  return (
                    <div
                      key={item.key}
                      onMouseEnter={() => setActiveMenuIndex(index)}
                      className={`
                        flex items-center gap-2.5 px-3.5 py-2 rounded-lg cursor-pointer transition-all duration-300
                        ${isActive 
                          ? 'bg-[#e05b3e] text-white shadow-md shadow-[#e05b3e]/20 scale-105' 
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500'
                        }
                      `}
                    >
                      <span className={`
                        text-[9px] font-bold tracking-widest font-mono
                        ${isActive ? 'text-white/80' : 'text-[#e05b3e]/60 dark:text-[#e05b3e]/40'}
                      `}>
                        {item.num}
                      </span>
                      <span className={`
                        text-[9px] font-extrabold tracking-[0.25em] uppercase font-sans
                        ${isActive ? 'text-white' : 'text-stone-700 dark:text-stone-300'}
                      `}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Decorative Corner Grid Accents (Crosshair lines) */}
              <div className="absolute top-[-8px] left-[-8px] w-6 h-6 border-t-2 border-l-2 border-[#e05b3e]/30 pointer-events-none" />
              <div className="absolute top-[-8px] right-[-8px] w-6 h-6 border-t-2 border-r-2 border-[#e05b3e]/30 pointer-events-none" />
              <div className="absolute bottom-[-8px] left-[-8px] w-6 h-6 border-b-2 border-l-2 border-[#e05b3e]/30 pointer-events-none" />
              <div className="absolute bottom-[-8px] right-[-8px] w-6 h-6 border-b-2 border-r-2 border-[#e05b3e]/30 pointer-events-none" />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
