import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/contact-page/ContactPage';
import { ROUTE_TITLES, ROUTE_PATHS } from '@/constants/routes';
import { META_DESCRIPTIONS, OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { buildAbsoluteUrl, buildOgMeta } from '@/utils/seo';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/contact')({
  component: ContactRoute,
  head: () => {
    const description = META_DESCRIPTIONS.CONTACT;
    const pageTitle = ROUTE_TITLES.CONTACT;
    const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
    const ogUrl = buildAbsoluteUrl(ROUTE_PATHS.CONTACT_US);
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
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: ROUTE_PATHS.HOME,
      },
      {
        label: 'Contact',
        href: ROUTE_PATHS.CONTACT_US,
        isCurrent: true,
      },
    ],
  }),
});

function ContactRoute() {
  return <ContactPage />;
}
