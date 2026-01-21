import { Hono } from 'hono';
import type { ServiceConfig } from '@mcp-base/mcp-core';
import { registry } from '../mcp/registry';

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
 * Handles JSON-RPC 2.0 requests for MCP compatibility
 */
mcp.post('/', async (c) => {
  let request: MCPRequest;
  try {
    request = await c.req.json();
  } catch {
    return c.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
      400,
    );
  }

  const { method, params, id } = request;

  // Handle different MCP methods
  switch (method) {
    case 'initialize': {
      return c.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'mcp-base',
            version: '0.0.1',
          },
        },
        id,
      });
    }

    case 'tools/list': {
      const services = registry.getServices();
      const tools = services.flatMap((service) =>
        service.tools.map((tool) => ({
          name: `${service.name}__${tool.name}`,
          description: `[${service.name}] ${tool.description}`,
          inputSchema: tool.inputSchema,
        })),
      );

      return c.json({
        jsonrpc: '2.0',
        result: { tools },
        id,
      });
    }

    case 'tools/call': {
      const { name: fullName, arguments: args } = params as {
        name: string;
        arguments?: Record<string, unknown>;
      };

      // Parse service__tool name format
      const [serviceName, ...toolParts] = fullName.split('__');
      const toolName = toolParts.join('__');

      if (!serviceName || !toolName) {
        return c.json({
          jsonrpc: '2.0',
          error: { code: -32602, message: 'Invalid tool name format. Expected: service__tool' },
          id,
        });
      }

      const config = getConfigFromHeaders(c.req.raw.headers);
      const result = await registry.executeTool(serviceName, toolName, args || {}, config);

      return c.json({
        jsonrpc: '2.0',
        result,
        id,
      });
    }

    default: {
      return c.json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method not found: ${method}` },
        id,
      });
    }
  }
});

interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: string | number | null;
}

export default mcp;
