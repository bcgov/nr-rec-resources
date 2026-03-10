import { createFileRoute } from '@tanstack/react-router';
import { RecResourceReservationPage } from '@/pages/rec-resource-page/RecResourceReservationPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceReservationLoader } from '@/services/loaders/recResourceReservationLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/reservation/')({
  component: RecResourceReservationPageRoute,
  loader: recResourceReservationLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);

    return {
      tab: RecResourceNavKey.RESERVATION,
      breadcrumb: (loaderData?: any) => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Reservation',
            href: `/rec-resource/${params.id}/reservation`,
          },
        ];
      },
    };
  },
});

function RecResourceReservationPageRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER]}
      requireAny={[ROLES.VIEWER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FILES.replace('$id', id)}
    >
      <RecResourceReservationPage />
    </RoleRouteGuard>
  );
}
