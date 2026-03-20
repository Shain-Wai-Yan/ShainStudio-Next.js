'use client';

import Image from 'next/image';
import Link from 'next/link';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import type { MarketingProject } from '@/lib/strapi/marketing-in-motion';
import { formatProjectDate } from '@/lib/strapi/marketing-in-motion';

interface MarketingProjectCardProps {
  project: MarketingProject;
  locale?: 'en' | 'zh';
  isFeatured?: boolean;
  viewDetailsLabel?: string;
}

const MAX_SUMMARY = 140;

export function MarketingProjectCard({
  project,
  locale = 'en',
  isFeatured = false,
  viewDetailsLabel = 'View Details',
}: MarketingProjectCardProps) {
  const href =
    locale === 'zh'
      ? `/zh/portfolio/marketing-in-motion/${project.slug}`
      : `/portfolio/marketing-in-motion/${project.slug}`;

  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
  const formattedDate = project.projectDate
    ? formatProjectDate(project.projectDate, dateLocale)
    : '';

  const summary =
    project.summary.length > MAX_SUMMARY
      ? project.summary.slice(0, MAX_SUMMARY) + '…'
      : project.summary;

  return (
    <article
      className={`
        group relative flex flex-col
        bg-white dark:bg-[#1e1e1e]
        rounded-none overflow-hidden
        border border-gray-200 dark:border-gray-800
        shadow-sm hover:shadow-lg dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
        transition-all duration-250 hover:-translate-y-0.5
        ${isFeatured ? 'ring-2 ring-[#ffd700] dark:ring-[#a67c00]' : ''}
      `}
    >
      {/* Featured accent stripe */}
      {isFeatured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ffd700] via-[#a67c00] to-[#ffd700] z-10" />
      )}

      <Link href={href} className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#191970] dark:focus-visible:ring-[#ffd700]">
        {/* Cover image */}
        <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={optimizeCloudinaryUrl(project.coverImage)}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/placeholder.svg?height=400&width=600&text=Marketing+Project';
            }}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#191970]/0 dark:bg-[#000]/0 group-hover:bg-[#191970]/10 dark:group-hover:bg-black/20 transition-all duration-300" />

          {/* Type badge */}
          <span
            className="
              absolute top-3 left-3
              px-2 py-0.5 text-xs font-semibold
              bg-[#191970] dark:bg-[#a67c00] text-white
              uppercase tracking-wide
            "
          >
            {project.type}
          </span>

          {/* Featured badge */}
          {isFeatured && (
            <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold bg-[#ffd700] text-[#191970] uppercase tracking-wide">
              ★ Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          {/* Category + Date */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#191970] dark:text-[#d4af37]">
              {project.category}
            </span>
            {formattedDate && (
              <>
                <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                <time
                  dateTime={project.projectDate}
                  className="text-[10px] text-gray-400 dark:text-gray-500"
                >
                  {formattedDate}
                </time>
              </>
            )}
            {project.readingTime && (
              <>
                <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{project.readingTime}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h2
            className="
              text-sm font-bold leading-snug text-pretty
              text-gray-900 dark:text-[#e0e0e0]
              group-hover:text-[#191970] dark:group-hover:text-[#d4af37]
              transition-colors duration-200
              line-clamp-2
            "
          >
            {project.title}
          </h2>

          {/* Summary */}
          {summary && (
            <p className="text-xs text-gray-500 dark:text-[#909090] leading-relaxed line-clamp-3 flex-1">
              {summary}
            </p>
          )}

          {/* Tools */}
          {project.toolsUsed.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.toolsUsed.slice(0, 4).map((tool) => (
                <span
                  key={tool}
                  className="
                    px-1.5 py-0.5 text-[10px] font-medium
                    bg-[#191970]/8 dark:bg-[#a67c00]/12
                    text-[#191970] dark:text-[#d4af37]
                    border border-[#191970]/15 dark:border-[#a67c00]/20
                  "
                >
                  {tool}
                </span>
              ))}
              {project.toolsUsed.length > 4 && (
                <span className="px-1.5 py-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                  +{project.toolsUsed.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] text-gray-400 dark:text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer CTA */}
          <footer className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span
              className="
                text-xs font-semibold flex items-center gap-1
                text-[#191970] dark:text-[#d4af37]
                group-hover:gap-2 transition-all duration-200
              "
            >
              {viewDetailsLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </span>
          </footer>
        </div>
      </Link>
    </article>
  );
}