import type { ServiceConfig } from '@mcp-base/mcp-core';
import type {
  N8nCredential,
  N8nExecution,
  N8nListResponse,
  N8nWorkflow,
} from './types';

interface N8nRequestOptions {
  method?: string;
  body?: unknown;
}

/**
 * n8n API client for making authenticated requests
 */
export class N8nClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: ServiceConfig) {
    const baseUrl = config.N8N_API_URL;
    const apiKey = config.N8N_API_KEY;

    if (!baseUrl) {
      throw new Error('N8N_API_URL is required');
    }
    if (!apiKey) {
      throw new Error('N8N_API_KEY is required');
    }

    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  /**
   * Make a request to the n8n API
   */
  private async request<T>(endpoint: string, options: N8nRequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`n8n API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * List all workflows
   */
  async listWorkflows(limit = 100): Promise<N8nListResponse<N8nWorkflow>> {
    return this.request(`/workflows?limit=${limit}`);
  }

  /**
   * Get a specific workflow
   */
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}`);
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}/activate`, { method: 'POST' });
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request(`/workflows/${id}/deactivate`, { method: 'POST' });
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(id: string, data?: Record<string, unknown>): Promise<N8nExecution> {
    return this.request(`/workflows/${id}/run`, {
      method: 'POST',
      body: data ? { data } : undefined,
    });
  }

  /**
   * List executions
   */
  async listExecutions(workflowId?: string, limit = 20): Promise<N8nListResponse<N8nExecution>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (workflowId) {
      params.set('workflowId', workflowId);
    }
    return this.request(`/executions?${params}`);
  }

  /**
   * Get a specific execution
   */
  async getExecution(id: string): Promise<N8nExecution> {
    return this.request(`/executions/${id}`);
  }

  /**
   * List credentials
   */
  async listCredentials(): Promise<N8nListResponse<N8nCredential>> {
    return this.request('/credentials');
  }
}
