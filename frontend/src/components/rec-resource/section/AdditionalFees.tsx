import { forwardRef } from 'react';
import RecreationFee from './RecreationFee';
import { SectionHeading } from '@/components/landing-page/components';
import { RecreationFeeModel } from '@/service/custom-models';

interface AdditionalFeesProps {
  id: string;
  fees: RecreationFeeModel[];
}

const AdditionalFees = forwardRef<HTMLElement, AdditionalFeesProps>(
  ({ id, fees = [] }, ref) => {
    return (
      <section id={id} ref={ref}>
        <SectionHeading>Additional fees</SectionHeading>
        <RecreationFee data={fees} />
      </section>
    );
  },
);

export default AdditionalFees;
