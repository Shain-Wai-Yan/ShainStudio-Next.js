'use client';

import { useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Grid, List, Compass, X, Calendar, ChevronDown } from 'lucide-react';
import { VaultHero } from './VaultHero';
import { PrestigeStats } from './PrestigeStats';
import { CertificateCard } from './CertificateCard';
import { CertificateTimelineRow } from './CertificateTimelineRow';
import { ShowcaseCarousel3D } from './ShowcaseCarousel3D';
import dynamic from 'next/dynamic';
const CertificateModal = dynamic(() => import('./CertificateModal').then(m => m.CertificateModal), { ssr: false });
import { Certificate, transformCertificate } from '@/lib/strapi/certificates';

interface CertificateVaultClientProps {
  certificates: Certificate[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  locale: string;
}

// ─── Inner component that reads URL search params ──────────────────────────────
function CertificateVaultInner({
  certificates,
  dictionary,
}: Omit<CertificateVaultClientProps, 'locale'>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Read state from URL ────────────────────────────────────────────────────
  const searchQuery  = searchParams.get('q')      ?? '';
  const activeIssuer = searchParams.get('issuer') ?? 'all';
  const activeYear   = searchParams.get('year')   ?? 'all';
  const activeLayout = (searchParams.get('layout') ?? 'grid') as 'grid' | 'timeline' | 'showcase';
  const selectedId   = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const t = dictionary.certificate;

  // ── URL param updater helper ───────────────────────────────────────────────
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all' || value === 'grid' || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  // ── Data transforms ────────────────────────────────────────────────────────
  const transformed = useMemo(() => certificates.map(transformCertificate), [certificates]);

  const classified = useMemo(() =>
    transformed.map(cert => {
      let year = 'Unknown';
      if (cert.Date) {
        const d = new Date(cert.Date);
        if (!isNaN(d.getTime())) year = d.getFullYear().toString();
      }
      return { ...cert, year };
    }), [transformed]);

  const uniqueIssuers = useMemo(() => {
    const set = new Set<string>();
    classified.forEach(c => { if (c.IssuedBy) set.add(c.IssuedBy); });
    return Array.from(set);
  }, [classified]);

  const uniqueYears = useMemo(() => {
    const set = new Set<string>();
    classified.forEach(c => { if (c.year && c.year !== 'Unknown') set.add(c.year); });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [classified]);

  const uniqueErasCount = uniqueYears.length;

  const filtered = useMemo(() =>
    classified.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        c.Title.toLowerCase().includes(q) ||
        c.Description.toLowerCase().includes(q) ||
        c.IssuedBy.toLowerCase().includes(q);
      const matchesIssuer = activeIssuer === 'all' || c.IssuedBy === activeIssuer;
      const matchesYear   = activeYear   === 'all' || c.year      === activeYear;
      return matchesSearch && matchesIssuer && matchesYear;
    }), [classified, searchQuery, activeIssuer, activeYear]);

  const heroStackCertificates = useMemo(() =>
    classified.slice(0, 3).map(cert => ({
      id: cert.id,
      title: cert.Title,
      issuedBy: cert.IssuedBy,
      imageUrl: cert.imageUrl,
      formattedDate: cert.formattedDate,
    })), [classified]);

  const selectedIndex      = classified.findIndex(c => c.id === selectedId);
  const selectedCertificate = classified[selectedIndex] ?? null;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-20">

      {/* Hero */}
      <VaultHero
        certificates={heroStackCertificates}
        dictionary={dictionary}
        onCardClick={(id) => updateParam('id', String(id))}
      />

      {/* Stats */}
      <PrestigeStats
        certificatesCount={classified.length}
        uniqueIssuersCount={uniqueIssuers.length}
        categoriesCount={uniqueErasCount}
        dictionary={dictionary}
      />

