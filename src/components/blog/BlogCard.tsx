'use client';

import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import Link from 'next/link';
import { BlogPost, transformBlog } from '@/lib/strapi/blogs';

interface BlogCardProps {
  blog: BlogPost;
  language: 'en' | 'zh';
  variant?: 'grid' | 'list';
}

export default function BlogCard({ blog, language, variant = 'grid' }: BlogCardProps) {
  const transformed = transformBlog(blog);
  const baseUrl = language === 'zh' ? '/zh/blog' : '/blog';

  if (variant === 'list') {
    return (
      <article className="group border-b border-[#d0d0d0] dark:border-[#444] py-6 transition-all hover:bg-[#f8f9fa] dark:hover:bg-[#1e1e1e]">
        <Link href={`${baseUrl}/${blog.Slug}`} className="flex gap-5">
          {transformed.featuredImageUrl && (
            <div className="relative w-36 h-28 flex-shrink-0 overflow-hidden rounded-sm">
              <Image
                src={optimizeCloudinaryUrl(transformed.featuredImageUrl)}
                alt={blog.Title}
                fill
                className="object-cover group-hover:scale-[1.08] transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              {blog.Category && (
                <span className="text-[10px] font-semibold text-white bg-[#191970] dark:bg-[#a67c00] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {blog.Category}
                </span>
              )}
              <time className="text-xs text-[#666] dark:text-[#b0b0b0]">{transformed.formattedDate}</time>
              {transformed.readingTime && (
                <span className="text-xs text-[#666] dark:text-[#b0b0b0]">
                  {transformed.readingTime} {language === 'zh' ? '分钟阅读' : 'min read'}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-[#111] dark:text-white mb-1.5 group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors line-clamp-2">
              {blog.Title}
            </h3>
            <p className="text-[#666] dark:text-[#b0b0b0] text-sm line-clamp-2">{transformed.excerpt}</p>
            {blog.Tags && blog.Tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {blog.Tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-[#191970]/8 dark:bg-[#ffd700]/10 text-[#191970] dark:text-[#ffd700]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      className="group flex flex-col bg-white dark:bg-[#121212] overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '4px' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
    >
      <Link href={`${baseUrl}/${blog.Slug}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative w-full h-40 overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e] flex-shrink-0">
          {transformed.featuredImageUrl ? (
            <Image
              src={optimizeCloudinaryUrl(transformed.featuredImageUrl)}
              alt={blog.Title}
              fill
              className="object-cover group-hover:scale-[1.08] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#191970]/10 to-[#ffd700]/10">
              <span className="text-[#191970]/30 dark:text-[#ffd700]/30 text-4xl font-bold">
                {blog.Title.charAt(0)}
              </span>
            </div>
          )}
          {/* Category badge — top left pill, matches vanilla */}
          {blog.Category && (
            <span className="absolute top-3 left-3 text-[10px] font-semibold text-white bg-[#191970] dark:bg-[#a67c00] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              {blog.Category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Meta */}
          <div className="flex items-center justify-between text-[11px] text-[#666] dark:text-[#b0b0b0] mb-2">
            <time>{transformed.formattedDate}</time>
            {transformed.readingTime && (
              <span>{transformed.readingTime} {language === 'zh' ? '分钟' : 'min read'}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-[#111] dark:text-white mb-2 group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors line-clamp-2 leading-snug flex-1">
            {blog.Title}
          </h3>

          {/* Excerpt */}
          <p className="text-[#666] dark:text-[#b0b0b0] text-xs line-clamp-3 mb-3 leading-relaxed">
            {transformed.excerpt}
          </p>

          {/* Tags */}
          {blog.Tags && blog.Tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {blog.Tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(25,25,112,0.08)', color: '#191970' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Read more — matches vanilla .read-more */}
          <div className="mt-auto pt-2 flex items-center gap-1 text-[#191970] dark:text-[#ffd700] text-xs font-semibold group-hover:gap-2 transition-all">
            <span>{language === 'zh' ? '阅读更多' : 'Read more'}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
}