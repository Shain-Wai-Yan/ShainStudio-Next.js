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
      className="flex items-center gap-2 text-sm mb-8"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          <Link
            href={item.href}
            className="text-blue-600 hover:text-blue-700 transition-colors"
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {item.label}
          </Link>
          {index < items.length - 1 && (
            <span className="text-gray-400" aria-hidden="true">
              ›
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
