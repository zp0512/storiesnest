import { ErrorHandlingService, ErrorSeverity, ErrorCategory } from '@/services/errorHandling';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;

  beforeEach(() => {
    service = ErrorHandlingService.getInstance();
    service.clearErrorLogs();
  });

  it('should be a singleton', () => {
    const instance1 = ErrorHandlingService.getInstance();
    const instance2 = ErrorHandlingService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should handle errors with different severities', () => {
    const error = new Error('Test error');
    const context = { component: 'test', action: 'test' };

    service.handleError(error, ErrorSeverity.LOW, ErrorCategory.UNKNOWN, context);
    service.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);
    service.handleError(error, ErrorSeverity.HIGH, ErrorCategory.UNKNOWN, context);
    service.handleError(error, ErrorSeverity.CRITICAL, ErrorCategory.UNKNOWN, context);

    const logs = service.getErrorLogs();
    expect(logs).toHaveLength(4);
    expect(logs[0].severity).toBe(ErrorSeverity.LOW);
    expect(logs[1].severity).toBe(ErrorSeverity.MEDIUM);
    expect(logs[2].severity).toBe(ErrorSeverity.HIGH);
    expect(logs[3].severity).toBe(ErrorSeverity.CRITICAL);
  });

  it('should handle errors with different categories', () => {
    const error = new Error('Test error');
    const context = { component: 'test', action: 'test' };

    service.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.RECORDING, context);
    service.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.STORAGE, context);
    service.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.AI, context);

    const logs = service.getErrorLogs();
    expect(logs).toHaveLength(3);
    expect(logs[0].category).toBe(ErrorCategory.RECORDING);
    expect(logs[1].category).toBe(ErrorCategory.STORAGE);
    expect(logs[2].category).toBe(ErrorCategory.AI);
  });

  it('should include context in error logs', () => {
    const error = new Error('Test error');
    const context = {
      userId: '123',
      sessionId: '456',
      component: 'test',
      action: 'test',
      metadata: { key: 'value' }
    };

    service.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);

    const logs = service.getErrorLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].context).toEqual(context);
  });

  it('should limit the number of stored logs', () => {
    const error = new Error('Test error');
    const context = { component: 'test', action: 'test' };

    // Create more logs than the maximum
    for (let i = 0; i < 1100; i++) {
      service.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);
    }

    const logs = service.getErrorLogs();
    expect(logs.length).toBeLessThanOrEqual(1000);
  });

  it('should clear error logs', () => {
    const error = new Error('Test error');
    const context = { component: 'test', action: 'test' };

    service.handleError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);
    expect(service.getErrorLogs()).toHaveLength(1);

    service.clearErrorLogs();
    expect(service.getErrorLogs()).toHaveLength(0);
  });

  it('should handle global errors', () => {
    const error = new Error('Global error');
    const errorEvent = new ErrorEvent('error', {
      error,
      filename: 'test.js',
      lineno: 1,
      colno: 1
    });

    window.dispatchEvent(errorEvent);

    const logs = service.getErrorLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].severity).toBe(ErrorSeverity.HIGH);
    expect(logs[0].category).toBe(ErrorCategory.UNKNOWN);
    expect(logs[0].context.component).toBe('global');
    expect(logs[0].context.action).toBe('unhandled_error');
  });

  it('should handle promise rejections', () => {
    const error = new Error('Promise rejection');
    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      reason: error
    });

    window.dispatchEvent(rejectionEvent);

    const logs = service.getErrorLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].severity).toBe(ErrorSeverity.HIGH);
    expect(logs[0].category).toBe(ErrorCategory.UNKNOWN);
    expect(logs[0].context.component).toBe('global');
    expect(logs[0].context.action).toBe('unhandled_promise_rejection');
  });
}); 