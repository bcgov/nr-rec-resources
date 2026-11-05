import { createFileRoute } from '@tanstack/react-router';
import { RecResourceFeesAddSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesAddSection';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { ROUTE_PATHS } from '@/constants/routes';
import { FeeFormRouteGuard, feeFormBeforeLoad } from './-feeFormRoute';

export const Route = createFileRoute('/rec-resource/$id/fees/add')({
  component: RecResourceFeesAddRoute,
  loader: recResourceFeesLoader,
  beforeLoad: feeFormBeforeLoad((params) => ({
    label: 'Add fee',
    href: ROUTE_PATHS.REC_RESOURCE_FEES_ADD.replace('$id', params.id),
  })),
});

function RecResourceFeesAddRoute() {
  const { id } = Route.useParams();

  return (
    <FeeFormRouteGuard id={id}>
      <RecResourceFeesAddSection />
    </FeeFormRouteGuard>
  );
}
