/**
 * Centralized query keys for recreation resource admin API calls.
 * This ensures consistency between loaders and hooks, preventing duplicate API calls.
 */

export const RECREATION_RESOURCE_QUERY_KEYS = {
  all: ['recreation-resource-admin'] as const,
  details: () => [...RECREATION_RESOURCE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) =>
    [...RECREATION_RESOURCE_QUERY_KEYS.details(), id] as const,
  images: (id: string) =>
    [...RECREATION_RESOURCE_QUERY_KEYS.all, 'images', id] as const,
  documents: (id: string) =>
    [...RECREATION_RESOURCE_QUERY_KEYS.all, 'documents', id] as const,
};
