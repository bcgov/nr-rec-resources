import { getBasePath } from './helpers';

describe('getBasePath', () => {
  it('should return the base path correctly when VITE_API_BASE_URL is set with /api', () => {
    process.env.VITE_API_BASE_URL = 'https://example.com/api';
    expect(getBasePath()).toBe('https://example.com');
  });

  it('should return an empty string when VITE_API_BASE_URL is not set', () => {
    delete process.env.VITE_API_BASE_URL;
    expect(getBasePath()).toBe('');
  });
});
