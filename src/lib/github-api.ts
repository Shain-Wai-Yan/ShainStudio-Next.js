const GITHUB_API = '/api/github';
const GITHUB_USERNAME = 'Shain-Wai-Yan';

async function fetchFromAPI(params?: Record<string, string>) {
  const url = new URL(
    GITHUB_API,
    typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  console.log('[github-api] Fetching from:', url.toString());

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[github-api] Response:', data);
  return data;
}

export async function fetchGithubUser() {
  try {
    const data = await fetchFromAPI({ username: GITHUB_USERNAME, type: 'user' });
    return {
      name: data.name,
      login: data.login,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      repositories: data.repositories,   // { totalCount: N }
      followers: data.followers,          // { totalCount: N }
      following: data.following,          // { totalCount: N }
    };
  } catch (error) {
    console.error('[github-api] Error fetching GitHub user:', error);
    throw error;
  }
}

export async function fetchRepositories() {
  try {
    const data = await fetchFromAPI({ username: GITHUB_USERNAME, type: 'repositories' });
    // API returns GraphQL shape: name, description, url, primaryLanguage, forkCount, stargazerCount, updatedAt
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[github-api] Error fetching repositories:', error);
    throw error;
  }
}

export async function fetchPinnedRepos() {
  try {
    const data = await fetchFromAPI({ username: GITHUB_USERNAME, type: 'pinned' });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[github-api] Error fetching pinned repos:', error);
    throw error;
  }
}

export async function fetchContributions() {
  try {
    const data = await fetchFromAPI({ username: GITHUB_USERNAME, type: 'contributions' });
    return data || { totalContributions: 0, contributions: [] };
  } catch (error) {
    console.error('[github-api] Error fetching contributions:', error);
    throw error;
  }
}

export async function fetchTopLanguages() {
  try {
    const data = await fetchFromAPI({ username: GITHUB_USERNAME, type: 'languages' });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[github-api] Error fetching top languages:', error);
    throw error;
  }
}

// ─── Repository file viewer ─────────────────────────────────────────────────

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
  content?: string;       // base64 when fetched individually
}

export async function fetchRepoContents(
  repoName: string,
  path: string = '',
  branch: string = 'main'
): Promise<RepoFile[]> {
  const params = new URLSearchParams({ username: GITHUB_USERNAME, type: 'contents', repo: repoName, path, branch });
  const url = `${GITHUB_API}?${params.toString()}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();

  // GitHub returns single object for files, array for directories
  return Array.isArray(data) ? data : [data];
}

export async function fetchFileContent(
  repoName: string,
  filePath: string,
  branch: string = 'main'
): Promise<string> {
  const params = new URLSearchParams({ username: GITHUB_USERNAME, type: 'file', repo: repoName, path: filePath, branch });
  const url = `${GITHUB_API}?${params.toString()}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();

  if (data.content) {
    // Decode base64
    return atob(data.content.replace(/\n/g, ''));
  }
  return '';
}

export async function fetchDetailedActivity() {
  try {
    const data = await fetchFromAPI({ username: GITHUB_USERNAME, type: 'detailed-activity' });
    return data || {
      commitContributionsByRepository: [],
      pullRequestContributionsByRepository: [],
      issueContributionsByRepository: [],
    };
  } catch (error) {
    console.error('[github-api] Error fetching detailed activity:', error);
    throw error;
  }
}