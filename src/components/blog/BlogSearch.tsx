'use client';

import { useState, useMemo } from 'react';
import { debounce } from '@/lib/utils/debounce';

interface BlogSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  language: 'en' | 'zh';
}

export default function BlogSearch({ onSearch, placeholder, language }: BlogSearchProps) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useMemo(
    () => debounce((q: string) => onSearch(q), 300),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="relative flex-1">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] dark:text-[#b0b0b0] pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder || (language === 'zh' ? '搜索文章...' : 'Search posts...')}
        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#1e1e1e] text-[#333] dark:text-[#e0e0e0] placeholder-[#666] dark:placeholder-[#b0b0b0] border-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#191970]/20 dark:focus:ring-[#ffd700]/20 transition-all"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onSearch(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#191970] dark:hover:text-[#ffd700] transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}