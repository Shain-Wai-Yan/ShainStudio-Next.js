'use client';

interface PinnedRepo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage?: { name: string; color: string };
  updatedAt: string;
}

interface PinnedRepositoriesProps {
  repos: PinnedRepo[];
  isLoading: boolean;
  onViewFiles: (repoName: string) => void;
}

import { useParams } from 'next/navigation';
import { getDictionarySync } from '@/lib/getDictionary';

export function PinnedRepositories({ repos, isLoading, onViewFiles }: PinnedRepositoriesProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getDictionarySync(locale).codingProjects;
  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5 text-[#191970] dark:text-[#d4af37]">{t.pinnedRepositories}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-5 animate-pulse space-y-3 h-48" />
          ))}
        </div>
      </section>
    );
  }

  if (!repos || repos.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-5 text-[#191970] dark:text-[#d4af37]">{t.pinnedRepositories}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {repos.map((repo) => {
          const updatedDate = new Date(repo.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          });
          return (
            <div key={repo.name}
              className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700
                rounded-xl p-5 hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(166,124,0,0.15)]
                transition-shadow flex flex-col">

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base leading-tight">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer"
                    className="hover:underline text-[#191970] dark:text-[#d4af37]">
                    {repo.name}
                  </a>
                </h3>
                <a href={repo.url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ml-2 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                {repo.description || t.noDescription}
              </p>

              <div className="flex flex-wrap gap-3 items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                {repo.primaryLanguage && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: repo.primaryLanguage.color }} />
                    <span>{repo.primaryLanguage.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {repo.stargazerCount}
                </div>
                <div className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  {repo.forkCount}
                </div>
                <span className="ml-auto text-gray-400 dark:text-gray-500">{t.updated.replace('{date}', updatedDate)}</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => onViewFiles(repo.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 px-3 rounded-lg
                    text-white bg-[#191970] dark:bg-[#a67c00] hover:opacity-90 transition-opacity">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  {t.viewFiles}
                </button>
                <a href={repo.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium py-2 px-3 rounded-lg
                    border border-gray-200 dark:border-gray-600
                    text-gray-600 dark:text-gray-300
                    hover:border-gray-400 dark:hover:border-gray-400 transition-colors">
                  {t.github}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}