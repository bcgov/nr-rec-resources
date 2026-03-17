import { ROUTE_PATHS } from '@/constants/routes';
import { Route } from '@/routes/rec-resource/$id/fees/$feeId/edit';
import { RecResourceFeesContent } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent';
import { RecResourceFeeFormModal } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeFormModal';
import { RecreationFeeUIModel } from '@/services';
import { useNavigate } from '@tanstack/react-router';

export const RecResourceFeesEditSection = () => {
  const { fees } = Route.useLoaderData() as { fees: RecreationFeeUIModel[] };
  const params = Route.useParams();
  const recResourceId = params?.id;
  const feeId = parseInt(params?.feeId, 10);
  const navigate = useNavigate();

  const initialFee = fees.find((f) => f.fee_id === feeId);

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
        mode="edit"
        initialFee={initialFee}
        onClose={handleClose}
      />
    </>
  );
};
