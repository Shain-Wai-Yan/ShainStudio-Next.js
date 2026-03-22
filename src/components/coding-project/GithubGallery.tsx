'use client';

import { useEffect, useState } from 'react';
import {
  fetchGithubUser,
  fetchRepositories,
  fetchPinnedRepos,
  fetchContributions,
  fetchTopLanguages,
  fetchDetailedActivity,
} from '@/lib/github-api';
import { GithubProfileHeader }  from './GithubProfileHeader';
import { PinnedRepositories }   from './PinnedRepositories';
import { ContributionsGraph }   from './ContributionsGraph';
import { RepositoriesList }     from './RepositoriesList';
import { ProgrammingLanguages } from './ProgrammingLanguages';
import { DetailedActivity }     from './Detailedactivity';   // ← fixed capital A
import { RepoViewer }           from './RepoViewer';

import { useParams } from 'next/navigation';
import { getDictionarySync } from '@/lib/getDictionary';

export function GithubGallery() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getDictionarySync(locale).codingProjects;
  const [user, setUser]               = useState<any>(null);
  const [pinnedRepos, setPinnedRepos] = useState<any[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [languages, setLanguages]     = useState<any[]>([]);
  const [contributions, setContributions] = useState({ totalContributions: 0, contributions: [] });
  const [detailedActivity, setDetailedActivity] = useState<any>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [viewerRepo, setViewerRepo]   = useState<string | null>(null);

  useEffect(() => { loadGithubData(); }, []);

  const loadGithubData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userData, reposData, pinnedData, contribData, languagesData, activityData] =
        await Promise.all([
          fetchGithubUser(),
          fetchRepositories(),
          fetchPinnedRepos(),
          fetchContributions(),
          fetchTopLanguages(),
          fetchDetailedActivity(),
        ]);
      setUser(userData);
      setRepositories(reposData);
      setPinnedRepos(pinnedData);
      setContributions(contribData);
      setLanguages(languagesData);
      setDetailedActivity(activityData);
    } catch (err) {
      console.error('Error loading GitHub data:', err);
      setError('Failed to load GitHub data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-8 p-4 rounded-xl text-sm flex items-center justify-between
          bg-red-50 dark:bg-red-900/20
          border border-red-200 dark:border-red-800
          text-red-700 dark:text-red-400">
          <span>{error}</span>
          <button
            onClick={loadGithubData}
            className="ml-4 underline hover:no-underline font-medium"
          >
            {t.retry}
          </button>
        </div>
      )}

      <GithubProfileHeader user={user} isLoading={isLoading} />

      <PinnedRepositories
        repos={pinnedRepos}
        isLoading={isLoading}
        onViewFiles={(name) => setViewerRepo(name)}
      />

      <ContributionsGraph
        totalContributions={contributions.totalContributions}
        contributions={contributions.contributions}
        isLoading={isLoading}
      />

      <ProgrammingLanguages languages={languages} isLoading={isLoading} />

      {/* Detailed activity — commits, PRs, issues by repo */}
      <DetailedActivity data={detailedActivity} isLoading={isLoading} />

      <RepositoriesList
        repositories={repositories}
        isLoading={isLoading}
        onViewFiles={(name) => setViewerRepo(name)}
      />

      {viewerRepo && (
        <RepoViewer
          repoName={viewerRepo}
          defaultBranch="main"
          onClose={() => setViewerRepo(null)}
        />
      )}
    </div>
  );
}