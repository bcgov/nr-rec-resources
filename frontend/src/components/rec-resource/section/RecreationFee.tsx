import { Stack } from 'react-bootstrap';
import { RecreationFeeModel } from '@/service/custom-models';

interface RecreationFeeListProps {
  data: RecreationFeeModel[];
}

const feeTypeMap: Record<string, string> = {
  C: 'Camping',
  D: 'Day Use',
  H: 'Hut',
  P: 'Parking',
  T: 'Trail Use',
};

const RecreationFee: React.FC<RecreationFeeListProps> = ({ data }) => {
  const formatDate = (dateStr: Date | null | undefined) => {
    if (!dateStr) return 'N/A';
    const date = new Date(
      Date.UTC(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate()),
    );
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDays = (fee: RecreationFeeModel) => {
    const daysMap: Record<string, string> = {
      monday_ind: 'Monday',
      tuesday_ind: 'Tuesday',
      wednesday_ind: 'Wednesday',
      thursday_ind: 'Thursday',
      friday_ind: 'Friday',
      saturday_ind: 'Saturday',
      sunday_ind: 'Sunday',
    };

    const selectedDays = Object.keys(daysMap).filter((day) => {
      const value = fee[day as keyof RecreationFeeModel];
      return typeof value === 'string' && value.toUpperCase() === 'Y';
    });

    return selectedDays.length === 7
      ? 'All Days'
      : selectedDays.map((day) => daysMap[day]).join(', ');
  };

  if (!data || data.length === 0) {
    return <p>No fees available for this resource.</p>;
  }

  return (
    <Stack direction="vertical" gap={5}>
      {data.map((fee, index) => (
        <Stack key={index} direction="vertical" gap={3}>
          <Stack direction="vertical">
            <strong>
              {feeTypeMap[fee.recreation_fee_code] || 'Unknown Fee Type'} fee
            </strong>
            <span>${fee.fee_amount.toFixed(2)}</span>
          </Stack>

          <Stack direction="vertical">
            <strong>Fee applies</strong>
            <span>
              {formatDate(fee.fee_start_date)} - {formatDate(fee.fee_end_date)}
            </span>
            <span>{formatDays(fee)}</span>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default RecreationFee;
