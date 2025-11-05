/**
 * Centralized query keys for recreation resource admin API calls.
 * This ensures consistency between loaders and hooks, preventing duplicate API calls.
 */

export const RECREATION_RESOURCE_QUERY_KEYS = {
  all: ['recreation-resource-admin'] as const,
  detail: (id: string) => ['recreation-resource-admin', 'detail', id] as const,
  images: (id: string) => ['recreation-resource-admin', 'images', id] as const,
  documents: (id: string) =>
    ['recreation-resource-admin', 'documents', id] as const,
};
