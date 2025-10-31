import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/components/contact-page/ContactPage';
import { ROUTE_TITLES, ROUTE_PATHS } from '@/constants/routes';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/contact')({
  component: ContactRoute,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Contact Recreation Sites and Trails BC',
      },
      { title: ROUTE_TITLES.CONTACT },
    ],
  }),
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
