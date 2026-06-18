import { forwardRef } from 'react';
import { SectionHeading } from '@/components/landing-page/components';

interface CampingProps {
  id: string;
  campsite_count?: number;
}
//we can add Number of huts/cabings in this when we have
const Camping = forwardRef<HTMLElement, CampingProps>(
  ({ id, campsite_count = 0 }, ref) => {
    return (
      <section id={id} ref={ref}>
        <SectionHeading>Camping</SectionHeading>

        {campsite_count > 0 ? (
          <>
            <strong>Number of campsites</strong>
            <p>{campsite_count} campsites</p>
          </>
        ) : null}
      </section>
    );
  },
);

export default Camping;
