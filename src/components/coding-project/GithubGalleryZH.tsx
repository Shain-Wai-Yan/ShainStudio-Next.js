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
import { RepoViewer } from '@/components/coding-project/RepoViewer';
import { ProgrammingLanguages } from '@/components/coding-project/ProgrammingLanguages';

// ── Localised detailed-activity panel ────────────────────────────────────────

interface RepoContribution {
  repository: { name: string; url: string };
  contributions: { totalCount: number };
}

function RepoBar({ name, url, count, max, color }: {
  name: string; url: string; count: number; max: number; color: string;
}) {
  const pct = max > 0 ? Math.max(4, (count / max) * 100) : 4;
  return (
    <div className="flex items-center gap-3">
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="text-xs font-mono truncate w-44 hover:underline flex-shrink-0"
        style={{ color: '#191970' }} title={name}>{name}</a>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }}/>
      </div>
      <span className="text-xs font-semibold w-8 text-right flex-shrink-0" style={{ color }}>{count}</span>
    </div>
  );
}

function ActivityPanelZH({ items, color, emptyText }: { items: RepoContribution[]; color: string; emptyText: string }) {
  if (!items.length) return <p className="text-sm text-gray-400 py-4 text-center">{emptyText}</p>;
  const max   = Math.max(...items.map(i => i.contributions.totalCount));
  const total = items.reduce((s, i) => s + i.contributions.totalCount, 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>{total} 次</span>
        <span className="text-xs text-gray-400">共 {items.length} 个仓库</span>
      </div>
      {items.map((item, i) => (
        <RepoBar key={`${item.repository.url}-${i}`} name={item.repository.name} url={item.repository.url} count={item.contributions.totalCount} max={max} color={color}/>
      ))}
    </div>
  );
}

// ── Wrapper that overrides the English heading with Chinese ───────────────────
// ProgrammingLanguages renders its own <section> with an English h2.
// We wrap it and use CSS to hide that heading, then render our own above it.
function ProgrammingLanguagesZH({ languages, isLoading }: { languages: any[]; isLoading: boolean }) {
  return (
    <div>
      {/* Override heading: hide the built-in English one, show Chinese instead */}
      <style>{`
        .pl-zh-wrapper section > div:first-child h2,
        .pl-zh-wrapper > section > div.flex.items-center.justify-between h2 {
          display: none !important;
        }
        .pl-zh-wrapper > section > div.flex.items-center.justify-between {
          /* keep the "N languages" count visible */
        }
      `}</style>
      <div className="pl-zh-wrapper">
        {/* Inject Chinese heading above the component */}
        {!isLoading && languages.length > 0 && (
          <div className="flex items-center justify-between mb-0 -mt-0">
            {/* The section already has mb-12 so heading sits inside it visually */}
          </div>
        )}
        <ProgrammingLanguages languages={languages} isLoading={isLoading} />
      </div>
    </div>
  );
}

// ── Main ZH gallery ───────────────────────────────────────────────────────────

