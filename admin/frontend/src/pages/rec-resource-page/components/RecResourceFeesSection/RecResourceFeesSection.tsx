import { Route } from '@/routes/rec-resource/$id/fees';
import { RecResourceFeesContent } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent';
import { useGetFees } from '@/services/hooks/recreation-resource-admin/useGetFees';

export const RecResourceFeesSection = () => {
  const { fees: initialFees } = Route.useLoaderData();
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { data: fees = [] } = useGetFees(recResourceId, {
    initialData: initialFees,
  });

  return <RecResourceFeesContent fees={fees} recResourceId={recResourceId} />;
};
