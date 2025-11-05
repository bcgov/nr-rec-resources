/**
 * Centralized query keys for recreation resource API calls.
 * This ensures consistency between loaders and hooks, preventing duplicate API calls.
 */

export const RECREATION_RESOURCE_QUERY_KEYS = {
  all: ['recreation-resource'] as const,
  detail: (id: string) => ['recreation-resource', 'detail', id] as const,
  siteOperator: (id: string) =>
    ['recreation-resource', 'site-operator', id] as const,
};
