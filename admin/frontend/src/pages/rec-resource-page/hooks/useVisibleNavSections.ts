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
  const { canViewFeatureFlag } = useAuthorizations();

  return useMemo(() => {
    return Object.entries(REC_RESOURCE_PAGE_NAV_SECTIONS).filter(
      ([key]) => key === RecResourceNavKey.FILES || canViewFeatureFlag,
    ) as Array<[RecResourceNavKey, NavSectionConfig]>;
  }, [canViewFeatureFlag]);
}
