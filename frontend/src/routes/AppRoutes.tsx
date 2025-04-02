import { Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/components/landing-page';
import NotFound from '@/components/NotFound';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import SearchPage from '@/components/search/SearchPage';
import { ROUTE_PATHS } from '@/routes/constants';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.NOT_FOUND} element={<NotFound />} />
      <Route path={ROUTE_PATHS.HOME} element={<LandingPage />} />
      <Route path={ROUTE_PATHS.REC_RESOURCE} element={<RecResourcePage />} />
      <Route path={ROUTE_PATHS.SEARCH} element={<SearchPage />} />
    </Routes>
  );
}
