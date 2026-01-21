import type {
  MCPService,
  MCPToolResult,
  ServiceConfig,
} from '@mcp-base/mcp-core';

export type ToolHandler = (
  params: Record<string, unknown>,
  config: ServiceConfig
) => Promise<MCPToolResult>;

export interface RegisteredService extends MCPService {
  handlers: Map<string, ToolHandler>;
}

/**
 * MCP Service Registry
 * Manages all registered MCP services and their tool handlers
 */
export class MCPRegistry {
  private services: Map<string, RegisteredService> = new Map();

  /**
   * Register a new MCP service
   */
  register(service: MCPService, handlers: Record<string, ToolHandler>): void {
    const handlersMap = new Map(Object.entries(handlers));

    // Validate all tools have handlers
    for (const tool of service.tools) {
      if (!handlersMap.has(tool.name)) {
        throw new Error(
          `Service "${service.name}" tool "${tool.name}" has no handler`
        );
      }
    }

    this.services.set(service.name, {
      ...service,
      handlers: handlersMap,
    });
  }

  /**
   * Get all registered services (without handlers)
   */
  getServices(): MCPService[] {
    return Array.from(this.services.values()).map(
      ({ handlers, ...service }) => service
    );
  }

  /**
   * Get a specific service by name
   */
  getService(name: string): RegisteredService | undefined {
    return this.services.get(name);
  }

  /**
   * Execute a tool on a service
   */
  async executeTool(
    serviceName: string,
    toolName: string,
    params: Record<string, unknown>,
    config: ServiceConfig
  ): Promise<MCPToolResult> {
    const service = this.services.get(serviceName);
    if (!service) {
      return {
        content: [{ type: 'text', text: `Service "${serviceName}" not found` }],
        isError: true,
      };
    }

    const handler = service.handlers.get(toolName);
    if (!handler) {
      return {
        content: [
          {
            type: 'text',
            text: `Tool "${toolName}" not found in service "${serviceName}"`,
          },
        ],
        isError: true,
      };
    }

    return handler(params, config);
  }
}

// Global registry instance
export const registry = new MCPRegistry();
