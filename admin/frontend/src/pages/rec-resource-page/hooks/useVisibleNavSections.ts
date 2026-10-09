import { useAuthorizations } from '@/hooks/useAuthorizations';
import {
  REC_RESOURCE_PAGE_NAV_SECTIONS,
  RecResourceNavKey,
  type NavSectionConfig,
} from '@/pages/rec-resource-page';
import { useMemo } from 'react';

/**
 * Returns the nav sections visible to the current user.
 */
export function useVisibleNavSections(): Array<
  [RecResourceNavKey, NavSectionConfig]
> {
  const { canViewFeatureFlag, canViewPartners } = useAuthorizations();

  return useMemo(() => {
    return Object.entries(REC_RESOURCE_PAGE_NAV_SECTIONS).filter(
      ([key, config]) => {
        if (key === RecResourceNavKey.PARTNERS && !canViewPartners) {
          return false;
        }

        return !config.isFeatureFlagged || canViewFeatureFlag;
      },
    ) as Array<[RecResourceNavKey, NavSectionConfig]>;
  }, [canViewFeatureFlag, canViewPartners]);
}
