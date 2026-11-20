import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@/components';
import { RecResourcePageLayout } from '@/pages/rec-resource-page/RecResourcePageLayout';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceSummaryLoader } from '@/services/loaders/recResourceSummaryLoader';
import { capitalizeWords } from '@shared/utils/capitalizeWords';

export const Route = createFileRoute('/rec-resource/$id')({
  component: RecResourceRoute,
  loader: recResourceSummaryLoader,
  beforeLoad: ({ params }) => ({
    tab: RecResourceNavKey.FILES,
    breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
      const resourceName = capitalizeWords(loaderData?.recResource?.name);
      return [
        {
          label: 'Home',
          href: '/',
        },
        {
          label: resourceName || 'Resource details',
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
