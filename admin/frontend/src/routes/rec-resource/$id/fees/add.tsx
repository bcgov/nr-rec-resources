import { createFileRoute } from '@tanstack/react-router';
import { RecResourceFeesEditSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesEditSection';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';

export const Route = createFileRoute('/rec-resource/$id/fees/add')({
  component: RecResourceFeesEditRoute,
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
            label: 'Add Fees',
            href: `/rec-resource/${params.id}/fees/add`,
          },
        ];
      },
    };
  },
});

function RecResourceFeesEditRoute() {
  return (
    <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
      <RecResourceFeesEditSection />
    </FeatureFlagRouteGuard>
  );
}
