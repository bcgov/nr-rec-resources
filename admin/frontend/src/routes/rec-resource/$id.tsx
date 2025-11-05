import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@/components';
import { RecResourcePageLayout } from '@/pages/rec-resource-page/RecResourcePageLayout';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { capitalizeWords } from '@shared/utils/capitalizeWords';

export const Route = createFileRoute('/rec-resource/$id')({
  component: RecResourceRoute,
  loader: recResourceLoader,
  beforeLoad: ({ params }) => ({
    tab: RecResourceNavKey.OVERVIEW,
    breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
      const resourceName = capitalizeWords(loaderData?.recResource?.name);
      return [
        {
          label: 'Home',
          href: '/',
        },
        {
          label: resourceName || 'Resource Details',
          href: `/rec-resource/${params.id}`,
        },
      ];
    },
  }),
});

function RecResourceRoute() {
  return (
    <PageLayout>
      <RecResourcePageLayout />
    </PageLayout>
  );
}