export function GithubGalleryZH() {
  const [user, setUser]                 = useState<any>(null);
  const [pinnedRepos, setPinnedRepos]   = useState<any[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [languages, setLanguages]       = useState<any[]>([]);
  const [contributions, setContributions] = useState({ totalContributions: 0, contributions: [] as any[] });
  const [detailedActivity, setDetailedActivity] = useState<any>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [viewerRepo, setViewerRepo]     = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<'commits' | 'prs' | 'issues'>('commits');

  useEffect(() => { loadGithubData(); }, []);

  const loadGithubData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userData, reposData, pinnedData, contribData, languagesData, activityData] =
        await Promise.all([
          fetchGithubUser(), fetchRepositories(), fetchPinnedRepos(),
          fetchContributions(), fetchTopLanguages(), fetchDetailedActivity(),
        ]);
      setUser(userData);
      setRepositories(reposData);
      setPinnedRepos(pinnedData);
      setContributions(contribData);
      setLanguages(languagesData);
      setDetailedActivity(activityData);
    } catch {
      setError('加载 GitHub 数据出错。请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sub-renders ─────────────────────────────────────────────────────────────

  const renderProfileHeader = () => {
    if (isLoading) return (
      <div className="animate-pulse mb-10 pb-10 border-b border-gray-200">
        <div className="flex gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0"/>
          <div className="flex-1 space-y-3 pt-2"><div className="h-7 bg-gray-200 rounded w-1/3"/><div className="h-4 bg-gray-200 rounded w-1/4"/></div>
        </div>
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl"/>)}</div>
      </div>
    );
    if (!user) return null;
    return (
      <div className="mb-10 pb-10 border-b border-gray-200">
        <div className="flex gap-6 mb-8 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatarUrl} alt={user.name || user.login} className="w-24 h-24 rounded-xl border-2 flex-shrink-0 shadow-sm" style={{ borderColor: '#191970' }}/>
          <div>
            <h2 className="text-2xl font-bold mb-0.5" style={{ color: '#191970' }}>{user.name || user.login}</h2>
            <p className="text-gray-500 text-sm mb-2">@{user.login}</p>
            {user.bio && <p className="text-gray-600 text-sm leading-relaxed max-w-lg">{user.bio}</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { value: user.repositories.totalCount, label: '代码仓库' },
            { value: user.followers.totalCount, label: '关注者' },
            { value: user.following.totalCount, label: '正在关注' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center rounded-xl py-4 px-2 border border-gray-100 bg-gray-50">
              <p className="text-2xl md:text-3xl font-bold" style={{ color: '#191970' }}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPinnedRepos = () => {
    if (isLoading) return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>精选仓库</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse h-40"/>)}
        </div>
      </section>
    );
    if (!pinnedRepos.length) return null;
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>精选仓库</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pinnedRepos.map((repo, idx) => {
            const date = new Date(repo.updatedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
            return (
              <div key={`${repo.url}-${idx}`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
                <h3 className="font-semibold text-base mb-1"><a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#191970' }}>{repo.name}</a></h3>
                <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{repo.description || '无描述'}</p>
                <div className="flex flex-wrap gap-3 items-center text-xs text-gray-400 mb-4">
                  {repo.primaryLanguage && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.primaryLanguage.color }}/>
                      <span className="text-gray-600">{repo.primaryLanguage.name}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1">⭐ {repo.stargazerCount}</span>
                  <span className="ml-auto text-gray-400">{date}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewerRepo(repo.name)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 px-3 rounded-lg text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#191970' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    查看文件
                  </button>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 text-sm transition-colors">GitHub</a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderContributions = () => {
    if (isLoading) return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>贡献活动</h2>
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse"/>
      </section>
    );
    if (!contributions.contributions.length) return null;
    const weeks: any[][] = [];
    for (let i = 0; i < contributions.contributions.length; i += 7) weeks.push(contributions.contributions.slice(i, i + 7));
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#191970' }}>贡献活动</h2>
        <p className="text-gray-500 text-sm mb-5">过去一年内 <strong>{contributions.totalContributions}</strong> 次贡献</p>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1 p-4 bg-white rounded-xl border border-gray-200">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div key={`${wi}-${di}`} className="w-3 h-3 rounded-sm" style={{ backgroundColor: day.color || '#ebedf0' }} title={`${day.date}: ${day.count} 次`}/>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span>较少</span>
          {['#ebedf0','#c6e48b','#7bc96f','#239a3b','#196127'].map(c => <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }}/>)}
          <span>较多</span>
        </div>
      </section>
    );
  };

  const renderRepositories = () => {
    if (isLoading) return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>公开仓库</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse"/>)}
        </div>
      </section>
    );
    if (!repositories.length) return null;
    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>公开仓库</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repositories.map((repo, idx) => (
            <div key={`${repo.url}-${idx}`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="font-semibold text-sm leading-snug break-all pr-2">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#191970' }}>{repo.name}</a>
                </h3>
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
              <p className="text-gray-500 text-xs mb-4 flex-1 line-clamp-2">{repo.description || '无描述'}</p>
              <div className="flex flex-wrap gap-3 items-center text-xs text-gray-400 mb-3">
                {repo.primaryLanguage && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.primaryLanguage.color }}/>
                    <span className="text-gray-600">{repo.primaryLanguage.name}</span>
                  </div>
                )}
                <span>⭐ {repo.stargazerCount ?? 0}</span>
              </div>
              <div className="h-0.5 bg-green-100 rounded mb-3"><div className="h-full bg-green-400 rounded w-full"/></div>
              <button onClick={() => setViewerRepo(repo.name)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: '#191970' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                查看文件
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderDetailedActivity = () => {
    const TABS = [
      { id: 'commits' as const, label: '提交',    color: '#2ea44f', key: 'commitContributionsByRepository' },
      { id: 'prs'     as const, label: '拉取请求', color: '#6f42c1', key: 'pullRequestContributionsByRepository' },
      { id: 'issues'  as const, label: '议题',    color: '#e36209', key: 'issueContributionsByRepository' },
    ];

    if (isLoading) return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>贡献详情</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse space-y-4">
          <div className="flex gap-3">{[1,2,3].map(i => <div key={i} className="h-8 w-24 bg-gray-200 rounded-lg"/>)}</div>
          {[1,2,3,4].map(i => <div key={i} className="flex items-center gap-3"><div className="h-3 bg-gray-200 rounded w-36"/><div className="flex-1 h-2 bg-gray-200 rounded-full"/><div className="h-3 w-6 bg-gray-200 rounded"/></div>)}
        </div>
      </section>
    );
    if (!detailedActivity) return null;

    const active = TABS.find(t => t.id === activeTab)!;
    const items: RepoContribution[] = detailedActivity[active.key] ?? [];
    const allEmpty = TABS.every(t => !(detailedActivity[t.key]?.length));
    if (allEmpty) return null;

    return (
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#191970' }}>贡献详情</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50">
            {TABS.map(tab => {
              const count = (detailedActivity[tab.key] ?? []).reduce((s: number, i: any) => s + i.contributions.totalCount, 0);
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px
                    ${isActive ? 'bg-white border-current' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  style={isActive ? { color: tab.color, borderColor: tab.color } : {}}>
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'text-white' : 'bg-gray-200 text-gray-600'}`}
                      style={isActive ? { backgroundColor: tab.color } : {}}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="p-6">
            <ActivityPanelZH items={items} color={active.color} emptyText={`过去一年内没有${active.label}活动。`}/>
          </div>
        </div>
      </section>
    );
  };

  // ── Languages section with Chinese heading ────────────────────────────────
  const renderLanguages = () => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: '#191970' }}>编程语言</h2>
        {!isLoading && languages.length > 0 && (
          <span className="text-sm text-gray-400">{languages.length} 种语言</span>
        )}
      </div>
      {/* Render the component but suppress its own heading row */}
      <div className="[&>section]:!mb-0 [&>section>div:first-child]:!hidden">
        <ProgrammingLanguages languages={languages} isLoading={isLoading} />
      </div>
    </section>
  );

  return (
    <div className="w-full">
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadGithubData} className="ml-4 underline font-medium">重试</button>
        </div>
      )}

      {renderProfileHeader()}
      {renderPinnedRepos()}
      {renderContributions()}
      {renderLanguages()}
      {renderDetailedActivity()}
      {renderRepositories()}

      {viewerRepo && (
        <RepoViewer repoName={viewerRepo} defaultBranch="main" onClose={() => setViewerRepo(null)}/>
      )}
    </div>
  );
}