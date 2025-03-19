import { forwardRef } from 'react';
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
  id: string;
  title: string;
  showCampsiteCount?: boolean;
  recreation_campsite?: { campsite_count: number };
  fees?: RecreationFeeProps[];
}

const Camping = forwardRef<HTMLElement, CampingProps>(
  (
    { id, title, showCampsiteCount = true, recreation_campsite, fees = [] },
    ref,
  ) => (
    <section id={id} className="anchor-link" ref={ref}>
      <h2 className="section-heading">{title}</h2>

      {showCampsiteCount && recreation_campsite && (
        <>
          <strong>Number of campsites</strong>
          <p>{recreation_campsite.campsite_count} campsites</p>
        </>
      )}

      {fees.length > 0 ? (
        <RecreationFee data={fees} />
      ) : (
        <p>No fees available.</p>
      )}
    </section>
  ),
);

export default Camping;
