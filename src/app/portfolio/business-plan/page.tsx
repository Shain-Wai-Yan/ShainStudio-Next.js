'use client';

import { useEffect, useState } from 'react';
import { fetchBusinessPlans, transformBusinessPlan, type BusinessPlan } from '@/lib/strapi/business-plans';
import { DocumentGrid } from '@/components/DocumentGrid';
import { DocumentViewer } from '@/components/DocumentViewer';
import { Breadcrumb } from '@/components/Breadcrumb';

interface TransformedPlan extends Omit<BusinessPlan, 'DocumentFile' | 'CoverImage'> {
  documentUrl: string;
  coverImageUrl: string;
  fileType: string;
  formattedDate: string;
}

export default function BusinessPlanPage() {
  const [plans, setPlans] = useState<TransformedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<TransformedPlan | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    loadBusinessPlans();
  }, []);

  const loadBusinessPlans = async () => {
    setIsLoading(true);
    setError(null);

    const { plans: fetchedPlans, error: fetchError } = await fetchBusinessPlans();

    if (fetchError) {
      setError(fetchError);
      setPlans([]);
    } else {
      const transformedPlans = fetchedPlans.map(transformBusinessPlan) as TransformedPlan[];
      setPlans(transformedPlans);
    }

    setIsLoading(false);
  };

  const handleDocumentClick = (document: TransformedPlan) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Business Plans', href: '/portfolio/business-plan' },
  ];

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#121212] dark:to-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-[#d4af37] mb-4">
              Business Plans
            </h1>
            <p className="text-xl text-gray-600 dark:text-[#b0b0b0] max-w-2xl">
              Comprehensive strategy planning solutions to help brands elevate their market position and achieve sustainable business growth.
            </p>
          </div>

          {/* Document Grid */}
          <section aria-labelledby="documents-heading">
            <h2 id="documents-heading" className="sr-only">
              Business Plan Documents
            </h2>
            <DocumentGrid
              documents={plans}
              isLoading={isLoading}
              error={error}
              onDocumentClick={handleDocumentClick}
              onRetry={loadBusinessPlans}
              emptyMessage="No business plans available at this time."
            />
          </section>
        </div>
      </main>

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
