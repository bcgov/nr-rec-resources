import { createBrowserRouter } from 'react-router-dom';
import { ContactPage } from '@/components/contact-page/ContactPage';
import { LandingPage } from '@/components/landing-page';
import NotFound from '@/components/NotFound';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import SearchPage from '@/components/search/SearchPage';
import AlphabeticalListPage from '@/components/alphabetical-list/AlphabeticalListPage';
import { ROUTE_PATHS } from '@/routes/constants';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RouteWrapper } from '@/routes/RouteWrapper';

const breadcrumbHelpers = {
  home: (): BreadcrumbItem => ({
    label: 'Home',
    href: ROUTE_PATHS.HOME,
  }),
  search: (): BreadcrumbItem => {
    const lastSearch = sessionStorage.getItem('lastSearch');
    return {
      label: 'Find a site or trail',
      href: `${ROUTE_PATHS.SEARCH}${lastSearch || ''}`,
    };
  },
  alphabetical: (): BreadcrumbItem => ({
    label: 'A-Z list',
    href: ROUTE_PATHS.ALPHABETICAL,
  }),
  contact: (): BreadcrumbItem => ({
    label: 'Contact',
    href: ROUTE_PATHS.CONTACT_US,
  }),
  resource: (id: string, name?: string): BreadcrumbItem => ({
    label: name || id || 'Resource',
    href: ROUTE_PATHS.REC_RESOURCE.replace(':id', id),
  }),
};

export const dataRouter = createBrowserRouter([
  {
    path: '/',
    element: <RouteWrapper />,
    children: [
      {
        path: ROUTE_PATHS.HOME,
        element: <LandingPage />,
        handle: {
          breadcrumb: () => [{ ...breadcrumbHelpers.home(), isCurrent: true }],
        },
      },
      {
        path: ROUTE_PATHS.SEARCH,
        element: <SearchPage />,
        handle: {
          breadcrumb: () => [
            breadcrumbHelpers.home(),
            { ...breadcrumbHelpers.search(), isCurrent: true },
          ],
        },
      },
      {
        path: ROUTE_PATHS.ALPHABETICAL,
        element: <AlphabeticalListPage />,
        handle: {
          breadcrumb: () => [
            breadcrumbHelpers.home(),
            breadcrumbHelpers.search(),
            { ...breadcrumbHelpers.alphabetical(), isCurrent: true },
          ],
        },
      },
      {
        path: ROUTE_PATHS.REC_RESOURCE,
        element: <RecResourcePage />,
        handle: {
          breadcrumb: (context: {
            resourceId: string;
            resourceName?: string;
          }) => [
            breadcrumbHelpers.home(),
            breadcrumbHelpers.search(),
            {
              ...breadcrumbHelpers.resource(
                context?.resourceId,
                context?.resourceName,
              ),
              isCurrent: true,
            },
          ],
        },
      },
      {
        path: ROUTE_PATHS.CONTACT_US,
        element: <ContactPage />,
        handle: {
          breadcrumb: () => [
            breadcrumbHelpers.home(),
            { ...breadcrumbHelpers.contact(), isCurrent: true },
          ],
        },
      },
      {
        path: ROUTE_PATHS.REC_RESOURCE_CONTACT,
        element: <ContactPage />,
        handle: {
          breadcrumb: (context: {
            resourceId: string;
            resourceName?: string;
          }) => [
            breadcrumbHelpers.home(),
            breadcrumbHelpers.search(),
            breadcrumbHelpers.resource(
              context?.resourceId,
              context?.resourceName,
            ),
            { ...breadcrumbHelpers.contact(), isCurrent: true },
          ],
        },
      },
      {
        path: ROUTE_PATHS.NOT_FOUND,
        element: <NotFound />,
        handle: {
          breadcrumb: () => [
            breadcrumbHelpers.home(),
            { label: '404 - Page Not Found', isCurrent: true },
          ],
        },
      },
    ],
  },
]);
