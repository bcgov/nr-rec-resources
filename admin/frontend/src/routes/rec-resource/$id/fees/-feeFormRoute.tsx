// shared bits for the add/edit fee routes. the "-" prefix keeps the router plugin from treating this as a route
import { PropsWithChildren } from 'react';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const feeFormBeforeLoad =
  <TParams extends { id: string }>(
    getFormCrumb: (params: TParams) => BreadcrumbItem,
  ) =>
  ({ params, context }: { params: TParams; context: unknown }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);

    return {
      tab: RecResourceNavKey.FEES,
      isEditing: true,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Fees',
            href: ROUTE_PATHS.REC_RESOURCE_FEES.replace('$id', params.id),
          },
          getFormCrumb(params),
        ];
      },
    };
  };

export function FeeFormRouteGuard({
  id,
  children,
}: PropsWithChildren<{ id: string }>) {
  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FEES.replace('$id', id)}
    >
      {children}
    </RoleRouteGuard>
  );
}
