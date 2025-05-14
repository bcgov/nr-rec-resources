import { forwardRef } from 'react';
import RecreationFee from './RecreationFee';
import { SectionHeading } from '@/components/landing-page/components';
import { RecreationFeeModel } from '@/service/custom-models';

interface CampingProps {
  id: string;
  campsite_count?: number;
  fees?: RecreationFeeModel[];
}

const Camping = forwardRef<HTMLElement, CampingProps>(
  ({ id, campsite_count = 0, fees = [] }, ref) => {
    return (
      <section id={id} ref={ref}>
        <SectionHeading>Camping</SectionHeading>

        {campsite_count > 0 ? (
          <>
            <strong>Number of campsites</strong>
            <p>{campsite_count} campsites</p>
          </>
        ) : null}

        {Boolean(fees.length) && <RecreationFee data={fees} />}
      </section>
    );
  },
);

export default Camping;
