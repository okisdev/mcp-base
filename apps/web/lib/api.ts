import { getAllConfigs } from './store';

const API_BASE = '/api';

export interface MCPService {
  name: string;
  description: string;
  tools: MCPTool[];
  configSchema?: JSONSchema;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  description?: string;
  items?: JSONSchema;
  enum?: (string | number | boolean)[];
  default?: unknown;
  additionalProperties?: boolean | JSONSchema;
}

export interface MCPToolResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

/**
 * Get headers with service configurations
 */
function getAuthHeaders(): Record<string, string> {
  const configs = getAllConfigs();
  const headers: Record<string, string> = {};

  // GitHub
  if (configs.github?.GITHUB_TOKEN) {
    headers['X-GitHub-Token'] = configs.github.GITHUB_TOKEN;
  }

  // n8n
  if (configs.n8n?.N8N_API_URL) {
    headers['X-N8N-API-URL'] = configs.n8n.N8N_API_URL;
  }
  if (configs.n8n?.N8N_API_KEY) {
    headers['X-N8N-API-KEY'] = configs.n8n.N8N_API_KEY;
  }

  return headers;
}

/**
 * Fetch all services
 */
export async function fetchServices(): Promise<MCPService[]> {
  const response = await fetch(`${API_BASE}/services`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }

  const data = await response.json();
  return data.services;
}

/**
 * Fetch tools for a specific service
 */
export async function fetchTools(
  service: string
): Promise<{ tools: MCPTool[]; configSchema?: JSONSchema }> {
  const response = await fetch(`${API_BASE}/services/${service}/tools`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tools for ${service}`);
  }

  return response.json();
}

/**
 * Execute a tool
 */
export async function executeTool(
  service: string,
  tool: string,
  params: Record<string, unknown>
): Promise<MCPToolResult> {
  const response = await fetch(
    `${API_BASE}/services/${service}/tools/${tool}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ params }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to execute tool ${tool}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{
  status: string;
  services: number;
}> {
  const response = await fetch(`${API_BASE}/health`);

  if (!response.ok) {
    throw new Error('API health check failed');
  }

  return response.json();
}
