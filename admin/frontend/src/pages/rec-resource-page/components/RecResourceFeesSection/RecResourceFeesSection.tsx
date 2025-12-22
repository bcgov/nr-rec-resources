import { Route } from '@/routes/rec-resource/$id/fees/index';
import { RecResourceFeesContent } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent';

export const RecResourceFeesSection = () => {
  const { fees } = Route.useLoaderData();
  const params = Route.useParams();
  const recResourceId = params?.id;

  return <RecResourceFeesContent fees={fees} recResourceId={recResourceId} />;
};
