import { Stack } from 'react-bootstrap';
import { RecreationFeeModel } from '@/service/custom-models';
import {
  formatFeeDate,
  formatFeeDays,
  getFeeTypeLabel,
} from '@/utils/recreationFeeUtils';

interface RecreationFeeListProps {
  data: RecreationFeeModel[];
}

const RecreationFee: React.FC<RecreationFeeListProps> = ({ data }) => {
  if (data.length === 0) {
    return <p>No fees available for this resource.</p>;
  }

  return (
    <Stack direction="vertical" gap={5}>
      {data.map((fee, index) => (
        <Stack key={index} direction="vertical" gap={3}>
          <Stack direction="vertical">
            <strong>{getFeeTypeLabel(fee.recreation_fee_code)} fee</strong>
            <span>${fee.fee_amount.toFixed(2)}</span>
          </Stack>

          <Stack direction="vertical">
            <strong>Fee applies</strong>
            <span>
              {formatFeeDate(fee.fee_start_date)} -{' '}
              {formatFeeDate(fee.fee_end_date)}
            </span>
            <span>{formatFeeDays(fee)}</span>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default RecreationFee;
