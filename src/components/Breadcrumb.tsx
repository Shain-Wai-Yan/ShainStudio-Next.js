import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm mb-6 sm:mb-8 select-none"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.href} className="flex items-center gap-2">
            <Link
              href={item.href}
              className={`transition-colors ${
                isLast
                  ? 'text-blue-700 dark:text-[#ffd700] font-medium'
                  : 'text-blue-600 hover:text-blue-700 dark:text-amber-400/80 dark:hover:text-[#ffd700]'
              }`}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </Link>
            {!isLast && (
              <span className="text-gray-400 dark:text-amber-400/50" aria-hidden="true">
                ›
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
