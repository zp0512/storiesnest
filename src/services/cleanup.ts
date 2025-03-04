type CleanupFunction = () => void | Promise<void>;

export class CleanupService {
  private static instance: CleanupService;
  private cleanupTasks: Map<string, CleanupFunction> = new Map();
  private isCleaningUp: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Handle page unload
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });

      // Handle visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.cleanupInactiveResources();
        }
      });
    }
  }

  static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  registerCleanupTask(id: string, cleanupFn: CleanupFunction): void {
    this.cleanupTasks.set(id, cleanupFn);
  }

  unregisterCleanupTask(id: string): void {
    this.cleanupTasks.delete(id);
  }

  async cleanup(): Promise<void> {
    if (this.isCleaningUp) {
      return;
    }

    this.isCleaningUp = true;

    try {
      const cleanupPromises: Promise<void>[] = [];

      for (const [id, cleanupFn] of Array.from(this.cleanupTasks.entries())) {
        try {
          const result = cleanupFn();
          if (result instanceof Promise) {
            cleanupPromises.push(result);
          }
        } catch (error) {
          console.error(`Cleanup failed for task ${id}:`, error);
        }
      }

      await Promise.all(cleanupPromises);
    } finally {
      this.isCleaningUp = false;
      this.cleanupTasks.clear();
    }
  }

  private async cleanupInactiveResources(): Promise<void> {
    // Clean up resources that can be safely removed when the page is not visible
    const inactiveTasks = Array.from(this.cleanupTasks.entries())
      .filter(([id]) => id.startsWith('inactive_'));

    for (const [id, cleanupFn] of inactiveTasks) {
      try {
        const result = cleanupFn();
        if (result instanceof Promise) {
          await result;
        }
        this.cleanupTasks.delete(id);
      } catch (error) {
        console.error(`Inactive resource cleanup failed for task ${id}:`, error);
      }
    }
  }

  // Helper method to create a cleanup task with automatic registration
  createCleanupTask(id: string, cleanupFn: CleanupFunction): CleanupFunction {
    this.registerCleanupTask(id, cleanupFn);

    // Return a function that will unregister the cleanup task
    return () => {
      this.unregisterCleanupTask(id);
    };
  }

  // Helper method to create a cleanup task for inactive resources
  createInactiveCleanupTask(id: string, cleanupFn: CleanupFunction): CleanupFunction {
    return this.createCleanupTask(`inactive_${id}`, cleanupFn);
  }

  // Helper method to create a cleanup task with timeout
  createTimeoutCleanupTask(
    id: string,
    cleanupFn: CleanupFunction,
    timeout: number
  ): CleanupFunction {
    const timeoutId = setTimeout(() => {
      cleanupFn();
      this.unregisterCleanupTask(id);
    }, timeout);

    return this.createCleanupTask(id, () => {
      clearTimeout(timeoutId);
      cleanupFn();
    });
  }

  // Helper method to create a cleanup task for event listeners
  createEventListenerCleanupTask(
    id: string,
    element: EventTarget,
    event: string,
    handler: EventListener
  ): CleanupFunction {
    element.addEventListener(event, handler);
    return this.createCleanupTask(id, () => {
      element.removeEventListener(event, handler);
    });
  }

  // Helper method to create a cleanup task for intervals
  createIntervalCleanupTask(
    id: string,
    callback: () => void,
    interval: number
  ): CleanupFunction {
    const intervalId = setInterval(callback, interval);
    return this.createCleanupTask(id, () => {
      clearInterval(intervalId);
    });
  }

  // Helper method to create a cleanup task for observers
  createObserverCleanupTask(
    id: string,
    observer: { disconnect: () => void }
  ): CleanupFunction {
    return this.createCleanupTask(id, () => {
      observer.disconnect();
    });
  }

  // Helper method to create a cleanup task for media streams
  createMediaStreamCleanupTask(
    id: string,
    stream: MediaStream
  ): CleanupFunction {
    return this.createCleanupTask(id, () => {
      stream.getTracks().forEach(track => track.stop());
    });
  }

  // Helper method to create a cleanup task for WebSocket connections
  createWebSocketCleanupTask(
    id: string,
    socket: WebSocket
  ): CleanupFunction {
    return this.createCleanupTask(id, () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });
  }
} 