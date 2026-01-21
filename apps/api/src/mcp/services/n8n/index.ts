import type { MCPService } from '@mcp-base/mcp-core';
import { n8nHandlers, n8nTools } from './tools';

export const n8nService: MCPService = {
  name: 'n8n',
  description: 'n8n workflow automation - manage and execute workflows',
  tools: n8nTools,
  configSchema: {
    type: 'object',
    properties: {
      N8N_API_URL: {
        type: 'string',
        description: 'n8n instance URL (e.g., https://n8n.example.com)',
      },
      N8N_API_KEY: {
        type: 'string',
        description: 'n8n API Key',
      },
    },
    required: ['N8N_API_URL', 'N8N_API_KEY'],
  },
};

export { n8nHandlers };
