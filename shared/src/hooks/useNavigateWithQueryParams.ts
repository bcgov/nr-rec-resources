import { useCallback } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';

/**
 * Custom hook that wraps React Router's useNavigate to preserve query parameters
 * @returns A navigate function that automatically preserves current query params
 *
 * @example
 * ```tsx
 * const navigate = useNavigateWithQueryParams();
 *
 * // Navigate to '/home' while preserving query params like ?enable_edit=true
 * navigate('/home');
 *
 * // Navigate with additional options
 * navigate('/home', { replace: true });
 * ```
 */
export const useNavigateWithQueryParams = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      // Handle numeric navigation (e.g., navigate(-1) for going back)
      if (typeof to === 'number') {
        navigate({ to, replace: options?.replace });
        return;
      }

      // Preserve current search params
      const currentSearch = location.search;

      navigate({ to: `${to}${currentSearch}`, replace: options?.replace });
    },
    [navigate, location.search],
  );
};
