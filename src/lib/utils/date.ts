/**
 * Date formatting utilities
 */

export function formatDate(date: string | Date, locale: 'en' | 'zh' = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | Date, locale: 'en' | 'zh' = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);
  const diffMonths = Math.floor(diffMs / 2592000000);
  const diffYears = Math.floor(diffMs / 31536000000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}
