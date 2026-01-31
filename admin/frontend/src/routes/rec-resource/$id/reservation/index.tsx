import { createFileRoute } from '@tanstack/react-router';
import { RecResourceReservationPage } from '@/pages/rec-resource-page/RecResourceReservationPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceReservationLoader } from '@/services/loaders/recResourceReservationLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';

function RecResourceReservationPageRoute() {
  return (
    <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
      <RecResourceReservationPage />
    </FeatureFlagRouteGuard>
  );
}

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
