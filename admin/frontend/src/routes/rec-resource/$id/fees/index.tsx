import { createFileRoute } from '@tanstack/react-router';
import { RecResourceFeesPage } from '@/pages/rec-resource-page/RecResourceFeesPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';

export const Route = createFileRoute('/rec-resource/$id/fees/')({
  component: RecResourceFeesPageRoute,
  loader: recResourceFeesLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.FEES,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Fees',
            href: `/rec-resource/${params.id}/fees`,
          },
        ];
      },
    };
  },
});

function RecResourceFeesPageRoute() {
  return (
    <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
      <RecResourceFeesPage />
    </FeatureFlagRouteGuard>
  );
}
