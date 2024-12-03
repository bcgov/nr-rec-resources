import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import NotFound from '@/components/NotFound';
import RecResource from '@/components/RecResource';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/resource/:id" element={<RecResource />} />
    </Routes>
  );
}
