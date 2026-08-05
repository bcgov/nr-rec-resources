import '@testing-library/jest-dom';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

// jsdom does not implement ResizeObserver, which the search results table uses to
// keep its synced scrollbars and frozen-column offsets up to date. The stub is
// inert: jsdom performs no layout, so there is nothing to observe or report.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {
      // Intentionally empty: no layout in jsdom, so no size changes to watch.
    }

    unobserve() {
      // Intentionally empty: nothing is being observed.
    }

    disconnect() {
      // Intentionally empty: nothing is being observed.
    }
  };
}

const users = [
  {
    id: 1,
    name: 'first post title',
    email: 'first post body',
  },
  // ...
];

export const restHandlers = [
  http.get('http://localhost:3000/api/v1/users', () => {
    return new HttpResponse(JSON.stringify(users), {
      status: 200,
    });
  }),
];

export const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
