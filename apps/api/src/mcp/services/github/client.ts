import type { ServiceConfig } from '@mcp-base/mcp-core';

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubRequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * GitHub API client for making authenticated requests
 */
export class GitHubClient {
  private token: string;

  constructor(config: ServiceConfig) {
    const token = config.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN is required');
    }
    this.token = token;
  }

  /**
   * Make a request to the GitHub API
   */
  async request<T>(endpoint: string, options: GitHubRequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'mcp-base',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Search for repositories
   */
  async searchRepositories(query: string): Promise<GitHubSearchResult> {
    return this.request(`/search/repositories?q=${encodeURIComponent(query)}&per_page=10`);
  }

  /**
   * Search for code in a repository
   */
  async searchCode(repository: string, query: string): Promise<GitHubCodeSearchResult> {
    return this.request(
      `/search/code?q=${encodeURIComponent(query)}+repo:${encodeURIComponent(repository)}&per_page=20`,
    );
  }

  /**
   * Get repository info
   */
  async getRepository(repository: string): Promise<GitHubRepository> {
    return this.request(`/repos/${repository}`);
  }

  /**
   * Get file content
   */
  async getFileContent(repository: string, path: string, ref?: string): Promise<GitHubFileContent> {
    const endpoint = `/repos/${repository}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
    return this.request(endpoint);
  }

  /**
   * List files in a directory
   */
  async listFiles(repository: string, path: string): Promise<GitHubFileContent[]> {
    const endpoint = `/repos/${repository}/contents/${path || ''}`;
    return this.request(endpoint);
  }

  /**
   * Get issue with timeline
   */
  async getIssue(repository: string, issueNumber: number): Promise<GitHubIssue> {
    return this.request(`/repos/${repository}/issues/${issueNumber}`);
  }

  /**
   * Get issue timeline
   */
  async getIssueTimeline(repository: string, issueNumber: number): Promise<GitHubTimelineEvent[]> {
    return this.request(`/repos/${repository}/issues/${issueNumber}/timeline`, {
      headers: { Accept: 'application/vnd.github.mockingbird-preview+json' },
    });
  }

  /**
   * Get pull request
   */
  async getPullRequest(repository: string, pullNumber: number): Promise<GitHubPullRequest> {
    return this.request(`/repos/${repository}/pulls/${pullNumber}`);
  }

  /**
   * Get pull request diff
   */
  async getPullRequestDiff(repository: string, pullNumber: number): Promise<string> {
    const url = `${GITHUB_API_BASE}/repos/${repository}/pulls/${pullNumber}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3.diff',
        'User-Agent': 'mcp-base',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error (${response.status})`);
    }

    return response.text();
  }

  /**
   * Get commit
   */
  async getCommit(repository: string, sha: string): Promise<GitHubCommit> {
    return this.request(`/repos/${repository}/commits/${sha}`);
  }
}

// GitHub API types
export interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface GitHubCodeSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubCodeSearchItem[];
}

export interface GitHubCodeSearchItem {
  name: string;
  path: string;
  sha: string;
  url: string;
  html_url: string;
  repository: {
    full_name: string;
  };
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubFileContent {
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  content?: string;
  encoding?: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  user: { login: string };
  labels: { name: string }[];
  assignees: { login: string }[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

export interface GitHubTimelineEvent {
  event: string;
  actor?: { login: string };
  created_at: string;
  body?: string;
  label?: { name: string };
  assignee?: { login: string };
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: string;
  user: { login: string };
  head: { ref: string; sha: string };
  base: { ref: string };
  merged: boolean;
  mergeable: boolean | null;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string };
  };
  stats: { additions: number; deletions: number; total: number };
  files: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }[];
  html_url: string;
}
