'use client';

import Image from 'next/image';
import { BlogPost, transformBlog } from '@/lib/strapi/blogs';

interface BlogPostHeaderProps {
  blog: BlogPost;
  language: 'en' | 'zh';
}

export default function BlogPostHeader({ blog, language }: BlogPostHeaderProps) {
  const transformed = transformBlog(blog);

  return (
    <article className="w-full">
      {/* Hero section with featured image */}
      {transformed.featuredImageUrl && (
        <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
          <Image
            src={transformed.featuredImageUrl}
            alt={blog.Title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      )}

      {/* Article metadata */}
      <div className="bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category and metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {blog.Category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {blog.Category}
              </span>
            )}
            <time className="text-sm text-neutral-600 dark:text-neutral-400">
              {transformed.formattedDate}
            </time>
            {transformed.readingTime && (
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {transformed.readingTime} {language === 'zh' ? '分钟阅读' : 'min read'}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            {blog.Title}
          </h1>

          {/* Description/Subtitle */}
          {blog.Description && (
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              {blog.Description}
            </p>
          )}

          {/* Author and Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              {blog.Author && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                    {blog.Author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {blog.Author}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {language === 'zh' ? '作者' : 'Author'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {blog.Tags && blog.Tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.Tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
