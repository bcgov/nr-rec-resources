import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/components/landing-page';
import { ROUTE_PATHS, SITE_TITLE } from '@/constants/routes';
import { META_DESCRIPTIONS, OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { buildAbsoluteUrl, buildOgMeta } from '@/utils/seo';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/')({
  component: HomeRoute,
  head: () => {
    const description = META_DESCRIPTIONS.HOME;
    const pageTitle = SITE_TITLE;
    const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
    const ogUrl = buildAbsoluteUrl(ROUTE_PATHS.HOME);
    const ogMeta = buildOgMeta({
      title: pageTitle,
      description,
      url: ogUrl,
      image: ogImage,
    });
    return {
      meta: [
        { name: 'description', content: description },
        { title: pageTitle },
        ...ogMeta,
      ],
    };
  },
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: ROUTE_PATHS.HOME,
        isCurrent: true,
      },
    ],
  }),
});

function HomeRoute() {
  return <LandingPage />;
}
