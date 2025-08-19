import { ContactPage } from '@/components/contact-page/ContactPage';
import { LandingPage } from '@/components/landing-page';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/NotFound';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import SearchPage from '@/components/search/SearchPage';
import { ROUTE_PATHS, ROUTE_TITLES } from '@/routes/constants';
import { Route, Routes } from 'react-router-dom';
import { RouteChangeScrollReset } from '@/routes/RouteChangeScrollReset';
import { BreadcrumbItem } from '@/components/breadcrumbs/types';

// Breadcrumb helper functions
const createBreadcrumbHelpers = () => ({
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

  contact: (): BreadcrumbItem => ({
    label: 'Contact',
    href: ROUTE_PATHS.CONTACT_US,
  }),

  resource: (id: string, name?: string): BreadcrumbItem => ({
    label: name || id || 'Resource',
    href: ROUTE_PATHS.REC_RESOURCE.replace(':id', id),
  }),
});

const breadcrumbHelpers = createBreadcrumbHelpers();

export default function AppRoutes() {
  return (
    <RouteChangeScrollReset>
      <Routes>
        <Route
          path={ROUTE_PATHS.NOT_FOUND}
          element={
            <>
              <PageTitle title={ROUTE_TITLES.NOT_FOUND} />
              <NotFound />
            </>
          }
          handle={{
            breadcrumb: () => [
              breadcrumbHelpers.home(),
              { label: '404 - Page Not Found', isCurrent: true },
            ],
          }}
        />
        <Route
          path={ROUTE_PATHS.HOME}
          element={
            <>
              <PageTitle title={ROUTE_TITLES.HOME} />
              <LandingPage />
            </>
          }
          handle={{
            breadcrumb: () => [
              { ...breadcrumbHelpers.home(), isCurrent: true },
            ],
          }}
        />
        {/* Rec resource page title is dynamic and handled in RecResourcePage.tsx */}
        <Route
          path={ROUTE_PATHS.REC_RESOURCE}
          element={<RecResourcePage />}
          handle={{
            breadcrumb: (match: any, context?: { resourceName?: string }) => [
              breadcrumbHelpers.home(),
              breadcrumbHelpers.search(),
              {
                ...breadcrumbHelpers.resource(
                  match.params.id,
                  context?.resourceName,
                ),
                isCurrent: true,
              },
            ],
          }}
        />
        <Route
          path={ROUTE_PATHS.SEARCH}
          element={
            <>
              <PageTitle title={ROUTE_TITLES.SEARCH} />
              <SearchPage />
            </>
          }
          handle={{
            breadcrumb: () => [
              breadcrumbHelpers.home(),
              { ...breadcrumbHelpers.search(), isCurrent: true },
            ],
          }}
        />
        <Route
          path={ROUTE_PATHS.CONTACT_US}
          element={
            <>
              <PageTitle title={ROUTE_TITLES.CONTACT} />
              <ContactPage />
            </>
          }
          handle={{
            breadcrumb: () => [
              breadcrumbHelpers.home(),
              { ...breadcrumbHelpers.contact(), isCurrent: true },
            ],
          }}
        />
        <Route
          path={ROUTE_PATHS.REC_RESOURCE_CONTACT}
          element={
            <>
              <ContactPage />
            </>
          }
          handle={{
            breadcrumb: (match: any, context?: { resourceName?: string }) => [
              breadcrumbHelpers.home(),
              breadcrumbHelpers.search(),
              breadcrumbHelpers.resource(
                match.params.id,
                context?.resourceName,
              ),
              { ...breadcrumbHelpers.contact(), isCurrent: true },
            ],
          }}
        />
      </Routes>
    </RouteChangeScrollReset>
  );
}
