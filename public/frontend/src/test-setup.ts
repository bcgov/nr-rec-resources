import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });

const originalFetch = global.fetch;
global.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === 'string' && input.startsWith('/')) {
    input = `http://localhost${input}`;
  }
  return originalFetch(input, init);
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
