import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export interface ErrorContext {
  tool: string;
  operation?: string | undefined;
  details?: Record<string, unknown> | undefined;
}

export function createMcpError(
  error: unknown,
  context: ErrorContext,
  fallbackMessage = "An unexpected error occurred"
): McpError {
  const { tool, operation, details } = context;
  
  let message = fallbackMessage;
  let code = ErrorCode.InternalError;
  
  if (error instanceof Error) {
    message = error.message;
    
    // Map specific error types to appropriate MCP error codes
    if (error.message.includes('Authentication failed') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid token')) {
      code = ErrorCode.InvalidRequest;
    } else if (error.message.includes('Not found') ||
               error.message.includes('404')) {
      code = ErrorCode.InvalidRequest;
    } else if (error.message.includes('Timeout') ||
               error.message.includes('ECONNRESET') ||
               error.message.includes('ENOTFOUND')) {
      code = ErrorCode.InternalError;
    } else if (error.message.includes('Rate limit') ||
               error.message.includes('Too many requests')) {
      code = ErrorCode.InternalError;
    }
  } else if (typeof error === 'string') {
    message = error;
  } else {
    // For unknown error types, try to extract useful information
    try {
      message = JSON.stringify(error);
    } catch {
      message = fallbackMessage;
    }
  }

  // Enhance message with context
  const contextInfo = [];
  if (operation) {
    contextInfo.push(`operation: ${operation}`);
  }
  if (details && Object.keys(details).length > 0) {
    try {
      contextInfo.push(`details: ${JSON.stringify(details)}`);
    } catch {
      contextInfo.push('details: [unable to serialize]');
    }
  }

  const enhancedMessage = contextInfo.length > 0
    ? `${message} (${contextInfo.join(', ')})`
    : message;

  return new McpError(
    code,
    `${tool}: ${enhancedMessage}`
  );
}

export function handleApiError(
  error: unknown,
  tool: string,
  operation?: string,
  details?: Record<string, unknown>
): McpError {
  return createMcpError(error, { tool, operation, details });
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('timeout') ||
           error.message.includes('ETIMEDOUT') ||
           error.message.includes('ECONNRESET');
  }
  return false;
}

export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Authentication failed') ||
           error.message.includes('Unauthorized') ||
           error.message.includes('Invalid token') ||
           error.message.includes('401');
  }
  return false;
}

export function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Not found') ||
           error.message.includes('404');
  }
  return false;
}