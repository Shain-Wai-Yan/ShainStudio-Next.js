import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { FaGlobe, FaLaptopCode, FaLightbulb } from 'react-icons/fa';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import MarTechStack from '@/components/MarTechStack';
import ScrollAnimator from '@/components/ScrollAnimator';

interface AboutProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const domain = 'https://www.shainwaiyan.com';
  const urlPath = locale === 'zh' ? '/zh/about' : '/about';
  const baseUrl = `${domain}${urlPath}`;

  const fullText = t.aboutPage.myStoryText;
  const description = fullText.length > 155 
    ? fullText.substring(0, 155).replace(/\s+\S*$/, '') + '...' 
    : fullText;

  const title = `${t.aboutPage.myName} - ${t.aboutPage.heroSubtitle}`;

  return {
    title,
    description,
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${domain}/about`,
        zh: `${domain}/zh/about`,
        'x-default': `${domain}/about`,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      type: 'profile',
      firstName: 'Shain',
      lastName: 'Wai Yan',
      username: 'xolbine',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' }
  ];
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;

  const calculateAge = () => {
    const birthDate = new Date(2002, 5, 20);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasBirthdayOccurred =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!hasBirthdayOccurred) age--;
    return age;
  };

  return (
    <main className="bg-background dark:bg-[#0a0a0a] min-h-screen text-text dark:text-gray-200">
      <ScrollAnimator />
      
      {/* ── Premium Hero ── */}
      <div className="relative w-full overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 px-4 bg-[#191970] dark:bg-gradient-to-br dark:from-[#d4af37] dark:via-[#c19b2e] dark:to-[#8a7322] border-none shadow-lg">
         {/* Detail/Texture overlay */}
         <div className="absolute inset-0 bg-black/5 dark:bg-black/10 mix-blend-overlay pointer-events-none" />
         
         <div className="max-w-7xl mx-auto flex flex-col items-center text-center animate-fade-in-down relative z-10">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-secondary text-white dark:text-white tracking-tighter mb-8 max-w-4xl leading-tight drop-shadow-md">
              {t.aboutPage.heroTitle} <span className="text-[#ffd700] dark:text-[#191970] italic font-light">{t.aboutPage.heroTitleHighlight}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 dark:text-white drop-shadow-sm font-primary max-w-2xl mx-auto font-medium leading-relaxed">
              {t.aboutPage.heroSubtitle}
            </p>
         </div>
      </div>

      {/* ── Main Layout Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative items-start">
          
          {/* ── LEFT: Sticky Sidebar (Profile) ── */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="relative rounded-[2.5rem] p-[1px] bg-gradient-to-b from-gray-200 to-transparent dark:from-white/15 dark:to-transparent shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden group">
               {/* Inner Card */}
               <div className="bg-white/90 dark:bg-[#0a0f1a]/95 backdrop-blur-2xl rounded-[calc(2.5rem-1px)] p-8 md:p-10 relative z-10 h-full overflow-hidden">
                  
                  {/* Subtle Top Glow */}
                  <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-accent/5 dark:from-accent/10 to-transparent pointer-events-none" />

                  {/* Profile Image */}
                  <div className="relative w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden border-[3px] border-white dark:border-[#1a2542] shadow-lg group-hover:shadow-[0_0_30px_rgba(212,175,55,0.25)] transition-all duration-500 z-10">
                    <Image
                      src="/images/profile.avif"
                      alt={t.aboutPage.profileAltText}
                      fill
                      sizes="192px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>

                  <div className="text-center mb-8 relative z-10 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-primary dark:text-white font-secondary mb-1 tracking-tight">
                      {t.aboutPage.myName}
                    </h2>
                    <div className="text-[#ffd700] dark:text-white font-primary font-medium text-sm tracking-[0.1em] uppercase mt-2 flex flex-col items-center gap-1">
                       <span>{t.aboutPage.alsoKnownAs.split('|')[0]?.trim()}</span>
                       <span>{t.aboutPage.alsoKnownAs.split('|')[1]?.trim()}</span>
                    </div>
                  </div>

                  {/* Personal Info List */}
                  <ul className="flex flex-col font-primary text-sm relative z-10 text-left bg-gray-50/50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100/50 dark:border-white/5 space-y-4">
                    <li className="flex flex-col gap-1.5 pb-4 border-b border-gray-200/50 dark:border-white/10 transition-transform duration-300 hover:translate-x-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t.aboutPage.ageLabel}</span>
                      <strong className="text-primary dark:text-white text-base font-semibold">{calculateAge()} {t.aboutPage.ageValueSuffix}</strong>
                    </li>
                    <li className="flex flex-col gap-1.5 pb-4 border-b border-gray-200/50 dark:border-white/10 transition-transform duration-300 hover:translate-x-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t.aboutPage.completedLabel}</span>
                      <strong className="text-primary dark:text-white text-base font-semibold">{t.aboutPage.completedValue}</strong>
                    </li>
                    <li className="flex flex-col gap-1.5 pb-4 border-b border-gray-200/50 dark:border-white/10 transition-transform duration-300 hover:translate-x-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t.aboutPage.educationLabel}</span>
                      <strong className="text-primary dark:text-white text-base font-semibold leading-snug">{t.aboutPage.educationValue1}</strong>
                      <span className="text-[#ffd700] dark:text-white/70">{t.aboutPage.educationValue2}</span>
                    </li>
                    <li className="flex flex-col gap-2 pt-1 transition-transform duration-300 hover:translate-x-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{t.aboutPage.certificatesLabel}</span>
                      <div className="flex flex-col gap-3">
                         <span className="text-primary dark:text-white font-medium text-sm flex items-start gap-3">
                           <span className="text-[#ffd700] dark:text-white/50 text-lg leading-none mt-[-1px]">•</span> {t.aboutPage.certificate1}
                         </span>
                         <span className="text-primary dark:text-white font-medium text-sm flex items-start gap-3">
                           <span className="text-[#ffd700] dark:text-white/50 text-lg leading-none mt-[-1px]">•</span> {t.aboutPage.certificate2}
                         </span>
                      </div>
                    </li>
                  </ul>

                  {/* Quote Box */}
                  <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 relative z-10">
                     <p className="italic text-text dark:text-gray-300 font-secondary text-lg leading-relaxed mb-6 text-center">
                       &quot;{t.aboutPage.quoteText}&quot;
                     </p>
                     <p className="text-center font-bold text-[#ffd700] dark:text-white text-xs tracking-[0.2em] uppercase">
                       — {t.aboutPage.quoteAuthor}
                     </p>
                  </div>
               </div>
            </div>
          </div>

          {/* ── RIGHT: Scrolling Content ── */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* Motto Section */}
            <section className="animate-on-scroll">
              <span className="text-sm font-bold text-[#ffd700] dark:text-white tracking-[0.2em] uppercase font-secondary mb-6 block">
                My Motto
              </span>
              <div className="relative pl-6 border-l-4 border-[#ffd700] dark:border-[#d4af37] mb-4">
                <h3 className="text-4xl md:text-5xl font-secondary font-bold text-primary dark:text-white tracking-tight leading-tight" lang="zh">
                  {t.aboutPage.motto}
                </h3>
                <p className="mt-3 text-base md:text-lg text-text-light dark:text-gray-400 font-primary italic font-light">
                  {t.aboutPage.mottoTranslation}
                </p>
              </div>
            </section>

            {/* Story Section */}
            <section className="animate-on-scroll">
              <h2 className="text-sm font-bold text-[#ffd700] dark:text-white tracking-[0.2em] uppercase font-secondary mb-4">
                {t.aboutPage.myStoryHeading}
              </h2>
              
              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-text-light dark:prose-p:text-gray-400 prose-p:font-light">
                <p>
                  {t.aboutPage.myStoryText}
                </p>
              </div>
            </section>

            {/* Skills Bento Section */}
            <section className="animate-on-scroll">
              <h2 className="text-sm font-bold text-[#ffd700] dark:text-white tracking-[0.2em] uppercase font-secondary mb-10">
                {t.aboutPage.whatIBringHeading}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: FaGlobe, title: t.aboutPage.trilingualTitle, desc: t.aboutPage.trilingualDesc },
                  { icon: FaLaptopCode, title: t.aboutPage.digitalSkillsTitle, desc: t.aboutPage.digitalSkillsDesc },
                  { icon: FaLightbulb, title: t.aboutPage.curiosityTitle, desc: t.aboutPage.curiosityDesc }
                ].map((skill, idx) => (
                  <div key={idx} className={`bg-white dark:bg-[#111111] rounded-3xl p-8 border border-gray-100 dark:border-white/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(255,255,255,0.03)] hover:border-[#d4af37]/30 dark:hover:border-[#d4af37]/30 group ${idx === 2 ? 'md:col-span-2' : ''}`}>
                     <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary dark:text-white text-xl mb-6 shadow-sm group-hover:bg-gradient-to-br group-hover:from-[#d4af37] group-hover:to-[#c19b2e] group-hover:text-white dark:group-hover:text-white transition-all duration-300">
                        <skill.icon />
                     </div>
                     <h4 className="text-xl font-bold font-secondary text-primary dark:text-white mb-3">
                       {skill.title}
                     </h4>
                     <p className="text-text-light dark:text-gray-400 font-primary text-sm leading-relaxed font-light">
                       {skill.desc}
                     </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Journey Timeline */}
            <section className="animate-on-scroll">
               <h2 className="text-sm font-bold text-[#ffd700] dark:text-white tracking-[0.2em] uppercase font-secondary mb-12">
                {t.aboutPage.myJourneyHeading}
              </h2>

              <div className="relative pl-8 md:pl-10 border-l border-gray-200 dark:border-white/10 space-y-16">
                  {[
                    { year: t.aboutPage.timeline1Year, title: t.aboutPage.timeline1Title, desc: t.aboutPage.timeline1Desc },
                    { year: t.aboutPage.timeline2Year, title: t.aboutPage.timeline2Title, desc: t.aboutPage.timeline2Desc },
                    { year: t.aboutPage.timeline3Year, title: t.aboutPage.timeline3Title, desc: t.aboutPage.timeline3Desc },
                    { year: t.aboutPage.timeline4Year, title: t.aboutPage.timeline4Title, desc: t.aboutPage.timeline4Desc },
                    { year: t.aboutPage.timeline5Year, title: t.aboutPage.timeline5Title, desc: t.aboutPage.timeline5Desc },
                    { year: t.aboutPage.timeline6Year, title: t.aboutPage.timeline6Title, desc: t.aboutPage.timeline6Desc },
                  ].map((item, idx) => (
                    <div key={idx} className="relative group">
                      
                      {/* Timeline Dot */}
                      <span className="absolute -left-[45px] top-1.5 w-3 h-3 rounded-full bg-gray-300 dark:bg-white/20 border-[3px] border-background dark:border-[#0a0a0a] group-hover:bg-[#ffd700] dark:group-hover:bg-white group-hover:scale-[1.5] group-hover:shadow-[0_0_12px_rgba(255,215,0,0.6)] dark:group-hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all duration-300" />
                      
                      {/* Content */}
                      <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-3">
                          <span className="text-[#ffd700] dark:text-white font-bold text-sm tracking-wider font-secondary flex-shrink-0">
                            {item.year}
                          </span>
                          <h4 className="text-xl font-bold font-secondary text-primary dark:text-white">
                            {item.title}
                          </h4>
                      </div>
                      <p className="text-text-light dark:text-gray-400 font-primary text-base leading-relaxed font-light">
                        {item.desc}
                      </p>

                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Mar-Tech Stack ── */}
      <div className="animate-on-scroll">
         <MarTechStack language={locale} />
      </div>

      {/* ── Redesigned CTA ── */}
      <section className="relative my-12 mx-4 md:mx-auto max-w-7xl overflow-hidden rounded-[2.5rem]">
        {/* Background */}
        <div className="absolute inset-0 bg-[#191970] dark:bg-[#0d0d1a] z-0" />
        {/* Gold accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-20" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#d4af37]/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 left-1/4 w-[400px] h-[300px] bg-white/5 rounded-full blur-[80px]" />
        </div>

        {/* Inner content — split layout on desktop */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">

          {/* LEFT: Text block */}
          <div className="flex flex-col justify-center px-10 py-16 md:py-20 md:pl-14 md:pr-8">
            <span className="text-[#d4af37] text-xs tracking-[0.25em] uppercase font-bold font-secondary mb-5 block">{t.aboutPage.ctaKicker}</span>
            <h2 className="text-4xl md:text-5xl font-bold font-secondary text-white tracking-tight leading-[1.1] mb-6">
              {t.aboutPage.ctaTitle}
            </h2>
            <p className="text-gray-300 dark:text-gray-400 font-primary text-base leading-relaxed max-w-sm">
              {t.aboutPage.ctaDesc}
            </p>
          </div>

          {/* RIGHT: Action block */}
          <div className="flex flex-col items-center justify-center px-10 py-16 md:py-20 border-t md:border-t-0 md:border-l border-white/10 gap-6">
            <Link
              href={`${basePath}/contact`}
              className="w-full max-w-xs text-center bg-gradient-to-r from-[#d4af37] to-[#c19b2e] text-[#191970] font-bold font-secondary text-lg py-4 px-10 rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_4px_24px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_36px_rgba(212,175,55,0.55)]"
            >
              {t.aboutPage.ctaButton} →
            </Link>
            <p className="text-white/40 text-xs font-primary tracking-wider text-center">{t.aboutPage.ctaFooter}</p>
          </div>

        </div>
      </section>

    </main>
  );
}
