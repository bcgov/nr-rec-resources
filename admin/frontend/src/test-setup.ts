import '@testing-library/jest-dom';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

vi.mock('heic2any', () => {
  return {
    default: vi
      .fn()
      .mockResolvedValue(new Blob(['fake'], { type: 'image/webp' })),
  };
});

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
