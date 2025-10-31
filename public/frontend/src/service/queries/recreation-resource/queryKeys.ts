/**
 * Centralized query keys for recreation resource API calls.
 * This ensures consistency between loaders and hooks, preventing duplicate API calls.
 */

export const RECREATION_RESOURCE_QUERY_KEYS = {
  all: ['recreation-resource'] as const,
  details: () => [...RECREATION_RESOURCE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) =>
    [...RECREATION_RESOURCE_QUERY_KEYS.details(), id] as const,
  siteOperator: (id: string) =>
    [...RECREATION_RESOURCE_QUERY_KEYS.all, 'site-operator', id] as const,
};
