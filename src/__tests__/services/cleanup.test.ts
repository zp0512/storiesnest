import { CleanupService } from '@/services/cleanup';

describe('CleanupService', () => {
  let service: CleanupService;

  beforeEach(() => {
    service = CleanupService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = CleanupService.getInstance();
    const instance2 = CleanupService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register and unregister cleanup tasks', () => {
    const cleanupFn = jest.fn();
    service.registerCleanupTask('test', cleanupFn);

    service.cleanup();
    expect(cleanupFn).toHaveBeenCalled();

    service.unregisterCleanupTask('test');
    service.cleanup();
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });

  it('should handle async cleanup tasks', async () => {
    const cleanupFn = jest.fn().mockImplementation(() => Promise.resolve());
    service.registerCleanupTask('test', cleanupFn);

    await service.cleanup();
    expect(cleanupFn).toHaveBeenCalled();
  });

  it('should handle cleanup task errors', async () => {
    const error = new Error('Cleanup failed');
    const cleanupFn = jest.fn().mockImplementation(() => {
      throw error;
    });

    service.registerCleanupTask('test', cleanupFn);

    await service.cleanup();
    expect(cleanupFn).toHaveBeenCalled();
  });

  it('should create cleanup tasks with automatic registration', () => {
    const cleanupFn = jest.fn();
    const unregister = service.createCleanupTask('test', cleanupFn);

    service.cleanup();
    expect(cleanupFn).toHaveBeenCalled();

    unregister();
    service.cleanup();
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });

  it('should create cleanup tasks for inactive resources', () => {
    const cleanupFn = jest.fn();
    const unregister = service.createInactiveCleanupTask('test', cleanupFn);

    service.cleanupInactiveResources();
    expect(cleanupFn).toHaveBeenCalled();

    unregister();
    service.cleanupInactiveResources();
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });

  it('should create cleanup tasks with timeout', () => {
    jest.useFakeTimers();

    const cleanupFn = jest.fn();
    const unregister = service.createTimeoutCleanupTask('test', cleanupFn, 1000);

    jest.advanceTimersByTime(1000);
    expect(cleanupFn).toHaveBeenCalled();

    unregister();
    jest.advanceTimersByTime(1000);
    expect(cleanupFn).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('should create cleanup tasks for event listeners', () => {
    const element = document.createElement('div');
    const handler = jest.fn();
    const unregister = service.createEventListenerCleanupTask(
      'test',
      element,
      'click',
      handler
    );

    element.click();
    expect(handler).toHaveBeenCalled();

    unregister();
    element.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should create cleanup tasks for intervals', () => {
    jest.useFakeTimers();

    const callback = jest.fn();
    const unregister = service.createIntervalCleanupTask('test', callback, 1000);

    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalled();

    unregister();
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('should create cleanup tasks for observers', () => {
    const observer = {
      disconnect: jest.fn()
    };

    const unregister = service.createObserverCleanupTask('test', observer);

    unregister();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('should create cleanup tasks for media streams', () => {
    const track1 = { stop: jest.fn() };
    const track2 = { stop: jest.fn() };
    const stream = {
      getTracks: jest.fn().mockReturnValue([track1, track2])
    } as unknown as MediaStream;

    const unregister = service.createMediaStreamCleanupTask('test', stream);

    unregister();
    expect(track1.stop).toHaveBeenCalled();
    expect(track2.stop).toHaveBeenCalled();
  });

  it('should create cleanup tasks for WebSocket connections', () => {
    const socket = {
      readyState: WebSocket.OPEN,
      close: jest.fn()
    } as unknown as WebSocket;

    const unregister = service.createWebSocketCleanupTask('test', socket);

    unregister();
    expect(socket.close).toHaveBeenCalled();
  });

  it('should handle cleanup when page is unloaded', () => {
    const cleanupFn = jest.fn();
    service.registerCleanupTask('test', cleanupFn);

    window.dispatchEvent(new Event('beforeunload'));
    expect(cleanupFn).toHaveBeenCalled();
  });

  it('should handle cleanup when page visibility changes', () => {
    const cleanupFn = jest.fn();
    service.registerCleanupTask('inactive_test', cleanupFn);

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden'
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(cleanupFn).toHaveBeenCalled();
  });
}); 