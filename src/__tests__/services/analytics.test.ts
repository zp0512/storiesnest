import { AnalyticsService, EventCategory, EventAction } from '@/services/analytics';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = AnalyticsService.getInstance();
    service.clearEvents();
  });

  it('should be a singleton', () => {
    const instance1 = AnalyticsService.getInstance();
    const instance2 = AnalyticsService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should track events', () => {
    service.trackEvent(EventCategory.USER, EventAction.SIGN_IN);

    const events = service.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].category).toBe(EventCategory.USER);
    expect(events[0].action).toBe(EventAction.SIGN_IN);
  });

  it('should include metadata in events', () => {
    const metadata = { key: 'value' };
    service.trackEvent(EventCategory.USER, EventAction.SIGN_IN, metadata);

    const events = service.getEvents();
    expect(events[0].metadata).toEqual(metadata);
  });

  it('should limit the number of stored events', () => {
    // Create more events than the maximum
    for (let i = 0; i < 1100; i++) {
      service.trackEvent(EventCategory.USER, EventAction.SIGN_IN);
    }

    const events = service.getEvents();
    expect(events.length).toBeLessThanOrEqual(1000);
  });

  it('should clear events', () => {
    service.trackEvent(EventCategory.USER, EventAction.SIGN_IN);
    expect(service.getEvents()).toHaveLength(1);

    service.clearEvents();
    expect(service.getEvents()).toHaveLength(0);
  });

  it('should set user ID for events', () => {
    const userId = '123';
    service.trackEvent(EventCategory.USER, EventAction.SIGN_IN);
    service.setUserId(userId);

    const events = service.getEvents();
    expect(events[0].userId).toBe(userId);
  });

  it('should create analytics-aware elements', () => {
    const element = document.createElement('button');
    const category = EventCategory.USER;
    const action = EventAction.SIGN_IN;
    const metadata = { key: 'value' };

    AnalyticsService.createAnalyticsElement(element, category, action, metadata);

    expect(element.dataset.analytics).toBeDefined();
    const analyticsData = JSON.parse(element.dataset.analytics!);
    expect(analyticsData.category).toBe(category);
    expect(analyticsData.action).toBe(action);
    expect(analyticsData.metadata).toEqual(metadata);
  });

  it('should track page views', () => {
    // Simulate page view
    window.dispatchEvent(new PopStateEvent('popstate'));

    const events = service.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].category).toBe(EventCategory.SYSTEM);
    expect(events[0].action).toBe(EventAction.PAGE_VIEW);
    expect(events[0].metadata).toBeDefined();
    expect(events[0].metadata?.path).toBeDefined();
    expect(events[0].metadata?.title).toBeDefined();
  });

  it('should track user interactions', () => {
    const element = document.createElement('button');
    element.textContent = 'Click me';
    element.dataset.analytics = JSON.stringify({
      category: EventCategory.USER,
      action: EventAction.SIGN_IN
    });

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    const events = service.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].category).toBe(EventCategory.USER);
    expect(events[0].action).toBe(EventAction.SIGN_IN);
    expect(events[0].metadata).toBeDefined();
    expect(events[0].metadata?.element).toBe('BUTTON');
    expect(events[0].metadata?.text).toBe('Click me');
  });

  it('should analyze events', () => {
    service.trackEvent(EventCategory.ERROR, EventAction.ERROR_OCCURRED);
    service.trackEvent(EventCategory.RECORDING, EventAction.START_RECORDING);

    const events = service.getEvents();
    expect(events).toHaveLength(2);
  });
}); 