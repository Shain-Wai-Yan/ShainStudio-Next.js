'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/lib/strapi/blogs';
import BlogGrid from './BlogGrid';

// ── debounce helper (avoids importing from utils) ──────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface BlogListingClientProps {
  allBlogs: BlogPost[];
  categories: string[];
  tags: string[];
  language: 'en' | 'zh';
  error: string | null;
}

export default function BlogListingClient({ allBlogs, categories, tags, language, error }: BlogListingClientProps) {
  const [searchInput, setSearchInput]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag]       = useState('');
  const [showFilters, setShowFilters]       = useState(false);

  const debouncedSearch = useDebounce(searchInput, 280);

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = allBlogs;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.Title.toLowerCase().includes(q) ||
          (b.Description ?? '').toLowerCase().includes(q) ||
          (b.Content ?? '').toLowerCase().includes(q) ||
          (b.Tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
          (b.Category ?? '').toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      const cat = selectedCategory.toLowerCase().trim();
      result = result.filter((b) => (b.Category ?? '').toLowerCase().trim() === cat);
    }

    if (selectedTag) {
      const tag = selectedTag.toLowerCase().trim();
      result = result.filter((b) => (b.Tags ?? []).some((t) => t.toLowerCase().trim() === tag));
    }

    return result;
  }, [allBlogs, debouncedSearch, selectedCategory, selectedTag]);

  const clearAll = () => { setSearchInput(''); setSelectedCategory(''); setSelectedTag(''); };
  const hasFilters = searchInput || selectedCategory || selectedTag;

  if (error) {
    return (
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 bg-[#f8f9fa] dark:bg-[#1e1e1e] rounded-sm">
          <p className="text-[#dc3545] dark:text-[#ff6b6b]">Failed to load blog posts. Please try again.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Controls bar ── */}
        <div className="flex gap-3 items-center mb-3">
          {/* Search input */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={language === 'zh' ? '搜索文章...' : 'Search posts...'}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-[#1e1e1e] text-[#333] dark:text-[#e0e0e0] placeholder-[#999] border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/20 transition-all"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#191970] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Category select — matches vanilla .filter-select */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2.5 px-3 text-sm bg-white dark:bg-[#1e1e1e] text-[#333] dark:text-[#e0e0e0] border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/20 cursor-pointer transition-all min-w-[140px]"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            >
              <option value="">{language === 'zh' ? '所有分类' : 'All Categories'}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {/* Tag select */}
          {tags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="py-2.5 px-3 text-sm bg-white dark:bg-[#1e1e1e] text-[#333] dark:text-[#e0e0e0] border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/20 cursor-pointer transition-all min-w-[120px] hidden md:block"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            >
              <option value="">{language === 'zh' ? '所有标签' : 'All Tags'}</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}

          {/* Filter toggle for tag pills on mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm bg-white dark:bg-[#1e1e1e] text-[#191970] dark:text-[#ffd700] transition-all hover:-translate-y-0.5 hover:bg-[#191970] hover:text-white"
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            aria-label="Toggle filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* ── Expandable tag pills panel ── */}
        {showFilters && tags.length > 0 && (
          <div className="mb-4 p-4 bg-[#f8f9fa] dark:bg-[#1e1e1e] rounded-sm" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-[10px] font-semibold text-[#666] uppercase tracking-widest mb-2">
              {language === 'zh' ? '标签' : 'Tags'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className="px-2.5 py-1 text-[11px] rounded-full transition-all"
                  style={{
                    background: selectedTag === tag ? '#191970' : 'rgba(25,25,112,0.07)',
                    color: selectedTag === tag ? '#fff' : '#191970',
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Active filter chips + result count ── */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
          <p className="text-xs text-[#666] dark:text-[#b0b0b0]">
            {language === 'zh'
              ? `显示 ${filtered.length} 篇文章`
              : `Showing ${filtered.length} post${filtered.length !== 1 ? 's' : ''}${allBlogs.length !== filtered.length ? ` of ${allBlogs.length}` : ''}`}
          </p>

          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory && (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full" style={{ background: '#191970', color: '#fff' }}>
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
              {selectedTag && (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full" style={{ background: '#191970', color: '#fff' }}>
                  #{selectedTag}
                  <button onClick={() => setSelectedTag('')} className="ml-1 hover:opacity-70">×</button>
                </span>
              )}
              <button onClick={clearAll} className="text-xs text-[#191970] dark:text-[#ffd700] hover:underline">
                {language === 'zh' ? '清除全部' : 'Clear all'}
              </button>
            </div>
          )}
        </div>

        {/* ── Grid ── */}
        <BlogGrid
          blogs={filtered}
          language={language}
          isEmpty={filtered.length === 0}
          emptyMessage={
            hasFilters
              ? (language === 'zh' ? '没有匹配的文章，请尝试其他筛选条件' : 'No posts match your filters — try clearing them')
              : (language === 'zh' ? '暂无博文' : 'No blog posts found. Check back soon!')
          }
        />
      </div>
    </section>
  );
}