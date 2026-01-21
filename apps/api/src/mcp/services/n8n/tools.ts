import type { MCPTool, MCPToolResult, ServiceConfig } from '@mcp-base/mcp-core';
import { errorResult, jsonContent, toolResult } from '@mcp-base/mcp-core';
import { N8nClient } from './client';

// Tool definitions
export const n8nTools: MCPTool[] = [
  {
    name: 'list_workflows',
    description: 'List all n8n workflows',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of workflows to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'get_workflow',
    description: 'Get details of a specific workflow including nodes and connections',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'activate_workflow',
    description: 'Activate a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'deactivate_workflow',
    description: 'Deactivate a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'execute_workflow',
    description: 'Execute a workflow with optional input data',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID',
        },
        data: {
          type: 'object',
          description: 'Optional input data for the workflow',
          additionalProperties: true,
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_executions',
    description: 'List workflow executions',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: {
          type: 'string',
          description: 'Filter by workflow ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of executions to return',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_execution',
    description: 'Get details of a specific execution',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Execution ID',
        },
      },
      required: ['id'],
    },
  },
];

// Tool handlers
export async function listWorkflows(
  params: Record<string, unknown>,
  config: ServiceConfig,
): Promise<MCPToolResult> {
  try {
    const client = new N8nClient(config);
    const limit = (params.limit as number) || 100;
    const result = await client.listWorkflows(limit);

    const workflows = result.data.map((w) => ({
      id: w.id,
      name: w.name,
      active: w.active,
      updatedAt: w.updatedAt,
      tags: w.tags?.map((t) => t.name),
    }));

    return toolResult([jsonContent({ workflows, count: workflows.length })]);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function getWorkflow(
  params: Record<string, unknown>,
  config: ServiceConfig,
): Promise<MCPToolResult> {
  try {
    const client = new N8nClient(config);
    const id = params.id as string;
    const result = await client.getWorkflow(id);

    return toolResult([
      jsonContent({
        id: result.id,
        name: result.name,
        active: result.active,
        nodes: result.nodes?.map((n) => ({
          id: n.id,
          name: n.name,
          type: n.type,
        })),
        tags: result.tags?.map((t) => t.name),
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      }),
    ]);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function activateWorkflow(
  params: Record<string, unknown>,
  config: ServiceConfig,
): Promise<MCPToolResult> {
  try {
    const client = new N8nClient(config);
    const id = params.id as string;
    const result = await client.activateWorkflow(id);

    return toolResult([
      jsonContent({
        id: result.id,
        name: result.name,
        active: result.active,
        message: 'Workflow activated successfully',
      }),
    ]);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function deactivateWorkflow(
  params: Record<string, unknown>,
  config: ServiceConfig,
): Promise<MCPToolResult> {
  try {
    const client = new N8nClient(config);
    const id = params.id as string;
    const result = await client.deactivateWorkflow(id);

    return toolResult([
      jsonContent({
        id: result.id,
        name: result.name,
        active: result.active,
        message: 'Workflow deactivated successfully',
      }),
    ]);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function executeWorkflow(
  params: Record<string, unknown>,
  config: ServiceConfig,
): Promise<MCPToolResult> {
  try {
    const client = new N8nClient(config);
    const id = params.id as string;
    const data = params.data as Record<string, unknown> | undefined;
    const result = await client.executeWorkflow(id, data);

    return toolResult([
      jsonContent({
        executionId: result.id,
        status: result.status,
        startedAt: result.startedAt,
        workflowId: result.workflowId,
      }),
    ]);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function listExecutions(
  params: Record<string, unknown>,
  config: ServiceConfig,
): Promise<MCPToolResult> {
  try {
    const client = new N8nClient(config);
    const workflowId = params.workflow_id as string | undefined;
    const limit = (params.limit as number) || 20;
    const result = await client.listExecutions(workflowId, limit);

    const executions = result.data.map((e) => ({
      id: e.id,
      workflowId: e.workflowId,
      workflowName: e.workflowName,
      status: e.status,
      startedAt: e.startedAt,
      stoppedAt: e.stoppedAt,
    }));

    return toolResult([jsonContent({ executions, count: executions.length })]);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function getExecution(
  params: Record<string, unknown>,
  config: ServiceConfig,
): Promise<MCPToolResult> {
  try {
    const client = new N8nClient(config);
    const id = params.id as string;
    const result = await client.getExecution(id);

    return toolResult([
      jsonContent({
        id: result.id,
        workflowId: result.workflowId,
        status: result.status,
        finished: result.finished,
        startedAt: result.startedAt,
        stoppedAt: result.stoppedAt,
        error: result.data?.resultData?.error?.message,
      }),
    ]);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'Unknown error');
  }
}

// Handler map for registry
export const n8nHandlers = {
  list_workflows: listWorkflows,
  get_workflow: getWorkflow,
  activate_workflow: activateWorkflow,
  deactivate_workflow: deactivateWorkflow,
  execute_workflow: executeWorkflow,
  list_executions: listExecutions,
  get_execution: getExecution,
};
