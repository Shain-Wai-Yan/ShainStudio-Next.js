'use client';
import Link from 'next/link';
import { MarketingProject } from '@/lib/strapi/marketing-in-motion';
import RichTextRenderer from '../shared/RichTextRenderer';

interface ProjectContentProps {
  project: MarketingProject;
  language: 'en' | 'zh';
}

export default function ProjectContent({ project, language }: ProjectContentProps) {
  const backHref =
    language === 'zh' ? '/zh/portfolio/marketing-in-motion' : '/portfolio/marketing-in-motion';

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Summary callout */}
      {project.summary && (
        <div className="mb-8 p-5 bg-[#f8f9fa] dark:bg-[#1e1e1e] border-l-2 border-[#191970] dark:border-[#ffd700]">
          <p className="text-base text-[#333] dark:text-[#e0e0e0] leading-relaxed italic">
            {project.summary}
          </p>
        </div>
      )}

      {/* Meta grid */}
      {(project.toolsUsed.length > 0 || project.tags.length > 0) && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
          {project.toolsUsed.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3">
                {language === 'zh' ? '使用工具' : 'Tools Used'}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {project.toolsUsed.map((tool, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-[#191970]/8 dark:bg-[#ffd700]/8 text-[#191970] dark:text-[#ffd700] text-xs font-medium border border-[#191970]/15 dark:border-[#ffd700]/15">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.tags.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-3">
                {language === 'zh' ? '标签' : 'Tags'}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white dark:bg-[#2a2a2a] text-[#495057] dark:text-[#b0b0b0] text-xs border border-gray-200 dark:border-gray-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Rendered via Parser — uses the shared CKEditor CSS from globals.css */}
      <RichTextRenderer
        content={project.fullText}
        className="ck-body"
      />

      {/* ── Low-profile back link ──────────────────────────────────────────── */}
      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
        <Link
          href={backHref}
          className="
            inline-flex items-center gap-1.5
            text-xs font-medium text-gray-500 dark:text-gray-400
            hover:text-[#191970] dark:hover:text-[#d4af37]
            transition-colors duration-150
            group
          "
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
          >
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {language === 'zh' ? '返回营销项目' : 'Back to Marketing in Motion'}
        </Link>
      </div>
    </article>
  );
}