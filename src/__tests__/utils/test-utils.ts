/// <reference types="@testing-library/jest-dom" />
/// <reference types="@testing-library/react" />

import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';

// Add any providers here
function render(ui: ReactElement, options = {}) {
  return rtlRender(ui, { ...options });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const createMockInterview = (overrides = {}) => ({
  id: '1',
  title: 'Test Interview',
  description: 'Test Description',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

// Mock error responses
export const mockApiError = (message: string, status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ message }),
  });
};

// Mock WebSocket
export class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = MockWebSocket.OPEN;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: Event) => void) | null = null;

  constructor(url: string) {
    // Mock implementation
  }

  send(data: string) {
    // Mock implementation
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose();
    }
  }

  // Helper to simulate receiving a message
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  // Helper to simulate an error
  simulateError(error: Event) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

// Mock MediaRecorder
export class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(stream: MediaStream) {
    // Mock implementation
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  // Helper to simulate data available
  simulateDataAvailable(blob: Blob) {
    if (this.ondataavailable) {
      this.ondataavailable(new BlobEvent('dataavailable', { data: blob }));
    }
  }

  // Helper to simulate an error
  simulateError(error: ErrorEvent) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
} 