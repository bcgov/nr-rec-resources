import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/components/LandingPage';
import NotFound from '@/components/NotFound';
import RecResourcePage from '@/components/RecResource/RecResourcePage';
import SearchPage from '@/components/Search/SearchPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/resource/:id" element={<RecResourcePage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
}
