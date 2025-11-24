import { v4 as uuidv4 } from 'uuid';

/**
 * API Log Entry - tracks MCP tool calls
 */
export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  toolName: string;
  requestData: any;
  responseData: any;
  duration: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

/**
 * API Log Tracker
 * Tracks all MCP client tool calls for debugging and monitoring
 */
class ApiLogTracker {
  private logs: ApiLogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  /**
   * Add a new log entry
   */
  addLog(log: Omit<ApiLogEntry, 'id'>): ApiLogEntry {
    const entry: ApiLogEntry = {
      id: uuidv4(),
      ...log,
    };

    this.logs.push(entry);

    // Keep only last 100 logs to prevent memory bloat
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    return entry;
  }

  /**
   * Get all logs (newest first)
   */
  getLogs(): ApiLogEntry[] {
    return [...this.logs].reverse();
  }

  /**
   * Get logs filtered by status
   */
  getLogsByStatus(status: 'success' | 'error'): ApiLogEntry[] {
    return this.logs.filter(log => log.status === status).reverse();
  }

  /**
   * Get recent logs (limit)
   */
  getRecentLogs(limit: number): ApiLogEntry[] {
    return [...this.logs].reverse().slice(0, limit);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    console.log('[API Log] Clearing all logs');
    this.logs = [];
  }

  /**
   * Get log by ID
   */
  getLogById(id: string): ApiLogEntry | undefined {
    return this.logs.find(log => log.id === id);
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    success: number;
    error: number;
    averageDuration: number;
  } {
    const successLogs = this.logs.filter(log => log.status === 'success');
    const errorLogs = this.logs.filter(log => log.status === 'error');
    const avgDuration = this.logs.length > 0
      ? this.logs.reduce((sum, log) => sum + log.duration, 0) / this.logs.length
      : 0;

    return {
      total: this.logs.length,
      success: successLogs.length,
      error: errorLogs.length,
      averageDuration: Math.round(avgDuration),
    };
  }
}

// Singleton instance
export const apiLogTracker = new ApiLogTracker();

