import { createFileRoute } from '@tanstack/react-router';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RoleRouteGuard } from '@/components/auth';
import { recResourceReservationLoader } from '@/services/loaders/recResourceReservationLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { RecResourceReservationEditSection } from '@/pages/rec-resource-page/components/RecResourceReservationSection';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/reservation/edit')({
  component: RecResourceReservationEditRoute,
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
            label: 'Edit Reservations',
            href: ROUTE_PATHS.REC_RESOURCE_RESERVATION_EDIT.replace(
              '$id',
              params.id,
            ),
          },
        ];
      },
    };
  },
});

function RecResourceReservationEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_RESERVATION.replace('$id', id)}
    >
      <RecResourceReservationEditSection />
    </RoleRouteGuard>
  );
}
