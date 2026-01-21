import { z } from 'zod/v4';

// JSON Schema compatible type
export type JSONSchema = {
  type?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  description?: string;
  items?: JSONSchema;
  enum?: (string | number | boolean)[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  additionalProperties?: boolean | JSONSchema;
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  $ref?: string;
};

// MCP Tool definition
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

// MCP Service definition
export interface MCPService {
  name: string;
  description: string;
  tools: MCPTool[];
  configSchema?: JSONSchema;
}

// Tool execution result content types
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export interface ResourceContent {
  type: 'resource';
  resource: {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  };
}

export type MCPContent = TextContent | ImageContent | ResourceContent;

// Tool execution result
export interface MCPToolResult {
  content: MCPContent[];
  isError?: boolean;
}

// Service configuration (API keys, URLs, etc.)
export type ServiceConfig = Record<string, string>;

// API response types
export interface ServiceListResponse {
  services: MCPService[];
}

export interface ToolListResponse {
  service: string;
  tools: MCPTool[];
}

export interface ToolExecuteRequest {
  params: Record<string, unknown>;
}

export interface ToolExecuteResponse {
  result: MCPToolResult;
}

// Zod schemas for validation
export const toolExecuteRequestSchema = z.object({
  params: z.record(z.string(), z.unknown()),
});

export const serviceConfigSchema = z.record(z.string(), z.string());
