import { createFileRoute } from '@tanstack/react-router';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import { Route as ParentRoute } from '@/routes/resource/$id';
import { ROUTE_TITLES } from '@/constants/routes';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';
import { OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import {
  buildAbsoluteUrl,
  buildOgMeta,
  getResourceMetaDescription,
} from '@/utils/seo';

const OG_IMAGE_VARIANT_RE = /\/(original|pre|scr|thm)\.webp$/i;

const getOgImageUrl = (sourceUrl?: string) => {
  if (!sourceUrl) return OG_DEFAULT_IMAGE_PATH;
  if (OG_IMAGE_VARIANT_RE.test(sourceUrl)) {
    return sourceUrl.replace(OG_IMAGE_VARIANT_RE, '/og.webp');
  }
  return sourceUrl;
};

export const Route = createFileRoute('/resource/$id/')({
  component: RecResourceRoute,
  head: ({ loaderData, params }) => {
    const recResource = loaderData?.recResource;
    const metaDescription = getResourceMetaDescription(
      recResource?.description,
      recResource?.name,
    );
    const pageTitle = ROUTE_TITLES.REC_RESOURCE(recResource?.name);
    const resourceId =
      loaderData?.recResourceId ||
      recResource?.rec_resource_id ||
      params?.id ||
      '';
    const firstImage = recResource?.recreation_resource_images?.find(
      (image: any) => image?.url?.original || image?.url?.pre,
    );
    const ogImageSource = getOgImageUrl(
      firstImage?.url?.original || firstImage?.url?.pre,
    );
    const ogImage = buildAbsoluteUrl(ogImageSource);
    const ogUrl = buildAbsoluteUrl(`/resource/${resourceId}`);
    const ogImageAlt = recResource?.name
      ? `${recResource.name} photo`
      : 'Recreation Sites and Trails BC logo';
    const ogMeta = buildOgMeta({
      title: pageTitle,
      description: metaDescription,
      url: ogUrl,
      image: ogImage,
      imageAlt: ogImageAlt,
    });

    return {
      meta: [
        {
          name: 'description',
          content: metaDescription,
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
        const breadcrumbs = parentBeforeLoad.breadcrumb(loaderData);
        // Mark last item as current for this route
        return breadcrumbs.map((item: BreadcrumbItem, index: number) =>
          index === breadcrumbs.length - 1
            ? { ...item, isCurrent: true }
            : item,
        );
      },
    };
  },
});

function RecResourceRoute() {
  return <RecResourcePage />;
}
