import type { MCPContent, MCPToolResult, TextContent } from './types';

/**
 * Create a text content object
 */
export function textContent(text: string): TextContent {
  return {
    type: 'text',
    text,
  };
}

/**
 * Create a successful tool result with text content
 */
export function successResult(text: string): MCPToolResult {
  return {
    content: [textContent(text)],
    isError: false,
  };
}

/**
 * Create an error tool result
 */
export function errorResult(message: string): MCPToolResult {
  return {
    content: [textContent(message)],
    isError: true,
  };
}

/**
 * Create a tool result with multiple content items
 */
export function toolResult(content: MCPContent[], isError = false): MCPToolResult {
  return {
    content,
    isError,
  };
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Safely JSON stringify with pretty printing
 */
export function safeJsonStringify(data: unknown, pretty = true): string {
  try {
    return JSON.stringify(data, null, pretty ? 2 : undefined);
  } catch {
    return String(data);
  }
}

/**
 * Create a JSON text content from an object
 */
export function jsonContent(data: unknown): TextContent {
  return textContent(safeJsonStringify(data));
}
