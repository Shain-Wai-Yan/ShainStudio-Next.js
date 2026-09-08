'use client';

import { useState } from 'react';
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

interface BusinessPlanDictionary {
  nav: { home: string; portfolio: string };
  businessPlans: {
    title: string;
    description: string;
    emptyMessage: string;
  };
}

interface Props {
  locale: 'en' | 'zh';
  initialPlans: TransformedPlan[];
  initialError: string | null;
  t: BusinessPlanDictionary;
}

export default function BusinessPlanClient({ locale, t, initialPlans, initialError }: Props) {

  const [plans, setPlans] = useState<TransformedPlan[]>(initialPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [selectedDocument, setSelectedDocument] = useState<TransformedPlan | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const loadBusinessPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/business-plans');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPlans((json?.data || []) as TransformedPlan[]);
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

  const breadcrumbItems = [
    { label: t.nav.home, href: `/${locale}` },
    { label: t.nav.portfolio, href: `/${locale}/portfolio` },
    { label: t.businessPlans.title, href: `/${locale}/portfolio/business-plans` },
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
              {t.businessPlans.title}
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 dark:text-[#b0b0b0] max-w-2xl leading-relaxed">
              {t.businessPlans.description}
            </p>
          </div>

          {/* Document Grid */}
          <section aria-labelledby="documents-heading">
            <h2 id="documents-heading" className="sr-only">
              {t.businessPlans.title} Documents
            </h2>
            <DocumentGrid
              documents={plans}
              isLoading={isLoading}
              error={error}
              onDocumentClick={handleDocumentClick}
              onRetry={loadBusinessPlans}
              emptyMessage={t.businessPlans.emptyMessage}
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
