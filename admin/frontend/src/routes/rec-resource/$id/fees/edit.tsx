import { createFileRoute } from '@tanstack/react-router';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { ROUTE_PATHS } from '@/constants/routes';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { useEffect } from 'react';

export const Route = createFileRoute('/rec-resource/$id/fees/edit')({
  component: RedirectToFees,
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
          {
            label: 'Edit Fees',
            href: `/rec-resource/${params.id}/fees/edit`,
          },
        ];
      },
    };
  },
});

function RedirectToFees() {
  const { navigate } = useNavigateWithQueryParams();
  const params = Route.useParams();

  useEffect(() => {
    navigate({
      to: ROUTE_PATHS.REC_RESOURCE_FEES,
      params: { id: params.id },
      replace: true,
    });
  }, [navigate, params.id]);

  return null;
}
