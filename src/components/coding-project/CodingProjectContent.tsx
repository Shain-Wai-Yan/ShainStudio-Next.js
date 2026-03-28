'use client';

import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { CodingProject } from '@/lib/strapi/coding-projects';

interface CodingProjectContentProps {
  project: CodingProject;
  language: 'en' | 'zh';
}

export default function CodingProjectContent({ project, language }: CodingProjectContentProps) {
  const backHref =
    language === 'zh' ? '/zh/portfolio/coding-projects' : '/portfolio/coding-projects';

  const DOMPURIFY_CONFIG = {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src'],
    ALLOWED_URI_REGEXP: /^(?:(?:https:)?\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)\//i,
  };

  const cleanContent = DOMPurify.sanitize(project.content, DOMPURIFY_CONFIG);

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

      {/* Main Content (CK Editor HTML) */}
      <div
        className="
          prose prose-sm md:prose-base dark:prose-invert max-w-none
          prose-headings:text-[#191970] dark:prose-headings:text-[#ffd700]
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[#333] dark:prose-p:text-[#e0e0e0]
          prose-p:leading-relaxed prose-p:mb-5
          prose-a:text-[#191970] dark:prose-a:text-[#ffd700]
          prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#191970] dark:prose-strong:text-[#ffd700]
          prose-ul:my-5 prose-ol:my-5
          prose-li:text-[#333] dark:prose-li:text-[#e0e0e0]
          prose-li:mb-1.5
          prose-blockquote:border-l-2 prose-blockquote:border-[#191970] dark:prose-blockquote:border-[#ffd700]
          prose-blockquote:bg-[#f8f9fa] dark:prose-blockquote:bg-[#1e1e1e]
          prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic
          prose-blockquote:text-[#555] dark:prose-blockquote:text-[#b0b0b0]
          prose-code:bg-[#f1f3f5] dark:prose-code:bg-[#2a2a2a]
          prose-code:px-1.5 prose-code:py-0.5
          prose-code:text-[#d63384] dark:prose-code:text-[#ffa7c4]
          prose-code:font-mono prose-code:text-[0.85em]
          prose-pre:bg-[#1e1e1e] prose-pre:text-[#e0e0e0]
          prose-img:rounded-none prose-img:shadow-md
          prose-figure:my-8
          prose-figcaption:text-center prose-figcaption:text-xs prose-figcaption:text-[#666] dark:prose-figcaption:text-[#999] prose-figcaption:mt-2
        "
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      {/* ── Low-profile back link ──────────────────────────────────────────── */}
      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
        <Link
          href={backHref}
          className="
            inline-flex items-center gap-1.5
            text-xs text-gray-400 dark:text-gray-500
            hover:text-[#191970] dark:hover:text-[#d4af37]
            transition-colors duration-150
            group
          "
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
          >
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {language === 'zh' ? '返回编码项目' : 'Back to Coding Projects'}
        </Link>
      </div>
    </article>
  );
}
