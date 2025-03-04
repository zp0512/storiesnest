type StateChangeCallback<T> = (newState: T, oldState: T) => void;

export class StateManager<T extends object> {
  private state: T;
  private subscribers: Map<keyof T, Set<StateChangeCallback<T>>> = new Map();
  private history: T[] = [];
  private readonly MAX_HISTORY = 50;

  constructor(initialState: T) {
    this.state = { ...initialState };
    this.history.push({ ...initialState });
  }

  getState(): T {
    return { ...this.state };
  }

  setState(newState: Partial<T>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.history.push({ ...this.state });

    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }

    // Notify subscribers of changes
    Object.keys(newState).forEach(key => {
      const typedKey = key as keyof T;
      if (this.subscribers.has(typedKey)) {
        this.subscribers.get(typedKey)?.forEach(callback => {
          callback(this.state, oldState);
        });
      }
    });
  }

  subscribe(key: keyof T, callback: StateChangeCallback<T>): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback);
      if (this.subscribers.get(key)?.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  subscribeToAll(callback: StateChangeCallback<T>): () => void {
    const unsubscribeFns: (() => void)[] = [];
    
    Object.keys(this.state).forEach(key => {
      const typedKey = key as keyof T;
      unsubscribeFns.push(this.subscribe(typedKey, callback));
    });

    return () => {
      unsubscribeFns.forEach(unsubscribe => unsubscribe());
    };
  }

  getHistory(): T[] {
    return [...this.history];
  }

  undo(): boolean {
    if (this.history.length > 1) {
      this.history.pop(); // Remove current state
      this.state = { ...this.history[this.history.length - 1] };
      return true;
    }
    return false;
  }

  reset(): void {
    this.state = { ...this.history[0] };
    this.history = [this.state];
  }

  // Helper method to create a selector
  select<K>(selector: (state: T) => K): K {
    return selector(this.state);
  }

  // Helper method to create an action
  dispatch(action: (state: T) => Partial<T>): void {
    const changes = action(this.state);
    this.setState(changes);
  }

  // Helper method to create an async action
  async dispatchAsync(
    action: (state: T) => Promise<Partial<T>>
  ): Promise<void> {
    const changes = await action(this.state);
    this.setState(changes);
  }

  // Helper method to create a computed value
  compute<K>(computeFn: (state: T) => K): K {
    return computeFn(this.state);
  }

  // Helper method to create a memoized computed value
  memoize<K>(
    computeFn: (state: T) => K,
    dependencies: (keyof T)[]
  ): K {
    // Simple memoization based on dependency values
    const key = dependencies
      .map(dep => `${String(dep)}:${JSON.stringify(this.state[dep])}`)
      .join('|');
    
    if (!this.memoizedValues) {
      this.memoizedValues = new Map();
    }

    if (!this.memoizedValues.has(key)) {
      this.memoizedValues.set(key, computeFn(this.state));
    }

    return this.memoizedValues.get(key)!;
  }

  private memoizedValues?: Map<string, any>;

  // Helper method to create a side effect
  effect(effectFn: (state: T) => void | (() => void)): () => void {
    let cleanup: (() => void) | void;
    
    const unsubscribe = this.subscribeToAll((newState) => {
      if (cleanup) {
        cleanup();
      }
      cleanup = effectFn(newState);
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
      unsubscribe();
    };
  }
} 