'use client';

import { useEffect, useState } from 'react';
import { fetchMarketingPlans, transformMarketingPlan, type MarketingPlan } from '@/lib/strapi/marketing-plans';
import { DocumentGrid } from '@/components/DocumentGrid';
import { DocumentViewer } from '@/components/DocumentViewer';
import { Breadcrumb } from '@/components/Breadcrumb';

interface TransformedPlan extends Omit<MarketingPlan, 'DocumentFile' | 'CoverImage'> {
  documentUrl: string;
  coverImageUrl: string;
  fileType: string;
  formattedDate: string;
}

export default function MarketingPlanPage() {
  const [plans, setPlans] = useState<TransformedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<TransformedPlan | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    loadMarketingPlans();
  }, []);

  const loadMarketingPlans = async () => {
    setIsLoading(true);
    setError(null);

    const { plans: fetchedPlans, error: fetchError } = await fetchMarketingPlans();

    if (fetchError) {
      setError(fetchError);
      setPlans([]);
    } else {
      const transformedPlans = fetchedPlans.map(transformMarketingPlan) as TransformedPlan[];
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
    { label: 'Marketing Plans', href: '/portfolio/marketing-plan' },
  ];

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Marketing Plans
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Innovative tactics designed to engage audiences and boost brand visibility with comprehensive marketing strategies.
            </p>
          </div>

          {/* Document Grid */}
          <section aria-labelledby="documents-heading">
            <h2 id="documents-heading" className="sr-only">
              Marketing Plan Documents
            </h2>
            <DocumentGrid
              documents={plans}
              isLoading={isLoading}
              error={error}
              onDocumentClick={handleDocumentClick}
              onRetry={loadMarketingPlans}
              emptyMessage="No marketing plans available at this time."
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
