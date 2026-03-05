import { createFileRoute } from '@tanstack/react-router';
import { RecResourceFeesAddSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesAddSection';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

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
            label: 'Fees',
            href: ROUTE_PATHS.REC_RESOURCE_FEES.replace('$id', params.id),
          },
          {
            label: 'Add Fee',
            href: ROUTE_PATHS.REC_RESOURCE_FEES_ADD.replace('$id', params.id),
          },
        ];
      },
    };
  },
});

function RecResourceFeesEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      require={[ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FEES.replace('$id', id)}
    >
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <RecResourceFeesAddSection />
      </FeatureFlagRouteGuard>
    </RoleRouteGuard>
  );
}
