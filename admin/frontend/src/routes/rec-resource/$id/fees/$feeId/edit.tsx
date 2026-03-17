import { createFileRoute } from '@tanstack/react-router';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { RecResourceFeesEditSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesEditSection';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

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
            href: ROUTE_PATHS.REC_RESOURCE_FEES.replace('$id', params.id),
          },
          {
            label: 'Edit Fee',
            href: ROUTE_PATHS.REC_RESOURCE_FEE_EDIT.replace(
              '$id',
              params.id,
            ).replace('$feeId', params.feeId),
          },
        ];
      },
    };
  },
});

function RecResourceFeeEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FEES.replace('$id', id)}
    >
      <RecResourceFeesEditSection />
    </RoleRouteGuard>
  );
}
