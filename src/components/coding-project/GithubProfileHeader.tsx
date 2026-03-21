'use client';

interface GithubUser {
  name: string | null;
  login: string;
  avatarUrl: string;
  bio: string | null;
  repositories: { totalCount: number };
  followers: { totalCount: number };
  following: { totalCount: number };
}

interface GithubProfileHeaderProps {
  user: GithubUser | null;
  isLoading: boolean;
}

import { useParams } from 'next/navigation';
import { getDictionarySync } from '@/lib/getDictionary';

export function GithubProfileHeader({ user, isLoading }: GithubProfileHeaderProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getDictionarySync(locale).codingProjects;
  if (isLoading) {
    return (
      <div className="animate-pulse mb-10 pb-10 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mb-10 pb-10 border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-6 mb-8 items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt={user.name || user.login}
          className="w-24 h-24 rounded-xl border-2 flex-shrink-0 shadow-sm border-[#191970] dark:border-[#d4af37]"
        />
        <div>
          <h2 className="text-2xl font-bold mb-0.5 text-[#191970] dark:text-[#d4af37]">
            {user.name || user.login}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">@{user.login}</p>
          {user.bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-lg">{user.bio}</p>
          )}
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs px-3 py-1.5 rounded-full text-white
              bg-[#191970] dark:bg-[#a67c00] hover:opacity-90 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {t.viewProfile}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {[
          { value: user.repositories.totalCount, label: t.repositoriesShort },
          { value: user.followers.totalCount,    label: t.followers },
          { value: user.following.totalCount,    label: t.following },
        ].map(({ value, label }) => (
          <div key={label}
            className="text-center rounded-xl py-4 px-2
              border border-gray-100 dark:border-gray-700
              bg-gray-50 dark:bg-[#1e1e1e]">
            <p className="text-2xl md:text-3xl font-bold text-[#191970] dark:text-[#d4af37]">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}