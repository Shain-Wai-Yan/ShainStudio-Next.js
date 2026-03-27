/**
 * GitHub API Data Types
 */

export interface GitHubUser {
  name: string | null;
  login: string;
  avatarUrl: string;
  bio: string | null;
  repositories: { totalCount: number };
  followers: { totalCount: number };
  following: { totalCount: number };
}

export interface GitHubLanguage {
  name: string;
  color: string;
  size: number;
  percentage: string;
}

export interface GitHubRepository {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  updatedAt: string;
  isPrivate?: boolean;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
}

export interface GitHubContribution {
  date: string;
  count: number;
  color: string;
}

export interface GitHubContributions {
  totalContributions: number;
  contributions: GitHubContribution[];
}

export interface GitHubRepoActivity {
  repository: {
    name: string;
    url: string;
  };
  contributions: {
    totalCount: number;
  };
}

export interface GitHubDetailedActivity {
  commitContributionsByRepository: GitHubRepoActivity[];
  pullRequestContributionsByRepository: GitHubRepoActivity[];
  issueContributionsByRepository: GitHubRepoActivity[];
}
