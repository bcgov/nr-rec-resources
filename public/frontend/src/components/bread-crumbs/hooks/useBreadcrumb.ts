import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';
import breadcrumbStore from '@/store/breadcrumbStore';
import { BreadcrumbItem } from '@/components/bread-crumbs/types/breadcrumb';

export const useBreadcrumb = () => {
  const state = useStore(breadcrumbStore);

  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    breadcrumbStore.setState((prev) => ({
      ...prev,
      items,
    }));
  }, []);

  const setPreviousRoute = useCallback((route: string) => {
    breadcrumbStore.setState((prev) => ({
      ...prev,
      previousRoute: route,
    }));
  }, []);

  return {
    breadcrumbs: state.items,
    previousRoute: state.previousRoute,
    setBreadcrumbs,
    setPreviousRoute,
  };
};
