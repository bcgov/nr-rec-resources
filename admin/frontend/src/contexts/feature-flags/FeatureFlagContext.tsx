import { createContext, ReactNode, useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';

/**
 * Defines the available feature flags in the application.
 *
 * Feature flags are controlled via URL search parameters and allow
 * for progressive feature rollout and A/B testing.
 */
export type FeatureFlags = {
  /** Enables full feature set including experimental features */
  enable_full_features: boolean;
};

/**
 * Context for managing feature flags throughout the application.
 *
 * Feature flags are determined by URL search parameters and can be
 * accessed via the {@link useFeatureFlagContext} hook.
 */
const FeatureFlagContext = createContext<FeatureFlags | undefined>(undefined);

export interface FeatureFlagProviderProps {
  /** Child components that will have access to feature flags */
  children: ReactNode;
}

/**
 * Provider component that manages feature flag state based on URL search parameters.
 *
 * This provider must be mounted within a React Router context as it uses
 * the `useSearchParams` hook to reactively read feature flags from the URL.
 *
 * @example
 * ```tsx
 * // In your router setup
 * <FeatureFlagProvider>
 *   <App />
 * </FeatureFlagProvider>
 *
 * // URL: /page?enable_full_features=true
 * // The enable_full_features flag will be true
 * ```
 */
export const FeatureFlagProvider = ({ children }: FeatureFlagProviderProps) => {
  const location = useLocation();

  const flags = useMemo<FeatureFlags>(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      enable_full_features: searchParams.get('enable_full_features') === 'true',
    };
  }, [location.search]);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagContext;
