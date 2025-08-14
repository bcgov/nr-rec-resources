import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Global mocks for jsdom environment
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock CSS modules
vi.mock('*.scss', () => ({}));

// Mock IntersectionObserver
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock document methods
Object.defineProperty(document, 'createRange', {
  value: () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: document.createElement('div'),
  }),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3001');
  vi.stubEnv('VITE_MATOMO_URL', 'https://example.com');
  vi.stubEnv('VITE_MATOMO_SITE_ID', '1');
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
