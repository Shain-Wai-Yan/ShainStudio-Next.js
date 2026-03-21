'use client';

import { useEffect, useState } from 'react';
import { fetchMarketingPlans, transformMarketingPlan } from '@/lib/strapi/marketing-plans';
import { DocumentGrid } from '@/components/DocumentGrid';
import { DocumentViewer } from '@/components/DocumentViewer';
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

interface TransformedPlan extends Document {
  // All Document properties are inherited: id, Title, Description, formattedDate, coverImageUrl, fileType, documentUrl
  // Add any additional properties your transformed plan needs here
}

interface MarketingPlanClientProps {
  locale: string;
  dict: any;
}

export function MarketingPlanClient({ locale, dict }: MarketingPlanClientProps) {
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
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#121212] dark:to-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-[#d4af37] mb-4">
              {dict.marketingPlans.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-[#b0b0b0] max-w-2xl">
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
