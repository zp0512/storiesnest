import { PerformanceMonitoringService } from '@/services/performance';

describe('PerformanceMonitoringService', () => {
  let service: PerformanceMonitoringService;

  beforeEach(() => {
    service = PerformanceMonitoringService.getInstance();
    service.clearMetrics();
  });

  it('should be a singleton', () => {
    const instance1 = PerformanceMonitoringService.getInstance();
    const instance2 = PerformanceMonitoringService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should record metrics', () => {
    service.recordMetric({
      name: 'test_metric',
      value: 100,
      category: 'custom'
    });

    const metrics = service.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test_metric');
    expect(metrics[0].value).toBe(100);
    expect(metrics[0].category).toBe('custom');
  });

  it('should include metadata in metrics', () => {
    const metadata = { key: 'value' };
    service.recordMetric({
      name: 'test_metric',
      value: 100,
      category: 'custom',
      metadata
    });

    const metrics = service.getMetrics();
    expect(metrics[0].metadata).toEqual(metadata);
  });

  it('should limit the number of stored metrics', () => {
    // Create more metrics than the maximum
    for (let i = 0; i < 1100; i++) {
      service.recordMetric({
        name: `test_metric_${i}`,
        value: i,
        category: 'custom'
      });
    }

    const metrics = service.getMetrics();
    expect(metrics.length).toBeLessThanOrEqual(1000);
  });

  it('should clear metrics', () => {
    service.recordMetric({
      name: 'test_metric',
      value: 100,
      category: 'custom'
    });

    expect(service.getMetrics()).toHaveLength(1);
    service.clearMetrics();
    expect(service.getMetrics()).toHaveLength(0);
  });

  it('should measure synchronous operations', () => {
    const operation = () => {
      // Simulate some work
      for (let i = 0; i < 1000000; i++) {}
    };

    service.measureOperation('test_operation', operation);

    const metrics = service.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test_operation');
    expect(metrics[0].category).toBe('custom');
    expect(metrics[0].metadata?.async).toBe(false);
  });

  it('should measure asynchronous operations', async () => {
    const operation = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    };

    await service.measureOperation('test_operation', operation);

    const metrics = service.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test_operation');
    expect(metrics[0].category).toBe('custom');
    expect(metrics[0].metadata?.async).toBe(true);
  });

  it('should analyze slow page loads', () => {
    service.recordMetric({
      name: 'page_load',
      value: 3500, // 3.5 seconds
      category: 'navigation'
    });

    const metrics = service.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('page_load');
    expect(metrics[0].value).toBe(3500);
  });

  it('should analyze long tasks', () => {
    service.recordMetric({
      name: 'long_task',
      value: 60, // 60ms
      category: 'custom'
    });

    const metrics = service.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('long_task');
    expect(metrics[0].value).toBe(60);
  });

  it('should handle cleanup', () => {
    service.recordMetric({
      name: 'test_metric',
      value: 100,
      category: 'custom'
    });

    service.cleanup();
    expect(service.getMetrics()).toHaveLength(0);
  });
}); 