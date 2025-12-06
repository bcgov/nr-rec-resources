import { CustomBadge, Table } from '@/components';
import { RecreationFeeUIModel } from '@/services';
import { COLOR_BLACK, COLOR_GREY } from '@/styles/colors';
import { getIndividualDays } from './helpers';

interface RecResourceFeesTableProps {
  fees: RecreationFeeUIModel[];
}

export const RecResourceFeesTable = ({ fees }: RecResourceFeesTableProps) => {
  return (
    <Table
      columns={[
        {
          header: 'Fee Type',
          render: (fee) => (
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
          render: (fee) =>
            fee.fee_amount !== undefined && fee.fee_amount !== null
              ? `$${fee.fee_amount.toFixed(2)}`
              : '--',
        },
        {
          header: 'Start Date',
          render: (fee) => fee.fee_start_date_readable_utc || '--',
        },
        {
          header: 'End Date',
          render: (fee) => fee.fee_end_date_readable_utc || '--',
        },
        {
          header: 'Days',
          render: (fee) => {
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
      ]}
      rows={fees}
      getRowKey={(fee, index) =>
        `${fee.recreation_fee_code}-${fee.fee_start_date}-${index}`
      }
      emptyMessage="Currently no fees"
    />
  );
};
