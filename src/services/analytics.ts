import { v4 as uuidv4 } from 'uuid';

export enum EventCategory {
  USER = 'USER',
  RECORDING = 'RECORDING',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
  ERROR = 'ERROR'
}

export enum EventAction {
  // User events
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  SIGN_OUT = 'SIGN_OUT',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  
  // Recording events
  START_RECORDING = 'START_RECORDING',
  STOP_RECORDING = 'STOP_RECORDING',
  SAVE_RECORDING = 'SAVE_RECORDING',
  DELETE_RECORDING = 'DELETE_RECORDING',
  SHARE_RECORDING = 'SHARE_RECORDING',
  
  // AI events
  AI_GUIDANCE = 'AI_GUIDANCE',
  AI_ANALYSIS = 'AI_ANALYSIS',
  AI_SUGGESTION = 'AI_SUGGESTION',
  
  // System events
  PAGE_VIEW = 'PAGE_VIEW',
  FEATURE_USE = 'FEATURE_USE',
  PERFORMANCE = 'PERFORMANCE',
  
  // Error events
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  ERROR_RESOLVED = 'ERROR_RESOLVED'
}

export interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  category: EventCategory;
  action: EventAction;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private sessionId: string;

  private constructor() {
    this.sessionId = uuidv4();
    if (typeof window !== 'undefined') {
      this.setupPageTracking();
      this.setupUserTracking();
    }
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private setupPageTracking(): void {
    if (typeof window !== 'undefined') {
      // Track page views
      window.addEventListener('popstate', () => {
        this.trackEvent(EventCategory.SYSTEM, EventAction.PAGE_VIEW, {
          path: window.location.pathname,
          title: document.title
        });
      });

      // Track initial page view
      this.trackEvent(EventCategory.SYSTEM, EventAction.PAGE_VIEW, {
        path: window.location.pathname,
        title: document.title
      });
    }
  }

  private setupUserTracking(): void {
    if (typeof window !== 'undefined') {
      // Track user interactions
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.dataset.analytics) {
          const { category, action } = JSON.parse(target.dataset.analytics);
          this.trackEvent(category, action, {
            element: target.tagName,
            text: target.textContent,
            path: target.getAttribute('href')
          });
        }
      });
    }
  }

  trackEvent(
    category: EventCategory,
    action: EventAction,
    metadata?: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      category,
      action,
      sessionId: this.sessionId,
      metadata
    };

    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    this.persistEvent(event);
    this.analyzeEvent(event);
  }

  private async persistEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to persist analytics event:', error);
    }
  }

  private analyzeEvent(event: AnalyticsEvent): void {
    // Analyze events and trigger actions if needed
    if (event.category === EventCategory.ERROR) {
      console.warn('Error event detected:', event);
      // Trigger error handling
    }

    if (event.category === EventCategory.RECORDING) {
      // Track recording metrics
      console.info('Recording event:', event);
    }
  }

  setUserId(userId: string): void {
    // Update all events in the current session with the user ID
    this.events = this.events.map(event => ({
      ...event,
      userId
    }));
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  // Helper method to create analytics-aware elements
  static createAnalyticsElement(
    element: HTMLElement,
    category: EventCategory,
    action: EventAction,
    metadata?: Record<string, any>
  ): HTMLElement {
    element.dataset.analytics = JSON.stringify({
      category,
      action,
      metadata
    });
    return element;
  }
} 