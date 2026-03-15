'use client';

import { useState } from 'react';

interface BlogFilterBarProps {
  categories: string[];
  tags: string[];
  language: 'en' | 'zh';
  onCategoryChange?: (category: string) => void;
  onTagChange?: (tag: string) => void;
}

export default function BlogFilterBar({ categories, tags, language, onCategoryChange, onTagChange }: BlogFilterBarProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const handleCategory = (cat: string) => {
    setSelectedCategory(cat);
    onCategoryChange?.(cat);
  };

  const handleTag = (tag: string) => {
    const next = new Set(selectedTags);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    setSelectedTags(next);
    onTagChange?.(Array.from(next).join(','));
  };

  return (
    <div className="space-y-4 pt-3">
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#333] dark:text-[#e0e0e0] uppercase tracking-wider mb-2">
            {language === 'zh' ? '分类' : 'Categories'}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(selectedCategory === cat ? '' : cat)}
                className="px-3 py-1.5 text-xs font-medium rounded-sm transition-all"
                style={{
                  background: selectedCategory === cat ? '#191970' : 'rgba(25,25,112,0.08)',
                  color: selectedCategory === cat ? '#fff' : '#191970',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#333] dark:text-[#e0e0e0] uppercase tracking-wider mb-2">
            {language === 'zh' ? '标签' : 'Tags'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTag(tag)}
                className="px-2.5 py-1 text-[11px] rounded-full transition-all"
                style={{
                  background: selectedTags.has(tag) ? '#191970' : 'rgba(25,25,112,0.06)',
                  color: selectedTags.has(tag) ? '#fff' : '#191970',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {(selectedCategory || selectedTags.size > 0) && (
        <button
          onClick={() => { setSelectedCategory(''); setSelectedTags(new Set()); onCategoryChange?.(''); onTagChange?.(''); }}
          className="text-xs text-[#191970] dark:text-[#ffd700] hover:underline"
        >
          {language === 'zh' ? '清除筛选' : 'Clear Filters'}
        </button>
      )}
    </div>
  );
}