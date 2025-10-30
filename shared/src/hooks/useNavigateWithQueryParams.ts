import { useCallback } from 'react';
import {
  useNavigate,
  useLocation,
  NavigateOptions,
  To,
} from 'react-router-dom';

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
    (to: To | number, options?: NavigateOptions) => {
      // Handle numeric navigation (e.g., navigate(-1) for going back)
      if (typeof to === 'number') {
        navigate(to);
        return;
      }

      // Preserve current search params
      const currentSearch = location.search;

      // Handle string paths
      if (typeof to === 'string') {
        navigate(`${to}${currentSearch}`, options);
        return;
      }

      // Handle object paths (To type with pathname, search, etc.)
      navigate(
        {
          ...to,
          search: to.search || currentSearch,
        },
        options,
      );
    },
    [navigate, location.search],
  );
};
