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
  recreation_fee_code: number;
  fee_description: string;
}

const RecreationFee: React.FC<{ data: RecreationFeeProps }> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDays = () => {
    const daysMap: Record<string, string> = {
      monday_ind: 'Monday',
      tuesday_ind: 'Tuesday',
      wednesday_ind: 'Wednesday',
      thursday_ind: 'Thursday',
      friday_ind: 'Friday',
      saturday_ind: 'Saturday',
      sunday_ind: 'Sunday',
    };

    const selectedDays = Object.keys(daysMap).filter(
      (day) => data[day as keyof RecreationFeeProps] === 'y',
    );

    return selectedDays.length === 7
      ? 'All Days'
      : selectedDays.map((day) => daysMap[day]).join(', ');
  };

  return (
    <>
      <p className="fw-bold mb-3">Fees</p>
      <p className="mb-1">
        ${data.fee_amount.toFixed(2)} {data.fee_description}
      </p>

      <p className="fw-bold mb-1 mt-5">Fee applies</p>
      <p className="mb-1 mt-2">
        {formatDate(data.fee_start_date.toString())} -{' '}
        {formatDate(data.fee_end_date.toString())}
      </p>
      <p className="mb-0">{formatDays()}</p>
    </>
  );
};

export default RecreationFee;
