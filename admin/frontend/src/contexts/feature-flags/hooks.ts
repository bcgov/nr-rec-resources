import { useContext, useMemo } from 'react';
import FeatureFlagContext, { type FeatureFlags } from './FeatureFlagContext';

/**
 * Hook to access the current feature flag configuration.
 *
 * @returns The current feature flags object containing all flag states
 * @throws {Error} If used outside of a FeatureFlagProvider
 */
export function useFeatureFlagContext(): FeatureFlags {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) {
    throw new Error(
      'useFeatureFlagContext must be used within a FeatureFlagProvider',
    );
  }
  return ctx;
}

/**
 * Hook to check if all specified feature flags are enabled.
 *
 * @param flagNames - One or more feature flag keys to check
 * @returns `true` if all specified flags are enabled, `false` otherwise
 */
export function useFeatureFlagsEnabled(
  ...flagNames: (keyof FeatureFlags)[]
): boolean {
  const flags = useFeatureFlagContext();
  return useMemo(
    () => flagNames.every((flag) => flags[flag]),
    [flags, ...flagNames],
  );
}
