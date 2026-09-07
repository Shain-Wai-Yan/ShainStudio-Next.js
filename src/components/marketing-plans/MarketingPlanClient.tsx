'use client';

import { useState } from 'react';
import { transformMarketingPlan, type MarketingPlan } from '@/lib/strapi/marketing-plans';
import { DocumentGrid } from '@/components/DocumentGrid';
import dynamic from 'next/dynamic';
const DocumentViewer = dynamic(() => import('@/components/DocumentViewer').then(m => m.DocumentViewer), { ssr: false });
import { Breadcrumb } from '@/components/Breadcrumb';

// Match the Document interface from DocumentGrid
interface Document {
  id: number;
  Title: string;
  Description: string;
  formattedDate: string;
  coverImageUrl: string;
  fileType: string;
  documentUrl: string;
}

type TransformedPlan = Document;

import { type Dictionary } from '@/lib/getDictionary';

interface MarketingPlanClientProps {
  locale: string;
  initialPlans: TransformedPlan[];
  initialError: string | null;
  dict: Pick<Dictionary, 'nav' | 'marketingPlans'>;
}

export function MarketingPlanClient({ locale, dict, initialPlans, initialError }: MarketingPlanClientProps) {
  const [plans, setPlans] = useState<TransformedPlan[]>(initialPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [selectedDocument, setSelectedDocument] = useState<TransformedPlan | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const loadMarketingPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/marketing-plans');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rawPlans: MarketingPlan[] = json?.data || [];
      const transformedPlans = rawPlans.map(transformMarketingPlan) as TransformedPlan[];
      setPlans(transformedPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
      setPlans([]);
    }

    setIsLoading(false);
  };

  const handleDocumentClick = (document: Document) => {
    // Document type is already compatible with TransformedPlan
    setSelectedDocument(document as TransformedPlan);
    setIsViewerOpen(true);
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  // Fixed the breadcrumb href to match folder 'marketing-plans' instead of singular
  const breadcrumbItems = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.portfolio, href: `/${locale}/portfolio` },
    { label: dict.marketingPlans.title, href: `/${locale}/portfolio/marketing-plans` },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#121212] dark:to-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-[#d4af37] mb-3 md:mb-4 leading-tight">
              {dict.marketingPlans.title}
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 dark:text-[#b0b0b0] max-w-2xl leading-relaxed">
              {dict.marketingPlans.description}
            </p>
          </div>

          {/* Document Grid */}
          <section aria-labelledby="documents-heading">
            <h2 id="documents-heading" className="sr-only">
              {dict.marketingPlans.documentsHeading}
            </h2>
            <DocumentGrid
              documents={plans}
              isLoading={isLoading}
              error={error}
              onDocumentClick={handleDocumentClick}
              onRetry={loadMarketingPlans}
              emptyMessage={dict.marketingPlans.emptyMessage}
            />
          </section>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          isOpen={isViewerOpen}
          documentUrl={selectedDocument.documentUrl}
          title={selectedDocument.Title}
          onClose={handleViewerClose}
        />
      )}
    </>
  );
}
