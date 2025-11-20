/**
 * Semaphore for controlling concurrency of async operations
 */
export class Semaphore {
  private permits: number;
  private readonly maxPermits: number;
  private waitQueue: Array<() => void> = [];

  constructor(maxPermits: number) {
    if (maxPermits <= 0) {
      throw new Error('Semaphore permits must be greater than 0');
    }
    this.maxPermits = maxPermits;
    this.permits = maxPermits;
  }

  /**
   * Acquire a permit. Waits if no permits available.
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  /**
   * Release a permit and notify waiting tasks.
   */
  release(): void {
    if (this.permits >= this.maxPermits) {
      throw new Error('Cannot release more permits than max');
    }

    this.permits++;

    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      if (resolve) {
        this.permits--;
        resolve();
      }
    }
  }

  /**
   * Get current available permits
   */
  available(): number {
    return this.permits;
  }

  /**
   * Get number of waiting tasks
   */
  waiting(): number {
    return this.waitQueue.length;
  }

  /**
   * Execute a function with semaphore control
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}
