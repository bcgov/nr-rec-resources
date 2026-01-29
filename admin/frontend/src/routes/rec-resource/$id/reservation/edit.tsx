import { createFileRoute } from '@tanstack/react-router';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { recResourceReservationLoader } from '@/services/loaders/recResourceReservationLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { RecResourceReservationEditSection } from '@/pages/rec-resource-page/components/RecResourceReservationSection';

function RecResourceReservationEditRoute() {
  return (
    <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
      <RecResourceReservationEditSection />
    </FeatureFlagRouteGuard>
  );
}

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
            label: 'Edit Reservation',
            href: `/rec-resource/${params.id}/reservation/edit`,
          },
        ];
      },
    };
  },
});
