import React from 'react';

interface RecreationFeeProps {
  fee_amount: number;
  fee_start_date: Date;
  fee_end_date: Date;
  monday_ind: string;
  tuesday_ind: string;
  wednesday_ind: string;
  thursday_ind: string;
  friday_ind: string;
  saturday_ind: string;
  sunday_ind: string;
  recreation_fee_code: string;
  fee_description?: string;
}

interface RecreationFeeListProps {
  data: RecreationFeeProps[];
}

const mapFeeCodeToDescription = (code: string): string => {
  const feeCodeMap: Record<string, string> = {
    C: 'Camping',
    D: 'Day Use',
    H: 'Hut',
    P: 'Parking',
    T: 'Trail Use',
  };

  return feeCodeMap[code] || 'Unknown Fee Type';
};

const RecreationFee: React.FC<RecreationFeeListProps> = ({ data }) => {
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDays = (fee: RecreationFeeProps) => {
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
      const value = fee[day as keyof RecreationFeeProps];
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
    <>
      {data.map((fee, index) => (
        <div key={index} className="mb-4">
          <p className="mb-1">${fee.fee_amount.toFixed(2)}</p>

          <p className="fw-bold mb-1 mt-3 pt-4 pb-3">Fee applies</p>
          <p className="mb-1 mt-2">
            {formatDate(fee.fee_start_date)} - {formatDate(fee.fee_end_date)}
          </p>
          <p className="mb-0">{formatDays(fee)}</p>
        </div>
      ))}
    </>
  );
};

export default RecreationFee;
