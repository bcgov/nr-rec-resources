import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/contact-page/ContactPage';
import { Route as ParentRoute } from '@/routes/resource/$id';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';
import { ROUTE_TITLES } from '@/constants/routes';
import { META_DESCRIPTIONS, OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { buildAbsoluteUrl, buildOgMeta } from '@/utils/seo';

export const Route = createFileRoute('/resource/$id/contact')({
  component: RecResourceContactRoute,
  head: ({ loaderData, params }) => {
    const recResource = loaderData?.recResource;

    const pageTitle = ROUTE_TITLES.REC_RESOURCE_CONTACT(
      recResource?.name || '',
    );
    const description = META_DESCRIPTIONS.REC_RESOURCE_CONTACT;
    const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
    const resourceId = params?.id || '';
    const ogUrl = buildAbsoluteUrl(`/resource/${resourceId}/contact`);
    const ogMeta = buildOgMeta({
      title: pageTitle,
      description,
      url: ogUrl,
      image: ogImage,
    });

    return {
      meta: [
        {
          name: 'description',
          content: description,
        },
        {
          title: pageTitle,
        },
        ...ogMeta,
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
