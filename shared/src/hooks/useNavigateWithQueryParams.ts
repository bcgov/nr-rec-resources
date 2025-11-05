import { useCallback } from 'react';
import {
  useLocation,
  useNavigate,
  useRouter,
  type NavigateOptions,
} from '@tanstack/react-router';

/**
 * Custom hook that wraps TanStack Router's useNavigate to preserve query parameters
 * @returns An object with navigate and navigateBack functions
 *
 * @example
 * ```tsx
 * const { navigate, navigateBack } = useNavigateWithQueryParams();
 *
 * // Navigate to '/home' while preserving query params like ?enable_edit=true
 * navigate({ to: '/home' });
 *
 * // Navigate with params and preserve query params
 * navigate({ to: '/rec-resource/$id/overview', params: { id: '123' } });
 *
 * // Navigate back
 * navigateBack(); // or navigateBack(-1)
 * ```
 */
export const useNavigateWithQueryParams = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();

  const navigateWithParams = useCallback(
    (options: NavigateOptions) => {
      // Preserve current search params
      const currentSearch = location.search;

      // Handle object paths (To type with pathname, search, etc.)
      navigate({
        ...options,
        search: options.search || currentSearch,
      });
    },
    [navigate, location.search],
  );

  const navigateBack = useCallback(
    (steps: number = -1) => {
      router.history.go(steps);
    },
    [router.history],
  );

  return { navigate: navigateWithParams, navigateBack };
};
