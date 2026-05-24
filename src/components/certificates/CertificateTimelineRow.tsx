'use client';

import { Calendar, ChevronRight, CheckCircle } from 'lucide-react';

interface TimelineCertificate {
  id: number;
  title: string;
  description: string;
  issuedBy: string;
  formattedDate: string;
}

interface CertificateTimelineRowProps {
  certificate: TimelineCertificate;
  onClick: (id: number) => void;
  index: number;
  isLast: boolean;
}

export function CertificateTimelineRow({
  certificate,
  onClick,
  index,
  isLast,
}: CertificateTimelineRowProps) {
  // Generate first two letters of Issuer for medallion initials
  const initials = certificate.issuedBy
    ? certificate.issuedBy.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'CR';

  // Extract brief highlight skills from description
  const commonSkills = ['Strategy', 'Analysis', 'Optimization', 'Execution', 'Leadership', 'Management'];
  const matchedSkills = commonSkills.filter(skill =>
    certificate.description.toLowerCase().includes(skill.toLowerCase()) ||
    certificate.title.toLowerCase().includes(skill.toLowerCase())
  );
  const fallbackSkills = index % 3 === 0
    ? ['Marketing Campaigns', 'Data Analytics']
    : index % 3 === 1
    ? ['Strategic Planning', 'Market Valuation']
    : ['System Engineering', 'SEO Engineering'];

  const displaySkills = matchedSkills.length > 0 ? matchedSkills.slice(0, 2) : fallbackSkills;

  return (
    <article className="flex items-start gap-4 md:gap-6" aria-label={`${certificate.title} — issued by ${certificate.issuedBy}`}>

      {/* ── Left Rail Column ─────────────────────────────────────── */}
      <div className="flex flex-col items-center flex-shrink-0 self-stretch">
        {/* Medallion Node – always sits at top of the rail segment */}
        <div
          className="
            w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs tracking-wider z-10
            bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950
            border border-gray-200 dark:border-gray-800
            text-[#191970] dark:text-[#ffd700]
            shadow-inner transition-all duration-500
            group-hover:scale-110 group-hover:border-[#ffd700]/30
          "
        >
          {initials}
        </div>

        {/* Connector line – stretches to fill remaining vertical space below medallion */}
        {!isLast && (
          <div className="flex-1 w-[2px] mt-2 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-800 dark:to-transparent rounded-full" />
        )}
      </div>

      {/* ── Card Content ─────────────────────────────────────────── */}
      <div
        onClick={() => onClick(certificate.id)}
        className="
          group flex-1 flex flex-col sm:flex-row items-start gap-4 cursor-pointer
          py-5 px-5 md:px-6 mb-4 rounded-2xl
          bg-white/60 dark:bg-gray-900/20 hover:bg-white dark:hover:bg-gray-900/50 backdrop-blur-md
          border border-gray-100 dark:border-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700
          shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-[#191970]/5 dark:hover:shadow-[#a67c00]/5
          transition-all duration-500 ease-out select-none
        "
      >
        {/* Info Panel */}
        <div className="flex-1 space-y-3 min-w-0">

          {/* Title, Issuer & Date */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors leading-tight">
                {certificate.title}
              </h3>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#ffd700] dark:text-[#a67c00]" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase truncate">
                  {certificate.issuedBy}
                </span>
              </div>
            </div>

            {/* Issue Date Badge */}
            <div className="inline-flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 text-[0.7rem] font-semibold text-gray-500 dark:text-gray-400 self-start">
              <Calendar className="w-3.5 h-3.5 text-[#191970]/50 dark:text-[#ffd700]/50 flex-shrink-0" />
              {certificate.formattedDate}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {certificate.description || 'No description available for this credential. Open detail panel to view formal achievement metrics.'}
          </p>

          {/* Validated Skills Tags + View link on one row */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="
                    text-[0.65rem] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md
                    bg-[#191970]/5 dark:bg-[#a67c00]/10 border border-[#191970]/5 dark:border-[#a67c00]/20
                    text-[#191970] dark:text-[#f9df85]
                  "
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* View CTA inline */}
            <div className="flex-shrink-0 flex items-center gap-1 text-[0.65rem] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase group-hover:text-[#191970] dark:group-hover:text-[#ffd700] transition-colors">
              <span>VIEW</span>
              <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-400" />
            </div>
          </div>

        </div>
      </div>

    </article>
  );
}
