'use client';

interface Repository {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage?: { name: string; color: string } | null;
  forkCount: number;
  stargazerCount: number;
  updatedAt: string;
  isPrivate?: boolean;
}

interface RepositoriesListProps {
  repositories: Repository[];
  isLoading: boolean;
  onViewFiles: (repoName: string) => void;
}

export function RepositoriesList({ repositories, isLoading, onViewFiles }: RepositoriesListProps) {
  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>Public Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-2/3"/>
              <div className="h-3 bg-gray-200 rounded w-full"/>
              <div className="h-3 bg-gray-200 rounded w-1/2"/>
              <div className="h-8 bg-gray-200 rounded-lg"/>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!repositories || repositories.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>Public Repositories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo, index) => {
          // url + index guarantees uniqueness even if repo names are identical
          const uniqueKey = `${repo.url ?? repo.name}-${index}`;
          const updatedDate = repo.updatedAt
            ? new Date(repo.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '';

          return (
            <div
              key={uniqueKey}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="font-semibold text-sm leading-snug break-all pr-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: '#191970' }}
                  >
                    {repo.name}
                  </a>
                </h3>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open on GitHub"
                  className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>

              <p className="text-gray-500 text-xs mb-4 line-clamp-2 flex-1">
                {repo.description || 'No description'}
              </p>

              <div className="flex flex-wrap gap-3 items-center text-xs text-gray-400 mb-3">
                {repo.primaryLanguage && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: repo.primaryLanguage.color }}
                    />
                    <span className="text-gray-600">{repo.primaryLanguage.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {repo.stargazerCount ?? 0}
                </div>
                <div className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  {repo.forkCount ?? 0}
                </div>
                {updatedDate && (
                  <span className="ml-auto text-gray-400 hidden sm:block">{updatedDate}</span>
                )}
              </div>

              <div className="w-full h-0.5 rounded bg-green-100 mb-3 overflow-hidden">
                <div className="h-full rounded bg-green-400 w-full"/>
              </div>

              <button
                onClick={() => onViewFiles(repo.name)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg transition-all hover:opacity-90 text-white"
                style={{ backgroundColor: '#191970' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View Files
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}