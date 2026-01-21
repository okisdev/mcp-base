import { Hono } from 'hono';
import { StreamableHTTPTransport } from '@hono/mcp';
import type { ServiceConfig } from '@mcp-base/mcp-core';
import { createMcpServer } from '../mcp/server';

const mcp = new Hono();

/**
 * Extract service configuration from request headers
 */
function getConfigFromHeaders(headers: Headers): ServiceConfig {
  const config: ServiceConfig = {};

  const githubToken = headers.get('X-GitHub-Token');
  if (githubToken) {
    config.GITHUB_TOKEN = githubToken;
  }

  const n8nApiUrl = headers.get('X-N8N-API-URL');
  if (n8nApiUrl) {
    config.N8N_API_URL = n8nApiUrl;
  }

  const n8nApiKey = headers.get('X-N8N-API-KEY');
  if (n8nApiKey) {
    config.N8N_API_KEY = n8nApiKey;
  }

  return config;
}

/**
 * MCP Protocol endpoint
 * Handles MCP requests using StreamableHTTPTransport
 */
mcp.all('/', async (c) => {
  const config = getConfigFromHeaders(c.req.raw.headers);
  const mcpServer = createMcpServer(config);

  const transport = new StreamableHTTPTransport({
    sessionIdGenerator: undefined, // Stateless mode for CF Workers
    enableJsonResponse: true,
  });

  await mcpServer.connect(transport);
  return transport.handleRequest(c);
});

export default mcp;
