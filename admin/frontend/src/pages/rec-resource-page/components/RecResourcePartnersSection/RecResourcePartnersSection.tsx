import { Route } from '@/routes/rec-resource/$id/partners';
import { useGetPartners } from '@/services/hooks/recreation-resource-admin/useGetPartners';
import { RecResourcePartnersContent } from './RecResourcePartnersContent';

export const RecResourcePartnersSection = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { data: partners = [] } = useGetPartners(recResourceId);

  return (
    <RecResourcePartnersContent
      partners={partners}
      recResourceId={recResourceId}
    />
  );
};
