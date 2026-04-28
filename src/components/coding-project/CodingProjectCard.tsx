'use client';

import Link from 'next/link';
import CImage from '@/components/ui/CImage';
import type { CodingProject } from '@/lib/strapi/coding-projects';
import { SiGithub } from 'react-icons/si';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface CodingProjectCardProps {
  project: CodingProject;
  locale: 'en' | 'zh';
  viewDetailsLabel: string;
  priority?: boolean;
}

export function CodingProjectCard({
  project,
  locale,
  viewDetailsLabel,
  priority = false,
}: CodingProjectCardProps) {
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const href = `${basePath}/portfolio/coding-projects/${project.slug}`;

  return (
    <div
      className="
        group relative flex flex-col h-full
        bg-white dark:bg-[#1a1a1a]
        border border-gray-100 dark:border-gray-800
        rounded-2xl overflow-hidden
        hover:shadow-2xl hover:shadow-[#191970]/5 dark:hover:shadow-black/40
        transition-all duration-300 transform-gpu hover:-translate-y-1
        focus-within:ring-2 focus-within:ring-[#191970] dark:focus-within:ring-[#d4af37]
      "
    >
      {/* ── Image Header ── */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <CImage
          src={project.coverImage}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
        />
        
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80" />

        {/* Floating Category Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {project.category && (
            <span className="backdrop-blur-md bg-black/40 text-white/95 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
              {project.category}
            </span>
          )}
          {project.isFeatured && (
            <span className="backdrop-blur-md bg-[#d4af37]/90 text-[#191970] text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded">
              {locale === 'zh' ? '精选' : 'Featured'}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <span>{project.type}</span>
          <span aria-hidden="true">&mdash;</span>
          <span>{project.readingTime}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-[#191970] dark:group-hover:text-[#d4af37] transition-colors">
          <Link href={href} className="focus:outline-none before:absolute before:inset-0 before:z-10">
            {project.title}
          </Link>
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed flex-1">
          {project.summary}
        </p>

        {/* Tools */}
        {project.toolsUsed && project.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5 relative z-20">
            {project.toolsUsed.slice(0, 4).map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 text-[10px] font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 rounded"
              >
                {tool}
              </span>
            ))}
            {project.toolsUsed.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                +{project.toolsUsed.length - 4}
              </span>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs font-semibold text-[#191970] dark:text-[#d4af37] flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            {viewDetailsLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>

          <div className="flex gap-2 relative z-20">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View GitHub Repository"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 hover:dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="GitHub Repository"
              >
                <SiGithub className="w-3.5 h-3.5" />
              </a>
            )}
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View Live Demo"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[#191970]/5 hover:bg-[#191970]/10 dark:bg-[#d4af37]/10 hover:dark:bg-[#d4af37]/20 text-[#191970] dark:text-[#d4af37] transition-colors"
                aria-label="Live Demo"
              >
                <FaExternalLinkAlt className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
