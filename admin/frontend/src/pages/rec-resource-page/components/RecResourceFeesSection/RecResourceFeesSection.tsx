import { Route } from '@/routes/rec-resource/$id/fees/index';
import { RecResourceFeesContent } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent';
import { useGetFees } from '@/services';

export const RecResourceFeesSection = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { data: fees = [] } = useGetFees(recResourceId);

  return <RecResourceFeesContent fees={fees} recResourceId={recResourceId} />;
};
