import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import type { ServiceConfig } from '@mcp-base/mcp-core';
import { registry } from './registry';

/**
 * Create an MCP Server instance with all registered tools
 * Uses low-level Server API to support JSON Schema (instead of Zod)
 * Creates a new instance per request since config (tokens) vary per request
 */
export function createMcpServer(config: ServiceConfig): Server {
  const server = new Server(
    { name: 'mcp-base', version: '0.0.1' },
    { capabilities: { tools: {} } },
  );

  // Handle tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const services = registry.getServices();
    const tools = services.flatMap((service) =>
      service.tools.map((tool) => ({
        name: `${service.name}__${tool.name}`,
        description: `[${service.name}] ${tool.description}`,
        inputSchema: tool.inputSchema,
      })),
    );
    return { tools };
  });

  // Handle tools/call
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name: fullName, arguments: args } = request.params;

    // Parse service__tool name format
    const [serviceName, ...toolParts] = fullName.split('__');
    const toolName = toolParts.join('__');

    if (!serviceName || !toolName) {
      return {
        content: [{ type: 'text', text: 'Invalid tool name format. Expected: service__tool' }],
        isError: true,
      };
    }

    const result = await registry.executeTool(
      serviceName,
      toolName,
      (args || {}) as Record<string, unknown>,
      config,
    );

    return result as CallToolResult;
  });

  return server;
}
