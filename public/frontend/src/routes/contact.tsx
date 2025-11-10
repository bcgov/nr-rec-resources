import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/contact-page/ContactPage';
import { ROUTE_TITLES, ROUTE_PATHS } from '@/constants/routes';
import { META_DESCRIPTIONS } from '@/constants/seo';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/contact')({
  component: ContactRoute,
  head: () => {
    return {
      meta: [
        {
          name: 'description',
          content: META_DESCRIPTIONS.CONTACT,
        },
        {
          title: ROUTE_TITLES.CONTACT,
        },
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
