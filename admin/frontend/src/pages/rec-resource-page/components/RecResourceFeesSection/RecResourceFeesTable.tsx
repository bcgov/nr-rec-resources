import { CustomBadge, Table } from '@/components';
import { ROUTE_PATHS } from '@/constants/routes';
import { RecreationFeeUIModel, useDeleteFee } from '@/services';
import { COLOR_BLACK, COLOR_GREY } from '@/styles/colors';
import { formatRecurringMonthDay, getIndividualDays } from './helpers';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@tanstack/react-router';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import { DeleteFeeConfirmationModal } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/DeleteFeeConfirmationModal';
import { addSuccessNotification } from '@/store/notificationStore';

interface RecResourceFeesTableProps {
  fees: RecreationFeeUIModel[];
  recResourceId?: string;
}

export const RecResourceFeesTable = ({
  fees,
  recResourceId,
}: RecResourceFeesTableProps) => {
  const { canEdit } = useAuthorizations();
  const deleteFee = useDeleteFee();
  const [selectedFee, setSelectedFee] = useState<RecreationFeeUIModel>();

  const handleConfirmDelete = async () => {
    if (!recResourceId || !selectedFee?.fee_id) return;

    await deleteFee.mutateAsync({
      recResourceId,
      feeId: selectedFee.fee_id,
    });

    setSelectedFee(undefined);
    addSuccessNotification('Fee deleted successfully', 'deleteFee-success');
  };

  const columns: any[] = [
    {
      header: 'Fee Type',
      render: (fee: RecreationFeeUIModel) => (
        <CustomBadge
          label={fee.fee_type_description || fee.recreation_fee_code}
          bgColor="transparent"
          textColor={COLOR_BLACK}
          borderColor={COLOR_GREY}
          fontWeight="bold"
        />
      ),
    },
    {
      header: 'Amount',
      render: (fee: RecreationFeeUIModel) =>
        fee.fee_amount !== undefined && fee.fee_amount !== null
          ? `$${fee.fee_amount.toFixed(2)}`
          : '--',
    },
    {
      header: 'Start Date',
      render: (fee: RecreationFeeUIModel) => {
        if (fee.recurring_ind)
          return formatRecurringMonthDay(fee.recurring_start_mmdd);
        return fee.fee_start_date_readable_utc || '--';
      },
    },
    {
      header: 'End Date',
      render: (fee: RecreationFeeUIModel) => {
        if (fee.recurring_ind)
          return formatRecurringMonthDay(fee.recurring_end_mmdd);
        return fee.fee_end_date_readable_utc || '--';
      },
    },
    {
      header: 'Days',
      render: (fee: RecreationFeeUIModel) => {
        const individualDays = getIndividualDays(fee);
        return (
          <div className="d-flex flex-wrap gap-1">
            {individualDays.length > 0 ? (
              individualDays.map((day, dayIndex) => (
                <CustomBadge
                  key={`${day}-${dayIndex}`}
                  label={day}
                  bgColor="transparent"
                  textColor={COLOR_BLACK}
                  borderColor={COLOR_GREY}
                  fontWeight="bold"
                />
              ))
            ) : (
              <span>--</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      render: (fee: RecreationFeeUIModel) => {
        if (!canEdit || !recResourceId) return <span>--</span>;
        return (
          <div className="d-flex align-items-center gap-3">
            <Link
              to={ROUTE_PATHS.REC_RESOURCE_FEE_EDIT}
              params={{ id: recResourceId, feeId: String(fee.fee_id) }}
              className="p-0 align-middle bc-color-blue-dk"
              aria-label="Edit fee"
              title="Edit fee"
            >
              <FontAwesomeIcon icon={faPen} />
            </Link>
            <Button
              variant="link"
              className="p-0 align-middle text-danger"
              aria-label="Delete fee"
              title="Delete fee"
              onClick={() => setSelectedFee(fee)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        rows={fees}
        getRowKey={(fee) => String(fee.fee_id)}
        emptyMessage="Currently no fees"
      />
      <DeleteFeeConfirmationModal
        show={Boolean(selectedFee)}
        fee={selectedFee}
        isDeleting={deleteFee.isPending}
        onCancel={() => setSelectedFee(undefined)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
