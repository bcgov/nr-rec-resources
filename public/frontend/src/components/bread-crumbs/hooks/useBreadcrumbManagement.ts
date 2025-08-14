import { useEffect } from 'react';
import { useBreadcrumb } from '@/components/bread-crumbs/hooks/useBreadcrumb';
import { useBreadcrumbGenerator } from '@/components/bread-crumbs/hooks/useBreadcrumbGenerator';
import { BreadcrumbItem } from '@/components/bread-crumbs/types/breadcrumb';

interface UseBreadcrumbManagementOptions {
  resourceName?: string;
  resourceId?: string;
  customItems?: BreadcrumbItem[];
  autoGenerate?: boolean;
}

/**
 * Hook to manage breadcrumbs for a page component
 * Automatically generates and sets breadcrumbs based on current route context
 */
export const useBreadcrumbManagement = (
  options: UseBreadcrumbManagementOptions = {},
) => {
  const { setBreadcrumbs } = useBreadcrumb();
  const { generateBreadcrumbs } = useBreadcrumbGenerator();
  const { autoGenerate = true, ...generatorOptions } = options;

  useEffect(() => {
    if (autoGenerate) {
      const breadcrumbItems = generateBreadcrumbs(generatorOptions);
      setBreadcrumbs(breadcrumbItems);
    }
  }, [
    autoGenerate,
    setBreadcrumbs,
    generateBreadcrumbs,
    generatorOptions.resourceName,
    generatorOptions.resourceId,
  ]);

  // Return function to manually set breadcrumbs if needed
  const setManualBreadcrumbs = (items: BreadcrumbItem[]) => {
    setBreadcrumbs(items);
  };

  return { setManualBreadcrumbs };
};
