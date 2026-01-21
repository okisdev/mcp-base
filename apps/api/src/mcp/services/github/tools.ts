import type { MCPTool, MCPToolResult, ServiceConfig } from '@mcp-base/mcp-core';
import {
  errorResult,
  jsonContent,
  successResult,
  textContent,
  toolResult,
} from '@mcp-base/mcp-core';
import { GitHubClient } from './client';

// Tool definitions
export const githubTools: MCPTool[] = [
  {
    name: 'find_repo',
    description: 'Search GitHub to find repositories by name or keywords',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for repository name or keywords',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_code',
    description: 'Search for code within a specific GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in "owner/repo" format',
        },
        query: {
          type: 'string',
          description:
            'Code to search for: function names, class names, keywords',
        },
      },
      required: ['repository', 'query'],
    },
  },
  {
    name: 'get_file_content',
    description: 'Read the complete source code of a specific file',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in "owner/repo" format',
        },
        path: {
          type: 'string',
          description: 'File path from repository root',
        },
        ref: {
          type: 'string',
          description: 'Optional branch, tag, or commit SHA',
        },
      },
      required: ['repository', 'path'],
    },
  },
  {
    name: 'list_files',
    description: 'List files and folders in a repository directory',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in "owner/repo" format',
        },
        path: {
          type: 'string',
          description: 'Directory path (empty for root)',
          default: '',
        },
      },
      required: ['repository'],
    },
  },
  {
    name: 'get_repo_info',
    description: 'Get metadata about a GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in "owner/repo" format',
        },
      },
      required: ['repository'],
    },
  },
  {
    name: 'get_issue',
    description: 'Get detailed information about a GitHub issue with timeline',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in "owner/repo" format',
        },
        issue_number: {
          type: 'number',
          description: 'The issue number',
        },
      },
      required: ['repository', 'issue_number'],
    },
  },
  {
    name: 'get_pull_request',
    description: 'Get detailed information about a pull request with diff',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in "owner/repo" format',
        },
        pull_number: {
          type: 'number',
          description: 'The pull request number',
        },
      },
      required: ['repository', 'pull_number'],
    },
  },
  {
    name: 'get_commit',
    description: 'Get detailed information about a specific commit',
    inputSchema: {
      type: 'object',
      properties: {
        repository: {
          type: 'string',
          description: 'Repository in "owner/repo" format',
        },
        sha: {
          type: 'string',
          description: 'The commit SHA',
        },
      },
      required: ['repository', 'sha'],
    },
  },
];

// Tool handlers
export async function findRepo(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const query = params.query as string;
    const result = await client.searchRepositories(query);

    const repos = result.items.map((repo) => ({
      full_name: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      url: repo.html_url,
    }));

    return toolResult([
      jsonContent({ total_count: result.total_count, repositories: repos }),
    ]);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function searchCode(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const repository = params.repository as string;
    const query = params.query as string;
    const result = await client.searchCode(repository, query);

    const items = result.items.map((item) => ({
      path: item.path,
      name: item.name,
      url: item.html_url,
    }));

    return toolResult([
      jsonContent({ total_count: result.total_count, matches: items }),
    ]);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function getFileContent(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const repository = params.repository as string;
    const path = params.path as string;
    const ref = params.ref as string | undefined;
    const result = await client.getFileContent(repository, path, ref);

    if (result.content && result.encoding === 'base64') {
      const content = atob(result.content);
      return successResult(content);
    }

    return errorResult('File content not available');
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function listFiles(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const repository = params.repository as string;
    const path = (params.path as string) || '';
    const result = await client.listFiles(repository, path);

    const files = result.map((file) => ({
      name: file.name,
      type: file.type,
      path: file.path,
      size: file.size,
    }));

    return toolResult([jsonContent(files)]);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function getRepoInfo(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const repository = params.repository as string;
    const result = await client.getRepository(repository);

    return toolResult([
      jsonContent({
        name: result.name,
        full_name: result.full_name,
        description: result.description,
        stars: result.stargazers_count,
        forks: result.forks_count,
        language: result.language,
        topics: result.topics,
        default_branch: result.default_branch,
        url: result.html_url,
        created_at: result.created_at,
        updated_at: result.updated_at,
      }),
    ]);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function getIssue(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const repository = params.repository as string;
    const issueNumber = params.issue_number as number;

    const [issue, timeline] = await Promise.all([
      client.getIssue(repository, issueNumber),
      client.getIssueTimeline(repository, issueNumber),
    ]);

    return toolResult([
      jsonContent({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        author: issue.user.login,
        labels: issue.labels.map((l) => l.name),
        assignees: issue.assignees.map((a) => a.login),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        url: issue.html_url,
        timeline: timeline.slice(0, 50),
      }),
    ]);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function getPullRequest(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const repository = params.repository as string;
    const pullNumber = params.pull_number as number;

    const [pr, diff] = await Promise.all([
      client.getPullRequest(repository, pullNumber),
      client.getPullRequestDiff(repository, pullNumber),
    ]);

    return toolResult([
      jsonContent({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        author: pr.user.login,
        head: pr.head.ref,
        base: pr.base.ref,
        merged: pr.merged,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        url: pr.html_url,
      }),
      textContent(`\n--- Diff ---\n${diff}`),
    ]);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function getCommit(
  params: Record<string, unknown>,
  config: ServiceConfig
): Promise<MCPToolResult> {
  try {
    const client = new GitHubClient(config);
    const repository = params.repository as string;
    const sha = params.sha as string;
    const result = await client.getCommit(repository, sha);

    return toolResult([
      jsonContent({
        sha: result.sha,
        message: result.commit.message,
        author: result.commit.author,
        stats: result.stats,
        files: result.files.map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          patch: f.patch,
        })),
        url: result.html_url,
      }),
    ]);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Handler map for registry
export const githubHandlers = {
  find_repo: findRepo,
  search_code: searchCode,
  get_file_content: getFileContent,
  list_files: listFiles,
  get_repo_info: getRepoInfo,
  get_issue: getIssue,
  get_pull_request: getPullRequest,
  get_commit: getCommit,
};
