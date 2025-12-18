import { CustomBadge, Table } from '@/components';
import { RecreationFeeUIModel } from '@/services';
import { COLOR_BLACK, COLOR_GREY } from '@/styles/colors';
import { getIndividualDays } from './helpers';
import { useFeatureFlagsEnabled } from '@/contexts/feature-flags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';

interface RecResourceFeesTableProps {
  fees: RecreationFeeUIModel[];
  recResourceId?: string;
}

export const RecResourceFeesTable = ({
  fees,
  recResourceId,
}: RecResourceFeesTableProps) => {
  const canEditFees = useFeatureFlagsEnabled('enable_full_features');

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
      render: (fee: RecreationFeeUIModel) =>
        fee.fee_start_date_readable_utc || '--',
    },
    {
      header: 'End Date',
      render: (fee: RecreationFeeUIModel) =>
        fee.fee_end_date_readable_utc || '--',
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
        if (!canEditFees || !recResourceId) return <span>--</span>;
        return (
          <LinkWithQueryParams
            to="/rec-resource/$id/fees/$feeId/edit"
            params={{ id: recResourceId, feeId: String(fee.fee_id) }}
            className="p-0 align-middle bc-color-blue-dk"
            aria-label="Edit fee"
            title="Edit fee"
          >
            <FontAwesomeIcon icon={faPen} />
          </LinkWithQueryParams>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      rows={fees}
      getRowKey={(fee) => String(fee.fee_id)}
      emptyMessage="Currently no fees"
    />
  );
};
