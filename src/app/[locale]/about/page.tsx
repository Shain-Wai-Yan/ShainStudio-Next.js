'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FaGlobe, FaLaptopCode, FaLightbulb } from 'react-icons/fa';
import { getDictionarySync } from '@/lib/getDictionary';
import MarTechStack from '@/components/MarTechStack';

export default function AboutPage() {
  const params = useParams();
  const locale = (params.locale as "en" | "zh") || 'en';
  const t = getDictionarySync(locale);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // Scroll-triggered fade-up animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.15 }
    );
    const els = document.querySelectorAll('.animate-on-scroll');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    <main className="bg-white dark:bg-slate-950">

      {/* ── Hero ── */}
      <section className="relative py-32 md:py-40 text-center overflow-hidden bg-gradient-to-b from-[#191970] to-[#2a2a9a] dark:from-[#a67c00] dark:to-[#704700]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t.aboutPage.heroTitle} <span className="text-[#ffd700] dark:text-[#f9df85]">{t.aboutPage.heroTitleHighlight}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100">
            {t.aboutPage.heroSubtitle}
          </p>
        </div>
      </section>

      {/* ── Profile ── */}
      <section
        className="py-12 md:py-20 px-4 md:px-0 bg-background-alt relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23191970' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="bg-background rounded-2xl shadow-lg p-8 md:p-12 text-center relative overflow-hidden
            transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-2 bg-primary-gradient" style={{ backgroundSize: '200% 200%' }} />

            {/* Profile Image */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-52 h-52 md:w-56 md:h-56 group">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/profile.jpeg"
                    alt={t.aboutPage.profileAltText}
                    fill
                    className="rounded-full object-cover border-4 border-background shadow-lg
                      transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute -inset-3 rounded-full border-2 border-dashed border-accent animate-rotate-circle pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Name */}
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-2 font-secondary
              relative inline-block cursor-default
              after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px]
              after:bg-accent after:transition-all after:duration-400
              hover:after:w-full hover:text-accent transition-colors duration-300">
              {t.aboutPage.myName}
            </h2>
            <p className="text-lg text-muted mb-6 font-primary transition-colors duration-300 hover:text-primary dark:hover:text-accent">
              {t.aboutPage.alsoKnownAs}
            </p>

            {/* Motto */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 dark:from-accent/5 dark:to-primary/5
              rounded-lg p-6 mb-0 border-l-4 border-accent
              transition-all duration-400 hover:scale-[1.02] hover:shadow-lg
              hover:border-primary dark:hover:border-accent">
              <p className="text-2xl font-bold text-primary dark:text-white mb-2 font-secondary" lang="zh">
                {t.aboutPage.motto}
              </p>
              <p className="text-base md:text-lg text-muted italic font-primary">
                {t.aboutPage.mottoTranslation}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bio ── */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-background relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Main Bio ── */}
            <div className="lg:col-span-2">

              {/* My Story heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-6 font-secondary
                relative inline-block pb-4 cursor-default
                after:content-[''] after:absolute after:bottom-0 after:left-0
                after:w-16 after:h-1 after:bg-accent after:rounded
                after:transition-all after:duration-400
                hover:after:w-full">
                {t.aboutPage.myStoryHeading}
              </h2>

              <p className="text-base md:text-lg text-text dark:text-gray-300 leading-relaxed mb-6 text-justify font-primary animate-on-scroll">
                {t.aboutPage.myStoryText}
              </p>

              {/* Divider */}
              <div className="h-px my-8 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-shimmer" />
              </div>

              {/* What I Bring heading */}
              <h3 className="text-2xl md:text-3xl font-bold text-primary dark:text-white mb-6 font-secondary
                relative inline-block pb-3 animate-on-scroll cursor-default
                after:content-[''] after:absolute after:bottom-0 after:left-0
                after:w-16 after:h-1 after:bg-accent after:rounded
                after:transition-all after:duration-400
                hover:after:w-full">
                {t.aboutPage.whatIBringHeading}
              </h3>

              {/* Skills list */}
              <ul className="space-y-6">

                {/* Trilingual */}
                <li className="flex gap-4 animate-on-scroll group
                  transition-transform duration-300 hover:translate-x-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-gradient
                    flex items-center justify-center text-white shadow-md
                    transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-6">
                    <FaGlobe className="text-xl" />
                  </div>
                  <div className="border-b border-transparent group-hover:border-accent/30 transition-colors duration-300 pb-1 w-full">
                    <h4 className="text-lg font-bold text-primary dark:text-white mb-1 font-secondary
                      transition-colors duration-300 group-hover:text-accent dark:group-hover:text-accent">
                      {t.aboutPage.trilingualTitle}
                    </h4>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.trilingualDesc}
                    </p>
                  </div>
                </li>

                {/* Digital Skills */}
                <li className="flex gap-4 animate-on-scroll group
                  transition-transform duration-300 hover:translate-x-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-gradient
                    flex items-center justify-center text-white shadow-md
                    transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-6">
                    <FaLaptopCode className="text-xl" />
                  </div>
                  <div className="border-b border-transparent group-hover:border-accent/30 transition-colors duration-300 pb-1 w-full">
                    <h4 className="text-lg font-bold text-primary dark:text-white mb-1 font-secondary
                      transition-colors duration-300 group-hover:text-accent dark:group-hover:text-accent">
                      {t.aboutPage.digitalSkillsTitle}
                    </h4>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.digitalSkillsDesc}
                    </p>
                  </div>
                </li>

                {/* Curiosity */}
                <li className="flex gap-4 animate-on-scroll group
                  transition-transform duration-300 hover:translate-x-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-gradient
                    flex items-center justify-center text-white shadow-md
                    transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-6">
                    <FaLightbulb className="text-xl" />
                  </div>
                  <div className="border-b border-transparent group-hover:border-accent/30 transition-colors duration-300 pb-1 w-full">
                    <h4 className="text-lg font-bold text-primary dark:text-white mb-1 font-secondary
                      transition-colors duration-300 group-hover:text-accent dark:group-hover:text-accent">
                      {t.aboutPage.curiosityTitle}
                    </h4>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.curiosityDesc}
                    </p>
                  </div>
                </li>

              </ul>
            </div>

            {/* ── Sidebar ── */}
            <div className="flex flex-col gap-6">

              {/* Personal Info Card */}
              <div className="bg-background rounded-xl shadow-md p-6 border-t-4 border-accent animate-on-scroll
                relative overflow-hidden
                transition-all duration-400 hover:shadow-xl hover:-translate-y-2 hover:border-primary
                group">
                {/* Hover glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0
                  group-hover:from-primary/5 group-hover:to-accent/5
                  transition-all duration-500 pointer-events-none rounded-xl" />

                <h3 className="text-xl font-bold text-primary dark:text-white mb-4 font-secondary relative pb-3
                  after:content-[''] after:absolute after:bottom-0 after:left-0
                  after:w-10 after:h-1 after:bg-accent after:rounded
                  after:transition-all after:duration-400
                  group-hover:after:w-full">
                  {t.aboutPage.personalInfoHeading}
                </h3>

                <ul className="space-y-3 font-primary text-sm">
                  <li className="pb-3 border-b border-gray-200 dark:border-gray-700
                    transition-all duration-300 hover:translate-x-2 hover:border-accent/40 cursor-default">
                    <span className="font-bold text-primary dark:text-white block mb-0.5
                      transition-colors duration-300 hover:text-accent">{t.aboutPage.ageLabel}</span>
                    <span className="text-muted">{calculateAge()} {t.aboutPage.ageValueSuffix}</span>
                  </li>
                  <li className="pb-3 border-b border-gray-200 dark:border-gray-700
                    transition-all duration-300 hover:translate-x-2 hover:border-accent/40 cursor-default">

                  <span className="font-bold text-primary dark:text-white block mb-0.5
                    transition-colors duration-300 hover:text-accent">
                    {t.aboutPage.educationLabel}
                 </span>

                 <div className="text-muted flex flex-col">
                  <span>{t.aboutPage.educationValue1}</span>
                 <span>{t.aboutPage.educationValue2}</span>
                </div>
                 </li>
                  <li className="pb-3 border-b border-gray-200 dark:border-gray-700
                    transition-all duration-300 hover:translate-x-2 hover:border-accent/40 cursor-default">
                    <span className="font-bold text-primary dark:text-white block mb-0.5
                      transition-colors duration-300 hover:text-accent">{t.aboutPage.completedLabel}</span>
                    <span className="text-muted">
                      {t.aboutPage.completedValue}
                    </span>
                  </li>
                  <li className="transition-all duration-300 hover:translate-x-2 cursor-default">
                    <span className="font-bold text-primary dark:text-white block mb-1
                      transition-colors duration-300 hover:text-accent">{t.aboutPage.certificatesLabel}</span>
                    <div className="text-muted space-y-1">
                      <p className="flex items-start gap-1.5">
                        <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                        {t.aboutPage.certificate1}
                      </p>
                      <p className="flex items-start gap-1.5">
                        <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                        {t.aboutPage.certificate2}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Quote Card */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 dark:from-accent/5 dark:to-primary/5
                rounded-xl p-6 border-l-4 border-accent shadow-md animate-on-scroll
                transition-all duration-400 hover:shadow-xl hover:-translate-y-2 hover:border-primary
                group relative overflow-hidden">
                {/* Animated background shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent
                  translate-x-[-100%] group-hover:translate-x-[100%]
                  transition-transform duration-700 pointer-events-none" />

                <blockquote className="relative">
                  <span className="text-5xl text-accent/20 absolute -top-4 -left-2 font-serif
                    transition-all duration-300 group-hover:text-accent/40 group-hover:-top-6 group-hover:-left-3">
                    "
                  </span>
                  <p className="pl-6 text-base md:text-lg italic text-text font-primary leading-relaxed
                    transition-colors duration-300 group-hover:text-primary dark:group-hover:text-white">
                    {t.aboutPage.quoteText}
                  </p>
                  <cite className="block text-right font-bold text-primary dark:text-white mt-4 not-italic
                    transition-all duration-300 group-hover:text-accent group-hover:translate-x-[-4px]">
                    {t.aboutPage.quoteAuthor}
                  </cite>
                </blockquote>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-background-alt relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <h2 className="animate-on-scroll text-3xl md:text-4xl font-bold text-primary dark:text-white
            text-center mb-12 font-secondary relative pb-4 inline-block w-full cursor-default">
            {t.aboutPage.myJourneyHeading}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-accent rounded" />
          </h2>

          <div className="relative">
            {/* Center line */}
            <div
              className="hidden md:block absolute top-0 bottom-0 w-1 z-0"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(to bottom, var(--primary, #191970), var(--accent, #ffd700))',
              }}
            />

            <div className="space-y-12">

              {/* ── Item 1 LEFT ── */}
              <div className="relative flex flex-col md:flex-row md:items-start">
                <div className="animate-on-scroll md:w-1/2 md:pr-16 w-full" style={{ transitionDelay: '0ms' }}>
                  <div className="bg-background rounded-lg p-6 shadow-md group
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary
                      transition-all duration-300 group-hover:text-accent group-hover:translate-x-1">
                      {t.aboutPage.timeline1Title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10
                      text-primary dark:text-accent rounded-full text-sm font-bold mb-3
                      transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                      {t.aboutPage.timeline1Year}
                    </span>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.timeline1Desc}
                    </p>
                  </div>
                </div>
                <div
                  className="animate-on-scroll hidden md:flex absolute top-6 w-5 h-5 rounded-full
                    bg-white dark:bg-slate-900 border-4 border-accent z-10
                    transition-all duration-300 hover:scale-150 hover:bg-accent"
                  style={{ left: '50%', transform: 'translateX(-50%)', transitionDelay: '150ms' }}
                />
                <div className="md:w-1/2 md:pl-16" />
              </div>

              {/* ── Item 2 RIGHT ── */}
              <div className="relative flex flex-col md:flex-row md:items-start">
                <div className="md:w-1/2 md:pr-16" />
                <div
                  className="animate-on-scroll hidden md:flex absolute top-6 w-5 h-5 rounded-full
                    bg-white dark:bg-slate-900 border-4 border-accent z-10
                    transition-all duration-300 hover:scale-150 hover:bg-accent"
                  style={{ left: '50%', transform: 'translateX(-50%)', transitionDelay: '150ms' }}
                />
                <div className="animate-on-scroll md:w-1/2 md:pl-16 w-full" style={{ transitionDelay: '0ms' }}>
                  <div className="bg-background rounded-lg p-6 shadow-md group
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary
                      transition-all duration-300 group-hover:text-accent group-hover:translate-x-1">
                      {t.aboutPage.timeline2Title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10
                      text-primary dark:text-accent rounded-full text-sm font-bold mb-3
                      transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                      {t.aboutPage.timeline2Year}
                    </span>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.timeline2Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Item 3 LEFT ── */}
              <div className="relative flex flex-col md:flex-row md:items-start">
                <div className="animate-on-scroll md:w-1/2 md:pr-16 w-full" style={{ transitionDelay: '0ms' }}>
                  <div className="bg-background rounded-lg p-6 shadow-md group
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary
                      transition-all duration-300 group-hover:text-accent group-hover:translate-x-1">
                      {t.aboutPage.timeline3Title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10
                      text-primary dark:text-accent rounded-full text-sm font-bold mb-3
                      transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                      {t.aboutPage.timeline3Year}
                    </span>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.timeline3Desc}
                    </p>
                  </div>
                </div>
                <div
                  className="animate-on-scroll hidden md:flex absolute top-6 w-5 h-5 rounded-full
                    bg-white dark:bg-slate-900 border-4 border-accent z-10
                    transition-all duration-300 hover:scale-150 hover:bg-accent"
                  style={{ left: '50%', transform: 'translateX(-50%)', transitionDelay: '150ms' }}
                />
                <div className="md:w-1/2 md:pl-16" />
              </div>

              {/* ── Item 4 RIGHT ── */}
              <div className="relative flex flex-col md:flex-row md:items-start">
                <div className="md:w-1/2 md:pr-16" />
                <div
                  className="animate-on-scroll hidden md:flex absolute top-6 w-5 h-5 rounded-full
                    bg-white dark:bg-slate-900 border-4 border-accent z-10
                    transition-all duration-300 hover:scale-150 hover:bg-accent"
                  style={{ left: '50%', transform: 'translateX(-50%)', transitionDelay: '150ms' }}
                />
                <div className="animate-on-scroll md:w-1/2 md:pl-16 w-full" style={{ transitionDelay: '0ms' }}>
                  <div className="bg-background rounded-lg p-6 shadow-md group
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary
                      transition-all duration-300 group-hover:text-accent group-hover:translate-x-1">
                      {t.aboutPage.timeline4Title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10
                      text-primary dark:text-accent rounded-full text-sm font-bold mb-3
                      transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                      {t.aboutPage.timeline4Year}
                    </span>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.timeline4Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Item 5 LEFT ── */}
              <div className="relative flex flex-col md:flex-row md:items-start">
                <div className="animate-on-scroll md:w-1/2 md:pr-16 w-full" style={{ transitionDelay: '0ms' }}>
                  <div className="bg-background rounded-lg p-6 shadow-md group
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary
                      transition-all duration-300 group-hover:text-accent group-hover:translate-x-1">
                      {t.aboutPage.timeline5Title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10
                      text-primary dark:text-accent rounded-full text-sm font-bold mb-3
                      transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                      {t.aboutPage.timeline5Year}
                    </span>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.timeline5Desc}
                    </p>
                  </div>
                </div>
                <div
                  className="animate-on-scroll hidden md:flex absolute top-6 w-5 h-5 rounded-full
                    bg-white dark:bg-slate-900 border-4 border-accent z-10
                    transition-all duration-300 hover:scale-150 hover:bg-accent"
                  style={{ left: '50%', transform: 'translateX(-50%)', transitionDelay: '150ms' }}
                />
                <div className="md:w-1/2 md:pl-16" />
              </div>

              {/* ── Item 6 RIGHT ── */}
              <div className="relative flex flex-col md:flex-row md:items-start">
                <div className="md:w-1/2 md:pr-16" />
                <div
                  className="animate-on-scroll hidden md:flex absolute top-6 w-5 h-5 rounded-full
                    bg-white dark:bg-slate-900 border-4 border-accent z-10
                    transition-all duration-300 hover:scale-150 hover:bg-accent"
                  style={{ left: '50%', transform: 'translateX(-50%)', transitionDelay: '150ms' }}
                />
                <div className="animate-on-scroll md:w-1/2 md:pl-16 w-full" style={{ transitionDelay: '0ms' }}>
                  <div className="bg-background rounded-lg p-6 shadow-md group
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary dark:text-white mb-2 font-secondary
                      transition-all duration-300 group-hover:text-accent group-hover:translate-x-1">
                      {t.aboutPage.timeline6Title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-accent/10
                      text-primary dark:text-accent rounded-full text-sm font-bold mb-3
                      transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                      {t.aboutPage.timeline6Year}
                    </span>
                    <p className="text-muted dark:text-gray-400 font-primary transition-colors duration-300 group-hover:text-text dark:group-hover:text-gray-200">
                      {t.aboutPage.timeline6Desc}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Mar-Tech Stack ── */}
      <MarTechStack language={locale} />

      {/* ── CTA ── */}
      <section
        className="py-12 md:py-20 px-4 md:px-0 bg-primary-gradient relative overflow-hidden"
        style={{ backgroundSize: '200% 200%' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-secondary animate-fade-in-up">
            {t.aboutPage.ctaTitle}
          </h2>
          <p
            className="text-lg md:text-xl text-white opacity-90 mb-8 font-primary animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {t.aboutPage.ctaDesc}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold
              py-3 px-8 rounded hover:shadow-lg hover:scale-105 transition-all duration-300
              relative overflow-hidden group animate-fade-in-up font-secondary"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="relative z-10">{t.aboutPage.ctaButton}</span>
            <svg
              className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0
              group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded" />
          </a>
        </div>
      </section>

    </main>
  );
}
