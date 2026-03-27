import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const CACHE_TTL = 3600;

interface CachedData { data: unknown; timestamp: number; }
const cache = new Map<string, CachedData>();

function getCacheKey(path: string, query: string) { return `${path}:${query}`; }

function getFromCache(key: string): unknown | null {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL * 1000) { cache.delete(key); return null; }
  return cached.data;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

const GQL_HEADERS = {
  Authorization: `bearer ${GITHUB_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'GitHub-Profile-Viewer',
};

async function gql(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: GQL_HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const type = searchParams.get('type');

  if (!username) {
    return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'user':        return handleUserProfile(username);
      case 'pinned':      return handlePinnedRepos(username);
      case 'contributions': return handleContributions(username);
      case 'languages':   return handleTopLanguages(username);
      case 'repositories': return handleRepositories(username);
      case 'contents':         return handleRepoContents(username, searchParams);
      case 'file':             return handleFileContent(username, searchParams);
      case 'detailed-activity': return handleDetailedActivity(username);
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data', message: String(error) }, { status: 500 });
  }
}

async function handleUserProfile(username: string) {
  const cacheKey = getCacheKey('user', username);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = await gql(`query($login: String!) { user(login: $login) {
    name login bio avatarUrl
    followers { totalCount }
    following { totalCount }
    repositories { totalCount }
  }}`, { login: username });

  if (data.errors) return NextResponse.json(data, { status: 400 });
  setCache(cacheKey, data.data?.user);
  return NextResponse.json(data.data?.user);
}

async function handlePinnedRepos(username: string) {
  const cacheKey = getCacheKey('pinned', username);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = await gql(`query($login: String!) { user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) { nodes {
      ... on Repository { name description url stargazerCount forkCount updatedAt
        primaryLanguage { name color }
      }
    }}
  }}`, { login: username });

  if (data.errors) return NextResponse.json(data, { status: 400 });
  const repos = data.data?.user?.pinnedItems?.nodes || [];
  setCache(cacheKey, repos);
  return NextResponse.json(repos);
}

interface GitHubContribution {
  date: string;
  count: number;
  color: string;
}

async function handleContributions(username: string) {
  const cacheKey = getCacheKey('contributions', username);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = await gql(`query($login: String!) { user(login: $login) {
    contributionsCollection { contributionCalendar {
      totalContributions
      weeks { contributionDays { date contributionCount color } }
    }}
  }}`, { login: username }) as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { totalContributions: number; weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number; color: string }> }> } } } }; errors?: unknown[] };

  if (data.errors) return NextResponse.json(data, { status: 400 });
  const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;
  const contributions: GitHubContribution[] = [];
  if (calendar) {
    calendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        contributions.push({ date: day.date, count: day.contributionCount, color: day.color });
      });
    });
  }
  const result = { totalContributions: calendar?.totalContributions || 0, contributions };
  setCache(cacheKey, result);
  return NextResponse.json(result);
}

async function handleTopLanguages(username: string) {
  const cacheKey = getCacheKey('languages', username);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = await gql(`query($login: String!) { user(login: $login) {
    repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, isFork: false) {
      nodes { languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
        edges { size node { name color } }
      }}
    }
  }}`, { login: username }) as { data?: { user?: { repositories?: { nodes?: Array<{ languages?: { edges?: Array<{ size: number; node: { name: string; color: string } }> } }> } } }; errors?: unknown[] };

  if (data.errors) return NextResponse.json(data, { status: 400 });
  const languages: Record<string, { size: number; color: string }> = {};
  let totalSize = 0;
  data.data?.user?.repositories?.nodes?.forEach((repo) => {
    repo.languages?.edges?.forEach((edge) => {
      const { name, color } = edge.node;
      if (!languages[name]) languages[name] = { size: 0, color };
      languages[name].size += edge.size;
      totalSize += edge.size;
    });
  });
  if (totalSize === 0) return NextResponse.json([]);
  const languageArray = Object.keys(languages)
    .map(name => ({ name, color: languages[name].color, size: languages[name].size, percentage: ((languages[name].size / totalSize) * 100).toFixed(1) }))
    .sort((a, b) => b.size - a.size);
  setCache(cacheKey, languageArray);
  return NextResponse.json(languageArray);
}

async function handleRepositories(username: string) {
  const cacheKey = getCacheKey('repositories', username);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = await gql(`query($login: String!) { user(login: $login) {
    repositories(first: 30, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes { name description url stargazerCount forkCount updatedAt isPrivate
        primaryLanguage { name color }
      }
    }
  }}`, { login: username });

  if (data.errors) return NextResponse.json(data, { status: 400 });
  const repos = data.data?.user?.repositories?.nodes || [];
  setCache(cacheKey, repos);
  return NextResponse.json(repos);
}

async function handleRepoContents(username: string, params: URLSearchParams) {
  const repo = params.get('repo');
  const path = params.get('path') || '';
  const branch = params.get('branch') || 'main';

  if (!repo) return NextResponse.json({ error: 'Missing repo parameter' }, { status: 400 });

  const cacheKey = getCacheKey('contents', `${username}/${repo}/${path}@${branch}`);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const apiPath = path ? `repos/${username}/${repo}/contents/${path}` : `repos/${username}/${repo}/contents`;
  const res = await fetch(`https://api.github.com/${apiPath}?ref=${branch}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'GitHub-Profile-Viewer', Accept: 'application/vnd.github.v3+json' },
  });

  if (!res.ok) return NextResponse.json({ error: `GitHub error: ${res.status}` }, { status: res.status });
  const data = await res.json();
  setCache(cacheKey, data);
  return NextResponse.json(data);
}

async function handleFileContent(username: string, params: URLSearchParams) {
  const repo = params.get('repo');
  const path = params.get('path') || '';
  const branch = params.get('branch') || 'main';

  if (!repo || !path) return NextResponse.json({ error: 'Missing repo or path' }, { status: 400 });

  const cacheKey = getCacheKey('file', `${username}/${repo}/${path}@${branch}`);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'GitHub-Profile-Viewer', Accept: 'application/vnd.github.v3+json' },
  });

  if (!res.ok) return NextResponse.json({ error: `GitHub error: ${res.status}` }, { status: res.status });
  const data = await res.json();
  setCache(cacheKey, data);
  return NextResponse.json(data);
}

async function handleDetailedActivity(username: string) {
  const cacheKey = getCacheKey('detailed-activity', username);
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = await gql(`query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        commitContributionsByRepository(maxRepositories: 10) {
          repository { name url }
          contributions { totalCount }
        }
        pullRequestContributionsByRepository(maxRepositories: 10) {
          repository { name url }
          contributions { totalCount }
        }
        issueContributionsByRepository(maxRepositories: 10) {
          repository { name url }
          contributions { totalCount }
        }
      }
    }
  }`, { login: username });

  if (data.errors) return NextResponse.json(data, { status: 400 });
  const result = data.data?.user?.contributionsCollection || {};
  setCache(cacheKey, result);
  return NextResponse.json(result);
}