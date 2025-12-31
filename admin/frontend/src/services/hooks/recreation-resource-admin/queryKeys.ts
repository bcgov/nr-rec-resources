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
  activities: (id: string) =>
    ['recreation-resource-admin', 'activities', id] as const,
  features: (id: string) =>
    ['recreation-resource-admin', 'features', id] as const,
  fees: (id: string) => ['recreation-resource-admin', 'fees', id] as const,
  geospatial: (id: string) =>
    ['recreation-resource-admin', 'geospatial', id] as const,
  options: (types: string[]) =>
    ['recreation-resource-options', ...types] as const,
};
