import { Route } from '@/routes/rec-resource/$id/partners';
import { useGetPartners } from '@/services/hooks/recreation-resource-admin/useGetPartners';
import { RecResourcePartnersContent } from './RecResourcePartnersContent';

export const RecResourcePartnersSection = () => {
  const { partnersInfo: initialPartners } = Route.useLoaderData();
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { data: partners = [] } = useGetPartners(recResourceId, {
    initialData: initialPartners,
  });

  return (
    <RecResourcePartnersContent
      partners={partners}
      recResourceId={recResourceId}
    />
  );
};
