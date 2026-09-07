'use client';

import { useState } from 'react';
import { CertificateRow } from './CertificateRow';
import dynamic from 'next/dynamic';
const CertificateModal = dynamic(() => import('./CertificateModal').then(m => m.CertificateModal), { ssr: false });
import { Certificate, transformCertificate } from '@/lib/strapi/certificates';

interface CertificateMarqueeProps {
  certificates: Certificate[];
}

export function CertificateMarquee({ certificates }: CertificateMarqueeProps) {
  const [selectedCertificateId, setSelectedCertificateId] = useState<number | null>(null);

  const transformed = certificates.map(transformCertificate);

  const rows = {
    row1: transformed.filter((_, i) => i % 3 === 0),
    row2: transformed.filter((_, i) => i % 3 === 1),
    row3: transformed.filter((_, i) => i % 3 === 2),
  };

  const selectedIndex = transformed.findIndex((c) => c.id === selectedCertificateId);
  const selectedCertificate = transformed[selectedIndex] ?? null;

  return (
    <>
      {/* Full-width marquee section — edge to edge, no padding */}
      <div 
        className="w-full relative space-y-4 py-8 max-md:[mask-image:none] max-md:[-webkit-mask-image:none] md:[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] md:[-webkit-mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      >
        <CertificateRow
          certificates={rows.row1.map((c) => ({ id: c.id, title: c.Title, issuedBy: c.IssuedBy, imageUrl: c.imageUrl }))}
          direction="left"
          onCertificateClick={setSelectedCertificateId}
        />
        <CertificateRow
          certificates={rows.row2.map((c) => ({ id: c.id, title: c.Title, issuedBy: c.IssuedBy, imageUrl: c.imageUrl }))}
          direction="right"
          onCertificateClick={setSelectedCertificateId}
        />
        <CertificateRow
          certificates={rows.row3.map((c) => ({ id: c.id, title: c.Title, issuedBy: c.IssuedBy, imageUrl: c.imageUrl }))}
          direction="left"
          onCertificateClick={setSelectedCertificateId}
        />
      </div>

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
          isOpen={selectedCertificateId !== null}
          onClose={() => setSelectedCertificateId(null)}
          onNext={() => {
            const next = transformed[(selectedIndex + 1) % transformed.length];
            setSelectedCertificateId(next.id);
          }}
          onPrevious={() => {
            const prev = transformed[(selectedIndex - 1 + transformed.length) % transformed.length];
            setSelectedCertificateId(prev.id);
          }}
          hasNext={true}
          hasPrevious={true}
        />
      )}
    </>
  );
}