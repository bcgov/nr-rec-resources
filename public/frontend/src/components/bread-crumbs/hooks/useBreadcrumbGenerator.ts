import { useLocation } from 'react-router-dom';
import { useStore } from '@tanstack/react-store';
import breadcrumbStore from '@/store/breadcrumbStore';
import { BreadcrumbItem } from '@/components/bread-crumbs/types/breadcrumb';
import { useCallback } from 'react';

interface BreadcrumbGeneratorOptions {
  resourceName?: string;
  resourceId?: string;
  customItems?: BreadcrumbItem[];
}

/**
 * Utility hook to generate breadcrumb configurations based on current route and context
 */
export const useBreadcrumbGenerator = () => {
  const location = useLocation();
  const { previousRoute } = useStore(breadcrumbStore);

  const generateBreadcrumbs = useCallback(
    (options: BreadcrumbGeneratorOptions = {}): BreadcrumbItem[] => {
      const { resourceName, resourceId, customItems } = options;
      const currentPath = location.pathname;
      const searchParams = location.search;

      // If custom items provided, use them
      if (customItems) {
        return customItems;
      }

      // Base breadcrumb - always start with home
      const breadcrumbs: BreadcrumbItem[] = [
        {
          label: 'Home',
          href: '/',
        },
      ];

      // Determine middle breadcrumb based on previous route or current context
      const shouldUsePreviousRoute =
        previousRoute && !previousRoute.startsWith(currentPath);

      if (
        currentPath.startsWith('/resource/') &&
        currentPath.includes('/contact')
      ) {
        // For resource contact pages: Home → [Previous Context] → Resource → Contact
        if (shouldUsePreviousRoute) {
          const previousLabel = getPreviousRouteLabel(previousRoute);
          if (previousLabel.href !== '/') {
            breadcrumbs.push(previousLabel);
          }
        } else {
          // Default to search if no previous context
          breadcrumbs.push({
            label: 'Find a site or trail',
            href: getSearchHref(),
          });
        }

        // Add resource page link
        if (resourceId) {
          breadcrumbs.push({
            label: resourceName || resourceId,
            href: `/resource/${resourceId}`,
          });
        }

        // Current page (Contact)
        breadcrumbs.push({
          label: 'Contact',
          isCurrent: true,
        });
      } else if (currentPath.startsWith('/resource/')) {
        // For resource pages: Home → [Previous Context] → Resource
        if (shouldUsePreviousRoute) {
          const previousLabel = getPreviousRouteLabel(previousRoute);
          if (previousLabel.href !== '/') {
            breadcrumbs.push(previousLabel);
          }
        } else {
          // Default to search if no previous context
          breadcrumbs.push({
            label: 'Find a site or trail',
            href: getSearchHref(),
          });
        }

        // Current page (Resource)
        breadcrumbs.push({
          label: resourceName || resourceId || 'Resource',
          isCurrent: true,
        });
      } else if (currentPath === '/contact') {
        // For general contact page: Home → Contact
        breadcrumbs.push({
          label: 'Contact',
          isCurrent: true,
        });
      } else if (currentPath === '/search') {
        // For search page: Home → Search
        breadcrumbs.push({
          label: 'Find a site or trail',
          isCurrent: true,
        });
      }

      return breadcrumbs;
    },
    [location.pathname, location.search, previousRoute],
  );

  return { generateBreadcrumbs };
};

/**
 * Get appropriate search href, including last search params if available
 */
const getSearchHref = (): string => {
  const lastSearch = sessionStorage.getItem('lastSearch');
  return `/search${lastSearch || ''}`;
};

/**
 * Convert a previous route path into a meaningful breadcrumb label
 */
const getPreviousRouteLabel = (previousRoute: string): BreadcrumbItem => {
  const [path] = previousRoute.split('?');

  if (path === '/') {
    return { label: 'Home', href: '/' };
  } else if (path === '/search' || path.startsWith('/search')) {
    return { label: 'Find a site or trail', href: previousRoute };
  } else if (path === '/contact') {
    return { label: 'Contact', href: '/contact' };
  } else if (path.startsWith('/resource/')) {
    // Extract resource ID from path
    const resourceId = path.split('/')[2];
    return { label: resourceId, href: path };
  }

  // Default fallback
  return { label: 'Back', href: previousRoute };
};
