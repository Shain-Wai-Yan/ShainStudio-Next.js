'use client';

import Link from 'next/link';
import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import { CodingProject, formatProjectDate } from '@/lib/strapi/coding-projects';

interface RelatedCodingProjectsProps {
  projects: CodingProject[];
  language: 'en' | 'zh';
}

export default function RelatedCodingProjects({ projects, language }: RelatedCodingProjectsProps) {
  if (!projects || projects.length === 0) return null;

  const basePath =
    language === 'zh'
      ? '/zh/portfolio/coding-projects'
      : '/portfolio/coding-projects';

  const dateLocale = language === 'zh' ? 'zh-CN' : 'en-US';

  return (
    <section className="bg-[#191970] dark:bg-[#0d0d2b]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <span className="text-[#ffd700] text-lg font-black tracking-tight select-none">◈</span>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
              {language === 'zh' ? '相关编程项目' : 'Related Coding Projects'}
            </h2>
          </div>
          <Link
            href={basePath}
            className="text-[10px] font-semibold tracking-widest uppercase text-white/40 hover:text-[#ffd700] transition-colors flex items-center gap-1"
          >
            {language === 'zh' ? '全部项目' : 'All projects'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* ── Cards ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col divide-y divide-white/8">
          {projects.map((project, idx) => (
            <RelatedRow
              key={project.id}
              project={project}
              href={`${basePath}/${project.slug}`}
              index={idx + 1}
              dateLocale={dateLocale}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── Row card ─────────────────────────────────────────────────────────────────

function RelatedRow({
  project,
  href,
  index,
  dateLocale,
}: {
  project: CodingProject;
  href: string;
  index: number;
  dateLocale: string;
}) {
  const formattedDate = project.projectDate
    ? formatProjectDate(project.projectDate, dateLocale)
    : '';

  return (
    <Link
      href={href}
      className="
        group flex items-stretch gap-0
        py-4 first:pt-0 last:pb-0
        focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ffd700]
      "
    >
      {/* Index number */}
      <div className="flex-shrink-0 w-10 flex items-start pt-1">
        <span className="text-[11px] font-black tabular-nums text-white/20 group-hover:text-[#ffd700] transition-colors duration-200 font-mono">
          {String(index).padStart(2, '0')}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="flex-shrink-0 relative w-20 h-14 overflow-hidden bg-white/5 mr-4 self-start">
        {project.coverImage && (
          <Image
            src={optimizeCloudinaryUrl(project.coverImage)}
            alt={project.title}
            fill
            className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-400 group-hover:scale-105"
            sizes="80px"
          />
        )}
        {/* color tint overlay */}
        <div className="absolute inset-0 bg-[#191970]/40 group-hover:bg-transparent transition-colors duration-300" />
      </div>

      {/* Text content */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        {/* Category + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#ffd700]/70 group-hover:text-[#ffd700] transition-colors">
            {project.category}
          </span>
          {formattedDate && (
            <>
              <span className="text-white/20 text-[9px]">·</span>
              <span className="text-[9px] text-white/30 tabular-nums">{formattedDate}</span>
            </>
          )}
          {project.isFeatured && (
            <span className="text-[8px] font-bold bg-[#ffd700] text-[#191970] px-1.5 py-0.5 uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors duration-200 line-clamp-2 leading-snug">
          {project.title}
        </h3>

        {/* Summary — only on non-mobile */}
        {project.summary && (
          <p className="hidden sm:block text-[11px] text-white/35 group-hover:text-white/50 transition-colors line-clamp-1 leading-relaxed">
            {project.summary}
          </p>
        )}

        {/* Tool tags */}
        {project.toolsUsed && project.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {project.toolsUsed.slice(0, 3).map((tool) => (
              <span key={tool} className="text-[9px] font-medium px-1.5 py-0.5 bg-white/5 group-hover:bg-white/10 text-white/40 group-hover:text-white/60 border border-white/8 transition-colors">
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow — right edge */}
      <div className="flex-shrink-0 flex items-center pl-4 self-center">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-white/20 group-hover:text-[#ffd700] transition-all duration-200 group-hover:translate-x-0.5"
        >
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}
