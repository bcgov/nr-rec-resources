import { createFileRoute } from '@tanstack/react-router';
import { RecResourceNotesEditPage } from '@/pages/rec-resource-page/RecResourceNotesEditPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/notes/edit')({
  component: RecResourceNotesEditRoute,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);

    return {
      tab: RecResourceNavKey.NOTES,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Notes and references',
            href: ROUTE_PATHS.REC_RESOURCE_NOTES.replace('$id', params.id),
          },
          {
            label: 'Edit',
            href: ROUTE_PATHS.REC_RESOURCE_NOTES_EDIT.replace('$id', params.id),
          },
        ];
      },
    };
  },
});

function RecResourceNotesEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_NOTES.replace('$id', id)}
    >
      <RecResourceNotesEditPage />
    </RoleRouteGuard>
  );
}
