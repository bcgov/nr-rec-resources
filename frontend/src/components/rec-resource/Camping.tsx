import React, { forwardRef } from 'react';
import RecreationFee from './RecreationFee';

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

interface CampingProps {
  recreation_campsite: {
    campsite_count: number;
  };
  fees?: RecreationFeeProps[];
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

const groupFeesByCode = (fees: RecreationFeeProps[]) => {
  return fees.reduce<Record<string, RecreationFeeProps[]>>((acc, fee) => {
    if (!acc[fee.recreation_fee_code]) {
      acc[fee.recreation_fee_code] = [];
    }
    acc[fee.recreation_fee_code].push(fee);
    return acc;
  }, {});
};

const Camping = forwardRef<HTMLElement, CampingProps>(
  ({ recreation_campsite, fees = [] }, ref) => {
    // Filter camping fees
    const campingFees = fees.filter((fee) => fee.recreation_fee_code === 'C');

    // Filter and group additional fees
    const additionalFees = fees.filter(
      (fee) => fee.recreation_fee_code !== 'C',
    );
    const groupedAdditionalFees = groupFeesByCode(additionalFees);

    return (
      <section className="anchor-link" id="camping" ref={ref}>
        <h2 className="section-heading">Camping</h2>

        <strong>Number of campsites</strong>
        <p>{recreation_campsite?.campsite_count} campsites</p>

        {/* Camping Fees Section */}
        {campingFees.length > 0 ? (
          <>
            <p className="fw-bold mb-1 mt-3 pt-4 pb-3">Camping fee</p>
            <RecreationFee data={campingFees} />
          </>
        ) : (
          <p>No camping fees available.</p>
        )}

        {/* Additional Fees Section */}
        {additionalFees.length > 0 && (
          <>
            <h2 className="section-heading mt-5">Additional Fees</h2>
            {Object.entries(groupedAdditionalFees).map(([feeCode, feeList]) => (
              <div key={feeCode} className="mt-4">
                <p className="fw-bold mb-1 mt-3">
                  {mapFeeCodeToDescription(feeCode)} fee
                </p>
                <RecreationFee data={feeList} />
              </div>
            ))}
          </>
        )}
      </section>
    );
  },
);

export default Camping;
