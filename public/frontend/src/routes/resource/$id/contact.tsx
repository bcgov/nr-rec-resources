import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/contact-page/ContactPage';
import { Route as ParentRoute } from '@/routes/resource/$id';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';
import { ROUTE_TITLES } from '@/constants/routes';
import { META_DESCRIPTIONS } from '@/constants/seo';

export const Route = createFileRoute('/resource/$id/contact')({
  component: RecResourceContactRoute,
  head: ({ loaderData }) => {
    const recResource = loaderData?.recResource;

    const pageTitle = ROUTE_TITLES.REC_RESOURCE_CONTACT(
      recResource?.name || '',
    );

    return {
      meta: [
        {
          name: 'description',
          content: META_DESCRIPTIONS.REC_RESOURCE_CONTACT,
        },
        {
          title: pageTitle,
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
