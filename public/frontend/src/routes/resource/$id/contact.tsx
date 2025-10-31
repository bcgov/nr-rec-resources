import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/contact-page/ContactPage';
import { ROUTE_TITLES } from '@/constants/routes';
import { Route as ParentRoute } from '@/routes/resource/$id';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';

export const Route = createFileRoute('/resource/$id/contact')({
  component: RecResourceContactRoute,
  head: ({ loaderData }) => {
    const recResource = loaderData?.recResource;
    return {
      meta: [
        {
          title: ROUTE_TITLES.REC_RESOURCE_CONTACT(recResource?.name || ''),
        },
      ],
    };
  },
  loader: recResourceLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      breadcrumb: (loaderData?: any) => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Contact',
            href: `/resource/${params.id}/contact`,
            isCurrent: true,
          },
        ];
      },
    };
  },
});

function RecResourceContactRoute() {
  return <ContactPage />;
}
