import { Route } from '@/routes/rec-resource/$id/fees';
import { RecResourceFeesContent } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetFees } from '@/services/hooks/recreation-resource-admin/useGetFees';

export const RecResourceFeesSection = () => {
  const { fees: initialFees } = Route.useLoaderData();
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { recResource } = useRecResource();
  const isArchived = recResource?.rec_status_code === 'AR';
  const { data: fees = [] } = useGetFees(recResourceId, {
    initialData: initialFees,
  });

  return (
    <RecResourceFeesContent
      fees={fees}
      recResourceId={recResourceId}
      isArchived={isArchived}
    />
  );
};
