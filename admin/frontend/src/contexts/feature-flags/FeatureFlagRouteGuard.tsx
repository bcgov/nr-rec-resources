import { ReactNode, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import type { FeatureFlags } from './FeatureFlagContext';
import { useFeatureFlagsEnabled } from './hooks';

type FeatureFlagKey = keyof FeatureFlags;

/**
 * Props for the FeatureFlagRouteGuard component.
 */
export interface FeatureFlagRouteGuardProps {
  /**
   * Array of feature flag keys that must all be enabled for children to render.
   * If any flag is disabled, the user will be redirected.
   */
  requiredFlags: FeatureFlagKey[];
  /** Content to render when all required flags are enabled */
  children: ReactNode;
  /**
   * Path to redirect to when flags are not enabled.
   * @default '/'
   */
  redirectTo?: string;
}

/**
 * Route guard component that redirects users when required feature flags are not enabled.
 *
 * This component is designed for use in route definitions to protect entire routes
 * based on feature flag state. When flags are disabled, it redirects to a specified path.
 *
 * @example
 * ```tsx
 * // In your route configuration
 * {
 *   path: '/experimental',
 *   element: (
 *     <FeatureFlagRouteGuard
 *       requiredFlags={['enable_full_features']}
 *       redirectTo="/home"
 *     >
 *       <ExperimentalPage />
 *     </FeatureFlagRouteGuard>
 *   ),
 * }
 * ```
 */
export function FeatureFlagRouteGuard({
  requiredFlags,
  children,
  redirectTo = '/',
}: FeatureFlagRouteGuardProps) {
  const allEnabled = useFeatureFlagsEnabled(...requiredFlags);

  const router = useRouter();

  useEffect(() => {
    if (!allEnabled) {
      router.navigate({ to: redirectTo, replace: true });
    }
  }, [allEnabled, redirectTo, router]);

  if (!allEnabled) return null;

  return <>{children}</>;
}
