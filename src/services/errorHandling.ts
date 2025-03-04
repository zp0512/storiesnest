import { v4 as uuidv4 } from 'uuid';

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ErrorCategory {
  RECORDING = 'RECORDING',
  STORAGE = 'STORAGE',
  AI = 'AI',
  TRANSCRIPTION = 'TRANSCRIPTION',
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  error: Error;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  stack?: string;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorLogs: ErrorLog[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {
    // Initialize error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined') {
      // Initialize client-side error tracking
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    }
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  handleError(
    error: Error,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context: ErrorContext
  ): void {
    const errorLog: ErrorLog = {
      id: uuidv4(),
      timestamp: new Date(),
      error,
      severity,
      category,
      context,
      stack: error.stack
    };

    this.logError(errorLog);
    this.notifyError(errorLog);
    this.persistError(errorLog);
  }

  private logError(errorLog: ErrorLog): void {
    // Add to in-memory logs
    this.errorLogs.push(errorLog);
    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs.shift();
    }

    // Log to console with appropriate level
    const logMessage = this.formatErrorMessage(errorLog);
    switch (errorLog.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(logMessage);
        break;
      case ErrorSeverity.HIGH:
        console.error(logMessage);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage);
        break;
      case ErrorSeverity.LOW:
        console.info(logMessage);
        break;
    }
  }

  private notifyError(errorLog: ErrorLog): void {
    // Notify error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(errorLog.error, {
        level: errorLog.severity.toLowerCase(),
        tags: {
          category: errorLog.category,
          userId: errorLog.context.userId,
          sessionId: errorLog.context.sessionId
        },
        extra: errorLog.context.metadata
      });
    }

    // Notify admin for critical errors
    if (errorLog.severity === ErrorSeverity.CRITICAL) {
      this.notifyAdmin(errorLog);
    }
  }

  private async persistError(errorLog: ErrorLog): Promise<void> {
    try {
      // Send to error logging service
      await fetch('/api/error-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorLog)
      });
    } catch (error) {
      console.error('Failed to persist error log:', error);
    }
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.handleError(
      event.error,
      ErrorSeverity.HIGH,
      ErrorCategory.UNKNOWN,
      {
        component: 'global',
        action: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }
    );
  }

  private handlePromiseError(event: PromiseRejectionEvent): void {
    this.handleError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      ErrorSeverity.HIGH,
      ErrorCategory.UNKNOWN,
      {
        component: 'global',
        action: 'unhandled_promise_rejection'
      }
    );
  }

  private notifyAdmin(errorLog: ErrorLog): void {
    // Implement admin notification (e.g., email, Slack)
    console.error('CRITICAL ERROR - Admin notification needed:', errorLog);
  }

  private formatErrorMessage(errorLog: ErrorLog): string {
    return `[${errorLog.timestamp.toISOString()}] ${errorLog.severity} - ${errorLog.category}: ${errorLog.error.message}`;
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  clearErrorLogs(): void {
    this.errorLogs = [];
  }
} 