import { createFileRoute } from '@tanstack/react-router';
import { RoleRouteGuard } from '@/components/auth';
import { ROUTE_PATHS } from '@/constants/routes';
import { ROLES } from '@/hooks/useAuthorizations';
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
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER]}
      requireAny={[ROLES.VIEWER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FILES.replace('$id', id)}
    >
      <RecResourceOverviewPage />
    </RoleRouteGuard>
  );
}