      {/* Vault Console */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch lg:items-center pb-8 border-b border-gray-100 dark:border-gray-900">

          {/* Search + Year filter */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
              <input
                id="cert-search"
                type="search"
                value={searchQuery}
                onChange={(e) => updateParam('q', e.target.value)}
                placeholder={t.search}
                aria-label="Search certificates"
                className="
                  w-full pl-10 pr-10 py-3 rounded-xl
                  bg-gray-50/50 dark:bg-gray-900/40 backdrop-blur-md
                  border border-gray-200/50 dark:border-gray-800
                  focus:ring-2 focus:ring-[#ffd700]/30 focus:border-[#ffd700]
                  text-sm transition-all duration-300
                "
              />
              {searchQuery && (
                <button
                  onClick={() => updateParam('q', '')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Year Selector */}
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none z-10" />
              <select
                id="cert-year-filter"
                value={activeYear}
                onChange={(e) => updateParam('year', e.target.value)}
                aria-label="Filter by year"
                className="
                  w-full sm:w-[220px] py-3 pl-10 pr-9 rounded-xl appearance-none cursor-pointer
                  bg-gray-50/50 dark:bg-gray-900/40 backdrop-blur-md
                  border border-stone-200/60 dark:border-stone-800
                  focus:ring-2 focus:ring-[#e05b3e]/20 focus:border-[#e05b3e]/50
                  text-sm font-semibold transition-all duration-300
                "
              >
                <option value="all">{t.allCategories}</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none" />
            </div>
          </div>

          {/* Layout Toggles */}
          <div className="flex gap-2 items-center self-center lg:self-auto bg-gray-50/80 dark:bg-gray-900/60 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
            {([
              { key: 'grid',     label: t.viewGrid,     Icon: Grid    },
              { key: 'timeline', label: t.viewTimeline, Icon: List    },
              { key: 'showcase', label: t.viewShowcase, Icon: Compass },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                id={`layout-${key}`}
                onClick={() => updateParam('layout', key)}
                aria-pressed={activeLayout === key}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300
                  ${activeLayout === key
                    ? 'bg-white dark:bg-gray-950 text-[#191970] dark:text-[#ffd700] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }
                `}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Issuer chips */}
        <nav aria-label="Filter by issuer" className="flex gap-2 overflow-x-auto py-4 no-scrollbar border-b border-gray-50 dark:border-gray-900/60 scroll-smooth">
          <button
            onClick={() => updateParam('issuer', 'all')}
            aria-pressed={activeIssuer === 'all'}
            className={`
              flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300
              ${activeIssuer === 'all'
                ? 'bg-[#191970] dark:bg-[#ffd700] text-white dark:text-[#191970]'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/40 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
              }
            `}
          >
            {t.allIssuers}
          </button>

          {uniqueIssuers.map(issuer => (
            <button
              key={issuer}
              onClick={() => updateParam('issuer', issuer)}
              aria-pressed={activeIssuer === issuer}
              className={`
                flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300
                ${activeIssuer === issuer
                  ? 'bg-[#191970] dark:bg-[#ffd700] text-white dark:text-[#191970]'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/40 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                }
              `}
            >
              {issuer}
            </button>
          ))}
        </nav>

        {/* Certificate list */}
        <section aria-label="Certificate collection" className="pt-10">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <Compass className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 animate-pulse mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1">
                {t.labels.noData || 'No credentials found'}
              </p>
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                Try resetting your filters or search queries
              </p>
            </div>
          ) : activeLayout === 'showcase' ? (
            <ShowcaseCarousel3D
              certificates={filtered.map(c => ({ id: c.id, title: c.Title, issuedBy: c.IssuedBy, imageUrl: c.imageUrl }))}
              onCertificateClick={(id) => updateParam('id', String(id))}
            />
          ) : activeLayout === 'timeline' ? (
            <ol className="max-w-4xl mx-auto list-none p-0">
              {filtered.map((cert, index) => (
                <li key={cert.id}>
                  <CertificateTimelineRow
                    certificate={{
                      id: cert.id,
                      title: cert.Title,
                      description: cert.Description,
                      issuedBy: cert.IssuedBy,
                      formattedDate: cert.formattedDate,
                    }}
                    onClick={(id) => updateParam('id', String(id))}
                    index={index}
                    isLast={index === filtered.length - 1}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0">
              {filtered.map(cert => (
                <li key={cert.id} className="aspect-[4/3] w-full">
                  <CertificateCard
                    title={cert.Title}
                    issuedBy={cert.IssuedBy}
                    imageUrl={cert.imageUrl}
                    onClick={() => updateParam('id', String(cert.id))}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={{
            id: selectedCertificate.id,
            title: selectedCertificate.Title,
            description: selectedCertificate.Description,
            imageUrl: selectedCertificate.imageUrl,
            issuedBy: selectedCertificate.IssuedBy,
            formattedDate: selectedCertificate.formattedDate,
          }}
          isOpen={selectedId !== null}
          onClose={() => updateParam('id', null)}
          onNext={() => {
            const next = classified[(selectedIndex + 1) % classified.length];
            updateParam('id', String(next.id));
          }}
          onPrevious={() => {
            const prev = classified[(selectedIndex - 1 + classified.length) % classified.length];
            updateParam('id', String(prev.id));
          }}
          hasNext={classified.length > 1}
          hasPrevious={classified.length > 1}
        />
      )}
    </div>
  );
}

// ─── Public export wrapped in Suspense (required by useSearchParams) ───────────
export function CertificateVaultClient(props: CertificateVaultClientProps) {
  return (
    <Suspense fallback={
      <div className="bg-white dark:bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-[#e05b3e] animate-spin" />
          <p className="text-stone-400 text-sm tracking-widest uppercase font-mono">Loading Vault…</p>
        </div>
      </div>
    }>
      <CertificateVaultInner {...props} />
    </Suspense>
  );
}
