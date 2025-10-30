import { ReactNode } from 'react';
import type { FeatureFlags } from './FeatureFlagContext';
import { useFeatureFlagsEnabled } from './hooks';

type FeatureFlagKey = keyof FeatureFlags;

/**
 * Props for the FeatureFlagGuard component.
 */
export interface FeatureFlagGuardProps {
  /**
   * Array of feature flag keys that must all be enabled for children to render.
   * If any flag is disabled, the component will render nothing.
   */
  requiredFlags: FeatureFlagKey[];
  /** Content to render when all required flags are enabled */
  children: ReactNode;
}

/**
 * Conditionally renders children based on feature flag state.
 *
 * This component is useful for hiding UI elements when feature flags are disabled.
 * Unlike {@link FeatureFlagRouteGuard}, this does not redirect - it simply renders
 * nothing if flags are not enabled.
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   return (
 *     <div>
 *       <h1>My Page</h1>
 *       <FeatureFlagGuard requiredFlags={['enable_full_features']}>
 *         <ExperimentalFeature />
 *       </FeatureFlagGuard>
 *     </div>
 *   );
 * }
 * ```
 */
export function FeatureFlagGuard({
  requiredFlags,
  children,
}: FeatureFlagGuardProps) {
  const allEnabled = useFeatureFlagsEnabled(...requiredFlags);

  if (!allEnabled) return null;

  return <>{children}</>;
}

export default FeatureFlagGuard;
