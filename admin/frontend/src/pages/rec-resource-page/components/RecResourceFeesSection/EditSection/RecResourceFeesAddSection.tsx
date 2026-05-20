import { ROUTE_PATHS } from '@/constants/routes';
import { Route } from '@/routes/rec-resource/$id/fees/add';
import { RecResourceFeesContent } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent';
import { RecResourceFeeFormModal } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeFormModal';
import { RecreationFeeUIModel, useGetFees } from '@/services';
import { useNavigate } from '@tanstack/react-router';

export const RecResourceFeesAddSection = () => {
  const { fees: initialFees } = Route.useLoaderData() as {
    fees: RecreationFeeUIModel[];
  };
  const params = Route.useParams();
  const recResourceId = params?.id;
  const navigate = useNavigate();
  const { data: fees = [] } = useGetFees(recResourceId, {
    initialData: initialFees,
  });

  const handleClose = () => {
    navigate({
      to: ROUTE_PATHS.REC_RESOURCE_FEES,
      params: { id: recResourceId },
    });
  };

  return (
    <>
      <RecResourceFeesContent fees={fees} recResourceId={recResourceId} />
      <RecResourceFeeFormModal
        recResourceId={recResourceId}
        mode="create"
        onClose={handleClose}
      />
    </>
  );
};
