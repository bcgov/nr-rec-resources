/**
 * Retrieves the base path for API requests.
 * @returns {string} The base path of the API with '/api' removed, or empty string if not configured.
 */
export const getBasePath = (): string =>
  import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
