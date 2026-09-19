import { Route } from '@/routes/rec-resource/$id/partners/edit';
import { useGetPartners } from '@/services/hooks/recreation-resource-admin/useGetPartners';
import { RecResourcePartnersEditSection } from './components/RecResourcePartnersSection';

export const RecResourcePartnersEditPage = () => {
  const { partnersInfo: initialPartners } = Route.useLoaderData();
  const { id: recResourceId } = Route.useParams();
  const { data: partners = [] } = useGetPartners(recResourceId, {
    initialData: initialPartners,
  });

  return (
    <RecResourcePartnersEditSection
      partners={partners}
      recResourceId={recResourceId}
    />
  );
};
