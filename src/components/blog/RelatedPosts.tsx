'use client';

import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/utils/cloudinary-optimizer';
import Link from 'next/link';
import { BlogPost, transformBlog } from '@/lib/strapi/blogs';

interface RelatedPostsProps {
  posts: BlogPost[];
  language: 'en' | 'zh';
  title?: string;
}

function RelatedCard({ post, language, featured = false }: { post: BlogPost; language: 'en' | 'zh'; featured?: boolean }) {
  const transformed = transformBlog(post);
  const baseUrl = language === 'zh' ? '/zh/blog' : '/blog';

  if (featured) {
    return (
      <Link
        href={`${baseUrl}/${post.Slug}`}
        className="group relative flex flex-col overflow-hidden rounded-sm"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
      >
        {/* Large image */}
        <div className="relative w-full h-56 overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e] flex-shrink-0">
          {transformed.featuredImageUrl ? (
            <Image
              src={optimizeCloudinaryUrl(transformed.featuredImageUrl)}
              alt={post.Title}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#191970]/10 to-[#ffd700]/10">
              <span className="text-5xl font-bold text-[#191970]/20 dark:text-[#ffd700]/20">{post.Title.charAt(0)}</span>
            </div>
          )}
          {/* Dark gradient overlay bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Category pill on image */}
          {post.Category && (
            <span className="absolute top-3 left-3 text-[10px] font-bold text-white uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: '#191970' }}>
              {post.Category}
            </span>
          )}

          {/* Title overlaid on image bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-[#ffd700] transition-colors duration-200">
              {post.Title}
            </h3>
          </div>
        </div>

        {/* Meta strip */}
        <div className="bg-white dark:bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-t-2 border-[#191970] dark:border-[#a67c00]">
          <time className="text-[11px] text-[#666] dark:text-[#b0b0b0]">{transformed.formattedDate}</time>
          <span className="text-[11px] text-[#666] dark:text-[#b0b0b0]">
            {transformed.readingTime} {language === 'zh' ? '分钟' : 'min read'}
          </span>
          <span className="text-xs font-semibold text-[#191970] dark:text-[#ffd700] group-hover:gap-2 flex items-center gap-1 transition-all">
            {language === 'zh' ? '阅读' : 'Read'}
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </span>
        </div>
      </Link>
    );
  }

  // Compact horizontal card for non-featured
  return (
    <Link
      href={`${baseUrl}/${post.Slug}`}
      className="group flex gap-3 p-3 rounded-sm bg-white dark:bg-[#1a1a1a] hover:bg-[#f8f9fa] dark:hover:bg-[#222] transition-colors border-l-2 border-transparent hover:border-[#191970] dark:hover:border-[#ffd700]"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-sm bg-[#f8f9fa] dark:bg-[#1e1e1e]">
        {transformed.featuredImageUrl ? (
          <Image
            src={optimizeCloudinaryUrl(transformed.featuredImageUrl)}
            alt={post.Title}
            fill
            className="object-cover group-hover:scale-[1.06] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl font-bold text-[#191970]/20 dark:text-[#ffd700]/20">{post.Title.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {post.Category && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#191970] dark:text-[#ffd700] block mb-0.5">
              {post.Category}
            </span>
          )}
          <h4 className="text-xs font-semibold text-[#111] dark:text-white line-clamp-2 leading-snug group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors">
            {post.Title}
          </h4>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <time className="text-[10px] text-[#999] dark:text-[#666]">{transformed.formattedDate}</time>
          {transformed.readingTime && (
            <>
              <span className="text-[10px] text-[#ccc] dark:text-[#555]">·</span>
              <span className="text-[10px] text-[#999] dark:text-[#666]">
                {transformed.readingTime} {language === 'zh' ? '分' : 'min'}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function RelatedPosts({ posts, language, title }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  const defaultTitle = language === 'zh' ? '相关文章' : 'Related Articles';
  const [featured, ...rest] = posts;

  return (
    <section className="py-10">
      {/* Section header with decorative line */}
      <div className="flex items-center gap-4 mb-6">
        {/* Left accent */}
        <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to bottom,#191970,#ffd700)' }} />
        <h2 className="text-xl font-bold text-[#111] dark:text-white tracking-tight">
          {title || defaultTitle}
        </h2>
        {/* Decorative rule */}
        <div className="flex-1 h-px bg-gradient-to-r from-[#191970]/20 to-transparent dark:from-[#ffd700]/20" />
        {/* Post count badge */}
        <span className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: '#191970' }}>
          {posts.length} {language === 'zh' ? '篇' : posts.length === 1 ? 'post' : 'posts'}
        </span>
      </div>

      {posts.length === 1 ? (
        /* Single post — full width featured */
        <RelatedCard post={featured} language={language} featured />
      ) : posts.length === 2 ? (
        /* Two posts — both featured side by side */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((p) => <RelatedCard key={p.id} post={p} language={language} featured />)}
        </div>
      ) : (
        /* 3+ posts — featured left, compact list right */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Featured card — takes 3/5 width */}
          <div className="md:col-span-3">
            <RelatedCard post={featured} language={language} featured />
          </div>

          {/* Compact list — takes 2/5 width */}
          <div className="md:col-span-2 flex flex-col gap-3 justify-between">
            {rest.slice(0, 3).map((post) => (
              <RelatedCard key={post.id} post={post} language={language} />
            ))}
          </div>
        </div>
      )}

      {/* "More articles" footer link */}
      <div className="mt-6 text-center">
        <Link
          href={language === 'zh' ? '/zh/blog' : '/blog'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#191970] dark:text-[#ffd700] hover:underline transition-colors group"
        >
          <span className="w-5 h-px bg-[#191970] dark:bg-[#ffd700] group-hover:w-8 transition-all" />
          {language === 'zh' ? '浏览所有文章' : 'Browse all articles'}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
          <span className="w-5 h-px bg-[#191970] dark:bg-[#ffd700] group-hover:w-8 transition-all" />
        </Link>
      </div>
    </section>
  );
}