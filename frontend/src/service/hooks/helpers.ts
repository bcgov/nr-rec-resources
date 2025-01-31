/**
 * Retrieves the base path for API requests.
 * This function extracts the base URL from environment variables and removes the '/api' part if present.
 * If the VITE_API_BASE_URL is not set or is an empty string, it returns an empty string.
 *
 * @returns {string} The base path of the API.
 */
export const getBasePath = (): string => {
  return import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
};
