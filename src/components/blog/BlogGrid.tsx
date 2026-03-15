'use client';

import { BlogPost } from '@/lib/strapi/blogs';
import BlogCard from './BlogCard';

interface BlogGridProps {
  blogs: BlogPost[];
  language: 'en' | 'zh';
  variant?: 'grid' | 'list';
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export default function BlogGrid({
  blogs,
  language,
  variant = 'grid',
  isLoading = false,
  isEmpty = false,
  emptyMessage,
}: BlogGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 rounded-sm bg-[#f8f9fa] dark:bg-[#1e1e1e] animate-pulse" />
        ))}
      </div>
    );
  }

  if (isEmpty || blogs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#666] dark:text-[#b0b0b0] text-lg">
          {emptyMessage || (language === 'zh' ? '暂无博文' : 'No posts found')}
        </p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div>
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} language={language} variant="list" />
        ))}
      </div>
    );
  }

  return (
    /* 4 columns on large screens, 2 on md, 1 on mobile — matches vanilla auto-fill 300px */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} language={language} variant="grid" />
      ))}
    </div>
  );
}