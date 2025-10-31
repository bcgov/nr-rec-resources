import { createFileRoute } from '@tanstack/react-router';
import { RecResourceOverviewPage } from '@/pages/rec-resource-page/RecResourceOverviewPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';

export const Route = createFileRoute('/rec-resource/$id/overview/')({
  component: RecResourceOverviewRoute,
  loader: recResourceLoader,
  beforeLoad: () => ({
    tab: RecResourceNavKey.OVERVIEW,
  }),
});

function RecResourceOverviewRoute() {
  return <RecResourceOverviewPage />;
}
