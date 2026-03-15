'use client';

import { useState } from 'react';
import BlogSearch from './BlogSearch';
import BlogFilterBar from './BlogFilterBar';

interface BlogSearchClientProps {
  categories: string[];
  tags: string[];
  language: 'en' | 'zh';
  onSearchChange?: (q: string) => void;
  onCategoryChange?: (cat: string) => void;
  onTagChange?: (tag: string) => void;
}

export default function BlogSearchClient({ categories, tags, language, onSearchChange, onCategoryChange, onTagChange }: BlogSearchClientProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div>
      {/* Controls bar — matches vanilla .blog-controls */}
      <div className="flex gap-3 items-center">
        <BlogSearch onSearch={(q) => onSearchChange?.(q)} language={language} />

        {/* Filter toggle — matches vanilla .refresh-btn style */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm bg-white dark:bg-[#1e1e1e] text-[#191970] dark:text-[#ffd700] transition-all hover:-translate-y-0.5 hover:bg-[#191970] hover:text-white dark:hover:bg-[#a67c00] dark:hover:text-white"
          style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
          aria-label={language === 'zh' ? '筛选' : 'Filters'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {showFilters && (
        <BlogFilterBar
          categories={categories}
          tags={tags}
          language={language}
          onCategoryChange={onCategoryChange}
          onTagChange={onTagChange}
        />
      )}
    </div>
  );
}