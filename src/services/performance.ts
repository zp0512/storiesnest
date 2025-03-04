import { v4 as uuidv4 } from 'uuid';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  category: 'navigation' | 'resource' | 'custom';
  metadata?: Record<string, any>;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;
  private observer: PerformanceObserver | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.setupNavigationTiming();
      this.setupResourceTiming();
    }
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  private initializeObservers(): void {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'long_task',
            value: entry.duration,
            category: 'custom',
            metadata: {
              startTime: entry.startTime,
              name: entry.name
            }
          });
        }
      });
      this.observer.observe({ entryTypes: ['longtask'] });
    }
  }

  private setupNavigationTiming(): void {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordMetric({
            name: 'page_load',
            value: navigation.loadEventEnd - navigation.navigationStart,
            category: 'navigation',
            metadata: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
              firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
              firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
            }
          });
        }
      });
    }
  }

  private setupResourceTiming(): void {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
          this.recordMetric({
            name: `resource_${resource.initiatorType}`,
            value: resource.duration,
            category: 'resource',
            metadata: {
              name: resource.name,
              size: resource.transferSize,
              protocol: resource.nextHopProtocol
            }
          });
        });
      });
    }
  }

  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      id: uuidv4(),
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    this.analyzeMetric(fullMetric);
    this.persistMetric(fullMetric);
  }

  private analyzeMetric(metric: PerformanceMetric): void {
    // Analyze performance metrics and trigger alerts if needed
    if (metric.category === 'navigation' && metric.name === 'page_load') {
      if (metric.value > 3000) { // 3 seconds
        console.warn('Slow page load detected:', metric);
        // Trigger alert
      }
    }

    if (metric.category === 'custom' && metric.name === 'long_task') {
      if (metric.value > 50) { // 50ms
        console.warn('Long task detected:', metric);
        // Trigger alert
      }
    }
  }

  private async persistMetric(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch('/api/performance-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to persist performance metric:', error);
    }
  }

  measureOperation(name: string, operation: () => void | Promise<any>): void {
    const start = performance.now();
    const result = operation();
    
    if (result instanceof Promise) {
      result.then(() => {
        const duration = performance.now() - start;
        this.recordMetric({
          name,
          value: duration,
          category: 'custom',
          metadata: { async: true }
        });
      });
    } else {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        category: 'custom',
        metadata: { async: false }
      });
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.clearMetrics();
  }
} 