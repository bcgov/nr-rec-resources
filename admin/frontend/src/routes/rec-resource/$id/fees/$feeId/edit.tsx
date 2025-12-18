import { createFileRoute } from '@tanstack/react-router';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { RecResourceFeesEditSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesEditSection';

export const Route = createFileRoute('/rec-resource/$id/fees/$feeId/edit')({
  component: RecResourceFeeEditRoute,
  loader: recResourceFeesLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);

    return {
      tab: RecResourceNavKey.FEES,
      breadcrumb: (loaderData?: any) => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Fees',
            href: `/rec-resource/${params.id}/fees`,
          },
          {
            label: 'Edit Fee',
            href: `/rec-resource/${params.id}/fees/${params.feeId}/edit`,
          },
        ];
      },
    };
  },
});

function RecResourceFeeEditRoute() {
  return (
    <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
      <RecResourceFeesEditSection />
    </FeatureFlagRouteGuard>
  );
}
