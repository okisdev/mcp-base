import type { ServiceConfig } from '@mcp-base/mcp-core';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { registry } from '../mcp/registry';

const api = new Hono();

// Enable CORS for web client
api.use('/*', cors());

/**
 * Extract service configuration from request headers
 */
function getConfigFromHeaders(headers: Headers): ServiceConfig {
  const config: ServiceConfig = {};

  // GitHub token
  const githubToken = headers.get('X-GitHub-Token');
  if (githubToken) {
    config.GITHUB_TOKEN = githubToken;
  }

  // n8n configuration
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
 * GET /api/services
 * List all registered MCP services
 */
api.get('/services', (c) => {
  const services = registry.getServices();
  return c.json({ services });
});

/**
 * GET /api/services/:name/tools
 * List tools for a specific service
 */
api.get('/services/:name/tools', (c) => {
  const name = c.req.param('name');
  const service = registry.getService(name);

  if (!service) {
    return c.json({ error: `Service "${name}" not found` }, 404);
  }

  return c.json({
    service: service.name,
    tools: service.tools,
    configSchema: service.configSchema,
  });
});

/**
 * POST /api/services/:name/tools/:tool
 * Execute a tool on a service
 */
api.post('/services/:name/tools/:tool', async (c) => {
  const serviceName = c.req.param('name');
  const toolName = c.req.param('tool');

  const service = registry.getService(serviceName);
  if (!service) {
    return c.json({ error: `Service "${serviceName}" not found` }, 404);
  }

  const tool = service.tools.find((t) => t.name === toolName);
  if (!tool) {
    return c.json(
      { error: `Tool "${toolName}" not found in service "${serviceName}"` },
      404
    );
  }

  let params: Record<string, unknown> = {};
  try {
    const body = await c.req.json();
    params = body.params || {};
  } catch {
    // Empty body is fine
  }

  const config = getConfigFromHeaders(c.req.raw.headers);
  const result = await registry.executeTool(
    serviceName,
    toolName,
    params,
    config
  );

  return c.json({ result });
});

/**
 * GET /api/health
 * Health check endpoint
 */
api.get('/health', (c) => {
  return c.json({ status: 'ok', services: registry.getServices().length });
});

export default api;
