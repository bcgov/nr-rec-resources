export * from './constants';
export { default as AppRoutes } from './AppRoutes';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/components/layout/LandingPage';
import NotFound from '@/components/NotFound';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import SearchPage from '@/components/search/SearchPage';
import PageTitle, { SITE_TITLE } from '@/components/layout/PageTitle';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <>
            <PageTitle title={`404 | ${SITE_TITLE}`} />
            <NotFound />
          </>
        }
      />
      <Route
        path="/"
        element={
          <>
            <PageTitle title={SITE_TITLE} />
            <LandingPage />
          </>
        }
      />
      {/* Rec resource page title is dynamic and handled in RecResourcePage.tsx */}
      <Route path="/resource/:id" element={<RecResourcePage />} />
      <Route
        path="/search"
        element={
          <>
            <PageTitle title={`Find a site or trail | ${SITE_TITLE}`} />
            <SearchPage />
          </>
        }
      />
    </Routes>
  );
}
