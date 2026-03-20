'use client';

import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import { MarketingProject, formatProjectDate } from '@/lib/strapi/marketing-in-motion';

interface ProjectHeaderProps {
  project: MarketingProject;
  language: 'en' | 'zh';
}

export default function ProjectHeader({ project, language }: ProjectHeaderProps) {
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
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
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
          </div>
        </div>
      </div>
    </header>
  );
}
