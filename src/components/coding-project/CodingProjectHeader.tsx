'use client';

import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import { CodingProject, formatProjectDate } from '@/lib/strapi/coding-projects';

interface CodingProjectHeaderProps {
  project: CodingProject;
  language: 'en' | 'zh';
}

export default function CodingProjectHeader({ project, language }: CodingProjectHeaderProps) {
  const dateLocale = language === 'zh' ? 'zh-CN' : 'en-US';

  return (
    <header className="relative">
      {/* Cover Image */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden">
        <Image
          src={optimizeCloudinaryUrl(project.coverImage)}
          alt={project.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Category & Type Badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-[#191970] dark:bg-[#ffd700] text-white dark:text-[#121212] text-xs font-semibold rounded-full uppercase tracking-wide">
                {project.category}
              </span>
              {project.type && project.type !== 'General' && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  {project.type}
                </span>
              )}
              {project.isFeatured && (
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                  {language === 'zh' ? '精选' : 'Featured'}
                </span>
              )}
            </div>
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
              {project.title}
            </h1>
            
            {/* Meta Info + Links */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-4">
                <time dateTime={project.projectDate} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatProjectDate(project.projectDate, dateLocale)}
                </time>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {project.readingTime}
                </span>
              </div>

              {/* Action Links */}
              <div className="flex flex-wrap items-center gap-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-white/5 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                )}
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#ffd700] hover:bg-[#ffed4a] text-[#121212] font-bold rounded-xl transition-all shadow-lg shadow-[#ffd700]/20 hover:shadow-[#ffd700]/30 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
