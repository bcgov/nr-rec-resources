import { createFileRoute } from '@tanstack/react-router';
import { RecResourceAssetsEditPage } from '@/pages/rec-resource-page/RecResourceAssetsEditPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/assets/edit')({
  component: RecResourceAssetsEditPageRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    editGroup: typeof search.editGroup === 'string' ? search.editGroup : undefined,
  }),
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.ASSETS,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Assets',
            href: ROUTE_PATHS.REC_RESOURCE_ASSETS.replace('$id', params.id),
          },
          {
            label: 'Edit',
            href: ROUTE_PATHS.REC_RESOURCE_ASSETS_EDIT.replace(
              '$id',
              params.id,
            ),
          },
        ];
      },
    };
  },
});

function RecResourceAssetsEditPageRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_ASSETS.replace('$id', id)}
    >
      <RecResourceAssetsEditPage />
    </RoleRouteGuard>
  );
}

