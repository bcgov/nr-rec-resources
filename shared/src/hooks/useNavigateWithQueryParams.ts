import { useCallback } from 'react';
import {
  useLocation,
  useNavigate,
  useRouter,
  type NavigateOptions,
} from '@tanstack/react-router';

/**
 * Custom hook that wraps TanStack Router's useNavigate to preserve query parameters
 * @returns A navigate function that automatically preserves current query params
 *
 * @example
 * ```tsx
 * const navigate = useNavigateWithQueryParams();
 *
 * // Navigate to '/home' while preserving query params like ?enable_edit=true
 * navigate({ to: '/home' });
 *
 * // Navigate with params and preserve query params
 * navigate({ to: '/rec-resource/$id/overview', params: { id: '123' } });
 *
 * // Navigate back
 * navigate(-1);
 * ```
 */
export const useNavigateWithQueryParams = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();

  return useCallback(
    (options: NavigateOptions | number) => {
      // Handle numeric navigation (e.g., navigate(-1) for going back)
      if (typeof options === 'number') {
        router.history.go(options);
        return;
      }

      // Preserve current search params
      const currentSearch = location.search;

      // Handle object paths (To type with pathname, search, etc.)
      navigate({
        ...options,
        search: options.search || currentSearch,
      });
    },
    [navigate, router.history, location.search],
  );
};
