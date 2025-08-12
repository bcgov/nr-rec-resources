import { ContactPage } from '@/components/contact-page/ContactPage';
import { LandingPage } from '@/components/landing-page';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/NotFound';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import SearchPage from '@/components/search/SearchPage';
import { ROUTE_PATHS, ROUTE_TITLES } from '@/routes/constants';
import { Route, Routes } from 'react-router-dom';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTE_PATHS.NOT_FOUND}
        element={
          <>
            <PageTitle title={ROUTE_TITLES.NOT_FOUND} />
            <NotFound />
          </>
        }
      />
      <Route
        path={ROUTE_PATHS.HOME}
        element={
          <>
            <PageTitle title={ROUTE_TITLES.HOME} />
            <LandingPage />
          </>
        }
      />
      {/* Rec resource page title is dynamic and handled in RecResourcePage.tsx */}
      <Route path={ROUTE_PATHS.REC_RESOURCE} element={<RecResourcePage />} />
      <Route
        path={ROUTE_PATHS.SEARCH}
        element={
          <>
            <PageTitle title={ROUTE_TITLES.SEARCH} />
            <SearchPage />
          </>
        }
      />
      <Route
        path={ROUTE_PATHS.CONTACT}
        element={
          <>
            <PageTitle title={ROUTE_TITLES.CONTACT} />
            <ContactPage />
          </>
        }
      />
    </Routes>
  );
}
