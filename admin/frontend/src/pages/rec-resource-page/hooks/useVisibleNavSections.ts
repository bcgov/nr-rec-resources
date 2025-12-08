import { useFeatureFlagContext } from '@/contexts/feature-flags';
import {
  REC_RESOURCE_PAGE_NAV_SECTIONS,
  RecResourceNavKey,
  type NavSectionConfig,
} from '@/pages/rec-resource-page';
import { useMemo } from 'react';

/**
 * Hook to get visible navigation sections based on feature flags.
 * Filters out navigation sections that require feature flags that are not enabled.
 *
 * @returns Array of [key, config] tuples for visible navigation sections
 */
export function useVisibleNavSections(): Array<
  [RecResourceNavKey, NavSectionConfig]
> {
  const featureFlags = useFeatureFlagContext();

  return useMemo(() => {
    return Object.entries(REC_RESOURCE_PAGE_NAV_SECTIONS).filter(
      ([, config]) => {
        if (!config.requiredFlags) return true;
        // Check if all required flags are enabled
        return config.requiredFlags.every((flag) => featureFlags[flag]);
      },
    ) as Array<[RecResourceNavKey, NavSectionConfig]>;
  }, [featureFlags]);
}
