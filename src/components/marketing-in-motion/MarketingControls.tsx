'use client';

import { useCallback, useState } from 'react';
import type { FilterOptions } from '@/lib/strapi/marketing-in-motion';

interface MarketingControlsProps {
  search: string;
  filters: { category: string; tools: string; tag: string; type: string };
  filterOptions: FilterOptions;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof MarketingControlsProps['filters'], value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  labels: {
    searchPlaceholder: string;
    allCategories: string;
    allTools: string;
    allTags: string;
    allTypes: string;
    refresh: string;
  };
}

export function MarketingControls({
  search,
  filters,
  filterOptions,
  onSearchChange,
  onFilterChange,
  onRefresh,
  isRefreshing,
  labels,
}: MarketingControlsProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange],
  );

  const activeFilterCount = [
    filters.category,
    filters.tools,
    filters.tag,
    filters.type,
  ].filter(Boolean).length;

  const hasAnyActive = search.length > 0 || activeFilterCount > 0;

  const handleClearAll = useCallback(() => {
    onSearchChange('');
    onFilterChange('category', '');
    onFilterChange('tools', '');
    onFilterChange('tag', '');
    onFilterChange('type', '');
  }, [onSearchChange, onFilterChange]);

  return (
    <section
      className="sticky top-[70px] z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm"
      aria-label="Filter controls"
    >
      {/* ── Desktop row ─────────────────────────────────────────────────────── */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 py-3 items-center gap-2 flex-wrap">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={handleSearch}
          onClear={() => onSearchChange('')}
          placeholder={labels.searchPlaceholder}
        />

        {/* Filter selects */}
        <Select value={filters.category} onChange={(v) => onFilterChange('category', v)} options={filterOptions.categories} defaultLabel={labels.allCategories} />
        <Select value={filters.tools} onChange={(v) => onFilterChange('tools', v)} options={filterOptions.tools} defaultLabel={labels.allTools} />
        <Select value={filters.tag} onChange={(v) => onFilterChange('tag', v)} options={filterOptions.tags} defaultLabel={labels.allTags} />
        <Select value={filters.type} onChange={(v) => onFilterChange('type', v)} options={filterOptions.types} defaultLabel={labels.allTypes} />

        {/* Clear */}
        {hasAnyActive && (
          <button onClick={handleClearAll} className="h-10 px-3 text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none">
            Clear all
          </button>
        )}

        {/* Refresh */}
        <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} label={labels.refresh} />
      </div>

      {/* ── Mobile layout ────────────────────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Top row: search + filter toggle + refresh */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          {/* Search — takes all remaining space */}
          <div className="flex-1 min-w-0">
            <SearchInput
              value={search}
              onChange={handleSearch}
              onClear={() => onSearchChange('')}
              placeholder={labels.searchPlaceholder}
            />
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-label="Toggle filters"
            className={`
              relative flex-shrink-0 flex items-center gap-1.5 h-10 px-3
              border text-xs font-semibold transition-all duration-150
              focus:outline-none focus-visible:ring-1 focus-visible:ring-[#191970]
              ${filtersOpen || activeFilterCount > 0
                ? 'bg-[#191970] dark:bg-[#a67c00] text-white border-[#191970] dark:border-[#a67c00]'
                : 'bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}
            `}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#ffd700] text-[#191970] text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Refresh */}
          <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} label={labels.refresh} />
        </div>

        {/* Expandable filter panel */}
        {filtersOpen && (
          <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-[#1a1a1a]/80">
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Select value={filters.category} onChange={(v) => onFilterChange('category', v)} options={filterOptions.categories} defaultLabel={labels.allCategories} fullWidth />
              <Select value={filters.tools} onChange={(v) => onFilterChange('tools', v)} options={filterOptions.tools} defaultLabel={labels.allTools} fullWidth />
              <Select value={filters.tag} onChange={(v) => onFilterChange('tag', v)} options={filterOptions.tags} defaultLabel={labels.allTags} fullWidth />
              <Select value={filters.type} onChange={(v) => onFilterChange('type', v)} options={filterOptions.types} defaultLabel={labels.allTypes} fullWidth />
            </div>

            {/* Clear + close row */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              {hasAnyActive ? (
                <button onClick={handleClearAll} className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 transition-colors">
                  Clear all filters
                </button>
              ) : (
                <span className="text-xs text-gray-400">No active filters</span>
              )}
              <button onClick={() => setFiltersOpen(false)} className="text-xs font-semibold text-[#191970] dark:text-[#d4af37] hover:underline">
                Done
              </button>
            </div>
          </div>
        )}

        {/* Active filter chips (always visible on mobile if any) */}
        {hasAnyActive && (
          <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
            {search && <Chip label={`"${search}"`} onRemove={() => onSearchChange('')} />}
            {filters.category && <Chip label={filters.category} onRemove={() => onFilterChange('category', '')} />}
            {filters.tools && <Chip label={filters.tools} onRemove={() => onFilterChange('tools', '')} />}
            {filters.tag && <Chip label={`#${filters.tag}`} onRemove={() => onFilterChange('tag', '')} />}
            {filters.type && <Chip label={filters.type} onRemove={() => onFilterChange('type', '')} />}
          </div>
        )}
      </div>

      {/* ── Desktop active chips ─────────────────────────────────────────────── */}
      {hasAnyActive && (
        <div className="hidden md:flex items-center gap-1.5 max-w-7xl mx-auto px-4 sm:px-6 pb-2 flex-wrap">
          {search && <Chip label={`Search: "${search}"`} onRemove={() => onSearchChange('')} />}
          {filters.category && <Chip label={`Category: ${filters.category}`} onRemove={() => onFilterChange('category', '')} />}
          {filters.tools && <Chip label={`Tool: ${filters.tools}`} onRemove={() => onFilterChange('tools', '')} />}
          {filters.tag && <Chip label={`Tag: #${filters.tag}`} onRemove={() => onFilterChange('tag', '')} />}
          {filters.type && <Chip label={`Type: ${filters.type}`} onRemove={() => onFilterChange('type', '')} />}
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SearchInput({
  value, onChange, onClear, placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="
          w-full pl-9 pr-8 h-10
          border border-gray-200 dark:border-gray-700
          bg-white dark:bg-[#1e1e1e]
          text-gray-900 dark:text-[#e0e0e0] text-sm
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:border-[#191970] dark:focus:border-[#a67c00]
          focus:ring-1 focus:ring-[#191970]/20 dark:focus:ring-[#a67c00]/20
          transition-all duration-150
        "
      />
      {value && (
        <button onClick={onClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Clear search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      )}
    </div>
  );
}

function Select({
  value, onChange, options, defaultLabel, fullWidth,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  defaultLabel: string;
  fullWidth?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={defaultLabel}
      className={`
        h-10 px-3
        border border-gray-200 dark:border-gray-700
        bg-white dark:bg-[#1e1e1e]
        text-gray-800 dark:text-[#e0e0e0]
        text-sm font-medium
        appearance-none cursor-pointer
        hover:border-gray-300 dark:hover:border-gray-600
        focus:outline-none focus:border-[#191970] dark:focus:border-[#a67c00]
        focus:ring-1 focus:ring-[#191970]/10 dark:focus:ring-[#a67c00]/20
        transition-all duration-150
        ${fullWidth ? 'w-full' : 'min-w-[120px]'}
        ${value ? 'text-[#191970] dark:text-[#d4af37] border-[#191970]/40 dark:border-[#a67c00]/40' : ''}
      `}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '28px',
      }}
    >
      <option value="">{defaultLabel}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function RefreshButton({ onClick, isRefreshing, label }: { onClick: () => void; isRefreshing: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={isRefreshing}
      aria-label={label}
      title={label}
      className="
        flex-shrink-0 flex items-center justify-center w-10 h-10
        border border-gray-200 dark:border-gray-700
        bg-white dark:bg-[#1e1e1e]
        text-[#191970] dark:text-[#d4af37]
        hover:bg-[#191970] dark:hover:bg-[#a67c00]
        hover:text-white dark:hover:text-white
        hover:border-[#191970] dark:hover:border-[#a67c00]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        focus:outline-none focus:ring-1 focus:ring-[#191970]/30
      "
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true">
        <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
        <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
      </svg>
    </button>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-[10px] font-medium bg-[#191970]/8 dark:bg-[#a67c00]/12 text-[#191970] dark:text-[#d4af37] border border-[#191970]/15 dark:border-[#a67c00]/20 max-w-[160px]">
      <span className="truncate">{label}</span>
      <button onClick={onRemove} className="flex-shrink-0 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label={`Remove ${label} filter`}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </span>
  );
}