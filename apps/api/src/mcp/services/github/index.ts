import type { MCPService } from '@mcp-base/mcp-core';
import { githubHandlers, githubTools } from './tools';

export const githubService: MCPService = {
  name: 'github',
  description:
    'GitHub repository search, code exploration, issues, and pull requests',
  tools: githubTools,
  configSchema: {
    type: 'object',
    properties: {
      GITHUB_TOKEN: {
        type: 'string',
        description: 'GitHub Personal Access Token',
      },
    },
    required: ['GITHUB_TOKEN'],
  },
};

export { githubHandlers };
