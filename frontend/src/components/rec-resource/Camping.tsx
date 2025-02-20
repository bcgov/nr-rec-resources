import {
  RecreationCampsiteDto,
  RecreationFeeDto,
} from '@/service/recreation-resource';
import { forwardRef } from 'react';
import RecreationFee from './RecreationFee';

interface CampingProps {
  recreation_campsite: RecreationCampsiteDto;
  fees: RecreationFeeDto;
}

const Camping = forwardRef<HTMLElement, CampingProps>(
  ({ recreation_campsite, fees }, ref) => {
    return (
      <section className="anchor-link" id="camping" ref={ref}>
        <h2 className="section-heading">Camping</h2>
        <strong>Number of campsites</strong>
        <p>{recreation_campsite?.campsite_count} campsites</p>
        {fees ? (
          <RecreationFee data={fees} />
        ) : (
          <p>No camping fees available.</p>
        )}{' '}
      </section>
    );
  },
);
export default Camping;
