import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
