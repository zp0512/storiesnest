interface PerformanceNavigationTiming extends PerformanceEntry {
  loadEventEnd: number;
  navigationStart: number;
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  loadEventStart: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
}

interface PerformanceResourceTiming extends PerformanceEntry {
  initiatorType: string;
  transferSize: number;
  nextHopProtocol: string;
  name: string;
  duration: number;
}

interface Performance {
  getEntriesByType(type: 'navigation'): PerformanceNavigationTiming[];
  getEntriesByType(type: 'resource'): PerformanceResourceTiming[];
  getEntriesByName(name: string): PerformanceEntry[];
} 