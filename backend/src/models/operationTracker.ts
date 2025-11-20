import { v4 as uuidv4 } from 'uuid';
import {
  Operation,
  OperationType,
  OperationStatus,
  BulkOperationSession,
  BulkOperationProgress
} from '../../../shared/types';

/**
 * In-memory tracker for bulk operations
 */
export class OperationTracker {
  private sessions = new Map<string, BulkOperationSession>();

  /**
   * Create a new bulk operation session
   */
  createSession(type: OperationType, action: string, totalCount: number): string {
    const sessionId = uuidv4();
    const session: BulkOperationSession = {
      sessionId,
      type,
      action,
      status: 'running',
      operations: [],
      startTime: new Date(),
      totalCount,
      successCount: 0,
      failureCount: 0,
      cancelledCount: 0
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Add an operation to a session
   */
  addOperation(
    sessionId: string,
    type: OperationType,
    action: string,
    itemName: string,
    activityId?: string
  ): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const operationId = uuidv4();
    const operation: Operation = {
      id: operationId,
      type,
      action,
      status: 'queued',
      itemName,
      activityId
    };

    session.operations.push(operation);
    return operationId;
  }

  /**
   * Update operation status
   */
  updateOperation(
    sessionId: string,
    operationId: string,
    update: Partial<Operation>
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const operation = session.operations.find(op => op.id === operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found in session ${sessionId}`);
    }

    // Update operation fields
    Object.assign(operation, update);

    // Calculate duration if both times exist
    if (operation.startTime && operation.endTime) {
      operation.duration = new Date(operation.endTime).getTime() - new Date(operation.startTime).getTime();
    }

    // Update session counters
    this.updateSessionCounters(session);
  }

  /**
   * Update session counters based on operation statuses
   */
  private updateSessionCounters(session: BulkOperationSession): void {
    session.successCount = session.operations.filter(op => op.status === 'success').length;
    session.failureCount = session.operations.filter(op => op.status === 'failed').length;
    session.cancelledCount = session.operations.filter(op => op.status === 'cancelled').length;

    const completedCount = session.successCount + session.failureCount + session.cancelledCount;
    if (completedCount === session.totalCount) {
      session.status = 'completed';
      session.endTime = new Date();
    }
  }

  /**
   * Cancel a session and all queued operations
   */
  cancelSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'cancelled';

    // Cancel all queued operations
    session.operations.forEach(op => {
      if (op.status === 'queued') {
        op.status = 'cancelled';
        op.endTime = new Date();
      }
    });

    this.updateSessionCounters(session);
  }

  /**
   * Pause a session
   */
  pauseSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    session.status = 'paused';
  }

  /**
   * Resume a session
   */
  resumeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (session.status === 'paused') {
      session.status = 'running';
    }
  }

  /**
   * Get session details
   */
  getSession(sessionId: string): BulkOperationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all operations for a session
   */
  getOperations(sessionId: string): Operation[] {
    const session = this.sessions.get(sessionId);
    return session ? session.operations : [];
  }

  /**
   * Get progress for a session
   */
  getProgress(sessionId: string): BulkOperationProgress | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    const completedCount = session.successCount + session.failureCount + session.cancelledCount;
    const runningCount = session.operations.filter(op => op.status === 'running').length;
    const queuedCount = session.operations.filter(op => op.status === 'queued').length;

    return {
      sessionId,
      totalCount: session.totalCount,
      completedCount,
      successCount: session.successCount,
      failureCount: session.failureCount,
      cancelledCount: session.cancelledCount,
      runningCount,
      queuedCount,
      progress: session.totalCount > 0 ? (completedCount / session.totalCount) * 100 : 0
    };
  }

  /**
   * Get all sessions
   */
  getAllSessions(): BulkOperationSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Clear all sessions
   */
  clearAll(): void {
    this.sessions.clear();
  }
}

// Singleton instance
export const operationTracker = new OperationTracker();
