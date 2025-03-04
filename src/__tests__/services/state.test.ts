import { StateManager } from '@/services/state';

interface TestState {
  count: number;
  text: string;
  items: string[];
}

describe('StateManager', () => {
  let stateManager: StateManager<TestState>;

  beforeEach(() => {
    stateManager = new StateManager<TestState>({
      count: 0,
      text: '',
      items: []
    });
  });

  it('should initialize with initial state', () => {
    const state = stateManager.getState();
    expect(state).toEqual({
      count: 0,
      text: '',
      items: []
    });
  });

  it('should update state', () => {
    stateManager.setState({ count: 1, text: 'test' });

    const state = stateManager.getState();
    expect(state).toEqual({
      count: 1,
      text: 'test',
      items: []
    });
  });

  it('should notify subscribers of changes', () => {
    const callback = jest.fn();
    stateManager.subscribe('count', callback);
    stateManager.setState({ count: 1 });

    expect(callback).toHaveBeenCalledWith(
      { count: 1, text: '', items: [] },
      { count: 0, text: '', items: [] }
    );
  });

  it('should notify subscribers of specific field changes', () => {
    const countCallback = jest.fn();
    const textCallback = jest.fn();

    stateManager.subscribe('count', countCallback);
    stateManager.subscribe('text', textCallback);

    stateManager.setState({ count: 1 });
    expect(countCallback).toHaveBeenCalled();
    expect(textCallback).not.toHaveBeenCalled();

    stateManager.setState({ text: 'test' });
    expect(textCallback).toHaveBeenCalled();
  });

  it('should unsubscribe from changes', () => {
    const callback = jest.fn();
    const unsubscribe = stateManager.subscribe('count', callback);
    
    stateManager.setState({ count: 1 });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    stateManager.setState({ count: 2 });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should maintain history', () => {
    stateManager.setState({ count: 1 });
    stateManager.setState({ count: 2 });
    stateManager.setState({ count: 3 });

    const history = stateManager.getHistory();
    expect(history).toHaveLength(4); // Including initial state
    expect(history[0].count).toBe(0);
    expect(history[1].count).toBe(1);
    expect(history[2].count).toBe(2);
    expect(history[3].count).toBe(3);
  });

  it('should limit history size', () => {
    // Create more states than the maximum
    for (let i = 0; i < 60; i++) {
      stateManager.setState({ count: i });
    }

    const history = stateManager.getHistory();
    expect(history.length).toBeLessThanOrEqual(50);
  });

  it('should undo state changes', () => {
    stateManager.setState({ count: 1 });
    stateManager.setState({ count: 2 });
    stateManager.setState({ count: 3 });

    expect(stateManager.undo()).toBe(true);
    expect(stateManager.getState().count).toBe(2);

    expect(stateManager.undo()).toBe(true);
    expect(stateManager.getState().count).toBe(1);

    expect(stateManager.undo()).toBe(true);
    expect(stateManager.getState().count).toBe(0);

    expect(stateManager.undo()).toBe(false);
  });

  it('should reset to initial state', () => {
    stateManager.setState({ count: 1, text: 'test' });
    stateManager.reset();

    expect(stateManager.getState()).toEqual({
      count: 0,
      text: '',
      items: []
    });
  });

  it('should select specific state values', () => {
    stateManager.setState({ count: 1, text: 'test' });

    const count = stateManager.select(state => state.count);
    const text = stateManager.select(state => state.text);

    expect(count).toBe(1);
    expect(text).toBe('test');
  });

  it('should dispatch actions', () => {
    stateManager.dispatch(state => ({
      count: state.count + 1
    }));

    expect(stateManager.getState().count).toBe(1);
  });

  it('should dispatch async actions', async () => {
    await stateManager.dispatchAsync(async state => ({
      count: state.count + 1
    }));

    expect(stateManager.getState().count).toBe(1);
  });

  it('should compute derived values', () => {
    stateManager.setState({ count: 2, text: 'test' });

    const doubledCount = stateManager.compute(state => state.count * 2);
    const upperText = stateManager.compute(state => state.text.toUpperCase());

    expect(doubledCount).toBe(4);
    expect(upperText).toBe('TEST');
  });

  it('should memoize computed values', () => {
    const computeFn = jest.fn(state => state.count * 2);
    stateManager.setState({ count: 1 });

    const result1 = stateManager.memoize(computeFn, ['count']);
    const result2 = stateManager.memoize(computeFn, ['count']);

    expect(result1).toBe(2);
    expect(result2).toBe(2);
    expect(computeFn).toHaveBeenCalledTimes(1);
  });

  it('should handle side effects', () => {
    const cleanup = jest.fn();
    const effect = jest.fn().mockReturnValue(cleanup);

    const unsubscribe = stateManager.effect(effect);

    stateManager.setState({ count: 1 });
    expect(effect).toHaveBeenCalled();
    expect(cleanup).not.toHaveBeenCalled();

    unsubscribe();
    expect(cleanup).toHaveBeenCalled();
  });
}); 