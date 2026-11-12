import type { ContentLocalization } from '@/types/localization';

export default function ContentLanguageNotice({ localization, compact = false }: { localization?: ContentLocalization; compact?: boolean }) {
  if (!localization?.isFallback) return null;
  return <p data-content-language="en" className={compact ? 'mt-2 text-xs text-stone-500 dark:text-stone-400' : 'my-4 rounded-xl border border-stone-300 px-4 py-3 text-sm text-stone-700 dark:border-white/20 dark:text-stone-300'}>
    <span lang="en">English version — Chinese translation pending</span>
    {!compact && <span lang="zh-CN" className="ml-2">中文版尚未发布，当前显示英文内容。</span>}
  </p>;
}
